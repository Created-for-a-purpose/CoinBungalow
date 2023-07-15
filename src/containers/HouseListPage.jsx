import React, { useState, useEffect, useRef } from "react";
import "../assets/styles/containers/HouseListPage.scss";
import Navbar from "../components/Navbar";
import HouseCard from "../components/HouseCard";
import { motion, useAnimation, useInView } from "framer-motion";
import { readContract } from 'wagmi/actions'
import { PdealAbi, PdealAddress, PnftAddress } from "../constants";
import { Polybase } from "@polybase/client";
const db = new Polybase({
  defaultNamespace: "pk/0x1a57dc69d2e8e6938a05bdefbebd62622ddbb64038f7347bd4fe8beb37b9bf40d5e8b62eaf9de36cbff52904b7f81bff22b29716021aaa8c11ee552112143259/CB",
});
const db_metadata = db.collection('PropertyNFTMetadata')

const HouseListPage = () => {
  const refBanner = useRef(true);
  const isInViewBanner = useInView(refBanner);
  const bannerAnimateControl = useAnimation();
  useEffect(() => {
    if (isInViewBanner) {
      bannerAnimateControl.stop();
      bannerAnimateControl.start({ opacity: 1, y: 0 });
    }
    if (!isInViewBanner) {
      bannerAnimateControl.stop();
      bannerAnimateControl.start({ opacity: 0, y: -200 });
    }
  }, [isInViewBanner, bannerAnimateControl]);

  const [props, setProps] = useState([
    {
    image: "https://img.freepik.com/free-photo/modern-residential-district-with-green-roof-balcony-generated-by-ai_188544-10276.jpg?w=1380&t=st=1688985038~exp=1688985638~hmac=e07c8fd49bea88bb8dd3df993178ec1c2b9c9c434df44392629f40e5dc2b4bb4",
    title: "House",
    address: "1234 Street",
    data: {
      rows: ["Bedrooms", "Bathrooms", "Area"],
      columns: ["3", "2", "2000 sqft"],
    },
  }
]);

  const loadMetadata = async (tokenIds) => {
    let props = [];
    for(let i=0; i<tokenIds.length; i++){
      const _tokenId = tokenIds[i].toString()
      const recordId = PnftAddress+_tokenId
      const { data } = await db_metadata.record(recordId).get()
      props.push({
        id: recordId,
        image: data.image,
        title: data.type,
        address: data.address,
        location: data.location,
        value: data.value,
        data: {
           rows: ['Age', 'Area', "Description"],
           columns: [data.age, data.size+' sqft', data.description]
        }
        })
      }
      setProps(props)
  }

  useEffect(() => {
    async function loadList(){
     const ListedProperties = await readContract({
        address: PdealAddress,
        abi: PdealAbi,
        functionName: "getListedProperties",
     })
     const listedProperties = await Promise.all(ListedProperties.map(async (property) => {
      const _tokenId = property.tokenId
      const isListed = await readContract({
        address: PdealAddress,
        abi: PdealAbi,
        functionName: "isListed",
        args: [_tokenId],
      })
      if (isListed)
      return property
    }))
    if(listedProperties[0] === undefined) return;
      const tokenIds = listedProperties.map((property) => property.tokenId)
      if(tokenIds.length === 0) return;
      await loadMetadata(tokenIds)
    }
    loadList();
  }, []);

  return (
    <>
      <Navbar />
      <div className="house_list_page_container">
        <motion.div
          className="house_list_page_container__banner"
          ref={refBanner}
          initial={{ opacity: 1 }}
          animate={bannerAnimateControl}
          transition={{ duration: 1 }}
        ></motion.div>
        <div className="house_list_page_container__searchbox_section">
          <div className="house_list_page_container__searchbox_section__searchbox">
            <input type="text" placeholder="Enter a location" />
          </div>
          <div className="house_list_page_container__searchbox_section__search_btn_container">
            <button>Search</button>
          </div>
        </div>
        { (props.length>0) &&
        <div className="house_list_page_container__house_list_section">
          {props.map((prop, index) => {
            return <HouseCard key={index} props={prop}></HouseCard>
})}
        </div>
}
      </div>
    </>
  );
};

export default HouseListPage;
