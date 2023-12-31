import React, { useEffect, useRef } from "react";
import "../assets/styles/components/HouseCard.scss";
import CardTable from "./CardTable";
import { motion, useAnimation, useInView } from "framer-motion";
import {useLocation, useNavigate } from "react-router-dom";

const HouseCard = ({ props }) => {
  const { id, image, data, title, address, location, value } = props;
  const refCard = useRef(null);
  const refCardEnd = useRef(null);
  const isInView = useInView(refCard);
  const isInViewEnd = useInView(refCardEnd);
  const cardAnimateControl = useAnimation();

  const {pathname} = useLocation();
  const navigate = useNavigate();

  const handleDetail = () => {
    if(pathname === "/buy-house" || pathname === "/buy-land") {
      navigate(`/buy/${id}`);
    }
    else if(pathname === "/sell-house" || pathname === "/sell-land" || pathname === "/my-nfts" || pathname === "/borrow") {
      navigate(`/my-nfts/${id}`);
    }
    else if(pathname === "/lend") {
      navigate(`/lend/${id}`);
    }
  };

  useEffect(() => {
    if (isInView) {
      cardAnimateControl.stop();
      cardAnimateControl.start({
        opacity: 1,
        x: 0,
        transition: { duration: 0.5 },
      });
    } else if(!isInViewEnd) {
      cardAnimateControl.stop();
      cardAnimateControl.start({
        opacity: 0,
        x: -100,
      });
    }
  }, [isInView, cardAnimateControl, isInViewEnd]);
  return (
    <motion.div
      className="house_card_container"
      animate={cardAnimateControl}
      initial={{ opacity: 0, x: -100 }}
      duration={0.5}
      ref={refCardEnd}
      onClick={handleDetail}
    >
      <div className="house_card_container__left">
        <div className="house_card_container__left__image_container">
          <img
            src={image}
            alt="house"
            className="house_card_container__left__image_container__image"
          />
        </div>
      </div>
      <div className="house_card_container__right">
        <div className="house_card_container__right__title_container">
          <div className="house_card_container__right__title_container__title">
            {title}
          </div>
          <div className="house_card_container__right__title_container__subtitle">
            {address}
          </div>
          <div className="house_card_container__right__title_container__subtitle">
            {location}
          </div>
        </div>{" "}
        <div className="house_card_container__right__description">
          <div className="house_card_container__right__description__table">
            <CardTable props={data}></CardTable>
          </div>
        </div>{" "}
        <div className="house_card_container__right__price">
          <div className="house_card_container__right__price__title">Price</div>
          <div
            className="house_card_container__right__price__price"
            ref={refCard}
          >
            {value} MATIC
          </div>
        </div>{" "}
      </div>
    </motion.div>
  );
};

export default HouseCard;
