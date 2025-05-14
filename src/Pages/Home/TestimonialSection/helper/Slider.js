import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronRight,
  faChevronLeft,
} from "@fortawesome/free-solid-svg-icons";
import style from "./Slider.module.css";

export default (props) => {
  const [activeSlide, setactiveSlide] = useState(props.activeSlide);

  const next = () =>
    setactiveSlide(Math.min(activeSlide + 1, props.data.length - 1));

  const prev = () => setactiveSlide(Math.max(activeSlide - 1, 0));

  const getStyles = (index) => {
    if (activeSlide === index)
      return {
        opacity: 1,
        transform: "translateX(0px) translateZ(0px) rotateY(0deg)",
        zIndex: 10,
      };
    else if (activeSlide - 1 === index)
      return {
        opacity: 1,
        transform: "translateX(-240px) translateZ(-400px) rotateY(35deg)",
        zIndex: 9,
      };
    else if (activeSlide + 1 === index)
      return {
        opacity: 1,
        transform: "translateX(240px) translateZ(-400px) rotateY(-35deg)",
        zIndex: 9,
      };
    else if (activeSlide - 2 === index)
      return {
        opacity: 1,
        transform: "translateX(-480px) translateZ(-500px) rotateY(35deg)",
        zIndex: 8,
      };
    else if (activeSlide + 2 === index)
      return {
        opacity: 1,
        transform: "translateX(480px) translateZ(-500px) rotateY(-35deg)",
        zIndex: 8,
      };
    else if (index < activeSlide - 2)
      return {
        opacity: 0,
        transform: "translateX(-480px) translateZ(-500px) rotateY(35deg)",
        zIndex: 7,
      };
    else if (index > activeSlide + 2)
      return {
        opacity: 0,
        transform: "translateX(480px) translateZ(-500px) rotateY(-35deg)",
        zIndex: 7,
      };
  };
  console.log(activeSlide);
  return (
    <>
      {/* carousel */}
      <div className={style["slideC"]}>
        {props.data.map((item, i) => (
          <React.Fragment key={item.id}>
            <div
              className={style["slide"]}
              style={{
                background: item.bgcolor,
                boxShadow: `0 5px 20px ${item.bgcolor}30`,
                ...getStyles(i),
              }}
            >
              <SliderContent {...item} />
            </div>
            <div
              className={style["reflection"]}
              style={{
                backgroundImage: `linear-gradient(to bottom, rgba(255, 255, 255, 0.90) 50%, white 100%), url(${item.flag})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                // borderRadius: 0,
                ...getStyles(i),
              }}
            />
          </React.Fragment>
        ))}
      </div>
      {/* carousel */}

      <div className="btns">
        {activeSlide > 0 && (
          <button
            className={style["btn"]}
            onClick={prev}
            style={{ background: "transparent", border: "none" }}
          >
            <FontAwesomeIcon
              className={style["btn"]}
              onClick={prev}
              icon={faChevronLeft}
              color="#EC5923"
              size="2x"
            />
          </button>
        )}
        {activeSlide < props.data.length - 1 && (
          <button
            className={style["btn"]}
            onClick={next}
            style={{ background: "transparent", border: "none" }}
          >
            <FontAwesomeIcon
              className={style["btn"]}
              onClick={next}
              icon={faChevronRight}
              color="#EC5923"
              size="2x"
            />
          </button>
        )}
      </div>
    </>
  );
};

const SliderContent = (props) => {
  return (
    <div className={style["sliderContent"]}>
      <p>&ldquo;{props.message}&rdquo;</p>
      <p> by {props.name}</p>
      <p>{props.title}</p>
    </div>
  );
};
