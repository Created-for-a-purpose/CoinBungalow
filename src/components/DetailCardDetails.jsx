import React from "react";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../assets/styles/components/DetailCardDetails.scss";
import { AnimatePresence, motion } from "framer-motion";
import GetLoanBox from "./GetLoanBox";
import { LoanAbi, LoanAddress } from '../constants'
import { readContract } from "wagmi/actions";
import { Polybase } from "@polybase/client";
import Loader from "./Loader";

const db = new Polybase({
  defaultNamespace: "pk/0x1a57dc69d2e8e6938a05bdefbebd62622ddbb64038f7347bd4fe8beb37b9bf40d5e8b62eaf9de36cbff52904b7f81bff22b29716021aaa8c11ee552112143259/CB",
});

const db_metadata = db.collection("PropertyNFTMetadata");

const DetailCardDetails = ({recordId, buttons, collateral, handleClose}) => {
  const { pathname } = useLocation();
  const [image, setImage] = useState('')
  const [entries, setEntries] = useState([
    ["Bedrooms", "3"],
    ["Bathrooms", "2"],
    ["Area", "2000 sqft"],
    [
      "Description",
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Delectus ducimus ullam, commodi excepturi ipsa dolor exercitationem, natus veritatis maxime reiciendis ex iure dolorum minus iste. Voluptatibus aut laborum molestiae facilis.",
    ],
    ["Price", "1000"],
  ]);
  const [loanEntries, setLoanEntries] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadMetadata(){
     const { data } = await db_metadata.record(recordId).get()
     setImage(data.image)
     let entries=[], entry=[]
      entry = ["Property", data.type]
      entries.push(entry)
      entry = ["Address", data.address]
      entries.push(entry)
      entry = ["State, Country", data.location]
      entries.push(entry)
      entry = ["Pin", data.pincode]
      entries.push(entry)
      entry=['Property Age', data.age]
      entries.push(entry)
      entry=['Area', data.size+' sqft']
      entries.push(entry)
      entry=['Description', data.description]
      entries.push(entry)
      entry=['Estimated value', data.value+' MATIC']
      entries.push(entry)
      entry=['Google maps', <a href={data.maps} style={{color: 'lightskyblue'}}>View</a>]
      entries.push(entry)
      setEntries(entries)
    }

    async function loadLendMetadata(){
      const tokenId = recordId.slice(42)
      const loanDetails= await readContract({
        address: LoanAddress,
        abi: LoanAbi,
        functionName: 'loanRequest',
        args: [tokenId]
      })
      const _loanData = loanDetails[5].split(', ')
      const amount = _loanData[0];
      const duration = _loanData[1];
      let entries=[], entry=[]
      entry = ['Borrower', loanDetails[1].slice(0,6)+'...'+loanDetails[1].slice(37,42)]
      entries.push(entry)
      entry = ['Loan Amount', amount+' MATIC']
      entries.push(entry)
      entry = ['Interest', loanDetails[2].toString()/100+'%']
      entries.push(entry)
      entry = ['Duration', duration]
      entries.push(entry)
      setLoanEntries(entries)
    }

    if(pathname.includes('lend'))
    loadLendMetadata()
    // else
    loadMetadata()
    setIsLoading(false);
  }, []);

  if(isLoading === true) {
    return <Loader></Loader>
  }
  return (
    <>
      <div className="detail_card_details_container">
        <div className="detail_card_details_container__left">
          <div className="detail_card_details_container__left__image_container">
            <img
              className="detail_card_details_container__left__image_container__image"
              src={image}
              alt="property"
            ></img>
          </div>
        </div>
        <div className="detail_card_details_container__right">
          <div className="detail_card_details_container__right__info">
            <div className="detail_card_details_container__right__info__table"><h3>Property details</h3>
              <div className="detail_card_details_container__right__info__table__rows">
                {entries.map((entry, index) => {
                  return (
                    <>
                      <div
                        className="detail_card_details_container__right__info__table__rows__entry_name"
                        key={index}
                      >
                        {entry[0]}
                      </div>
                      <div
                        className="detail_card_details_container__right__info__table__rows__entry_value"
                        key={index}
                      >
                        {entry[1]}
                      </div>
                    </>
                  );
                })}
              </div>
                { loanEntries.length>0 &&
              <>
              <h3>Loan details</h3>
              <div className="detail_card_details_container__right__info__table__rows">
                {loanEntries.map((entry, index) => {
                  return (
                    <>
                      <div
                        className="detail_card_details_container__right__info__table__rows__entry_name"
                        key={index}
                      >
                        {entry[0]}
                      </div>
                      <div
                        className="detail_card_details_container__right__info__table__rows__entry_value"
                        key={index}
                      >
                        {entry[1]}
                        </div>
                    </>)} )}
                    </div>
                    </>}
            </div>
          </div>
          <div className="detail_card_details_container__right__button_container">
            {buttons}
          </div>
        </div>
        <AnimatePresence mode="wait">
          {collateral && (
            <motion.div
              className="my_card_detail_page_container__loan_section"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
              exit={{ opacity: 0 }}
            >
              <GetLoanBox loanId={recordId} entries={entries} image={image} handleClose={handleClose} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default DetailCardDetails;
