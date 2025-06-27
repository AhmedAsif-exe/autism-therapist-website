import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronRight,
  faChevronLeft,
} from "@fortawesome/free-solid-svg-icons";
import style from "./Slider.module.css";
import gsap from "gsap";
import { display } from "@mui/system";
const Slider = (props) => {
  const [activeSlide, setactiveSlide] = useState(props.activeSlide);
  const [dim, setDim] = useState({ x: 240, z: 400 });
  const next = () =>
    setactiveSlide(Math.min(activeSlide + 1, props.data.length - 1));

  const prev = () => setactiveSlide(Math.max(activeSlide - 1, 0));
  useEffect(() => {
    const handlechange = () => {
      // Get screen width once when rendering
      const screenWidth = window.innerWidth;

      // Adjust base offset and depth depending on screen size

      if (screenWidth <= 769) setDim({ x: 120, z: 200 });
      else if (screenWidth <= 1024) setDim({ x: 180, z: 300 });
      else if (screenWidth <= 426) setDim({ x: 60, z: 100 });
      else if (screenWidth <= 376) setDim({ x: 0, z: 0 });
    };
    window.addEventListener("resize", handlechange);
  }, []);
  const getStyles = (index) => {
    const ll = dim.x === 60 && dim.z === 100;

    const ml = dim.x === 0 && dim.z === 0;
    if (activeSlide === index) {
      return {
        opacity: 1,
        transform: `translateX(0px) translateZ(0px) rotateY(0deg)`,
        zIndex: 10,
      };
    } else if (activeSlide - 1 === index) {
      return {
        opacity: 1,
        transform: `translateX(-${dim.x}px) translateZ(-${dim.z}px) rotateY(35deg)`,
        zIndex: 9,
      };
    } else if (activeSlide + 1 === index) {
      return {
        opacity: 1,
        transform: `translateX(${dim.x}px) translateZ(-${dim.z}px) rotateY(-35deg)`,
        zIndex: 9,
      };
    } else if (activeSlide - 2 === index) {
      return {
        display: ll && "none",
        opacity: 1,
        transform: `translateX(-${dim.x * 2}px) translateZ(-${
          dim.z + 100
        }px) rotateY(35deg)`,
        zIndex: 8,
      };
    } else if (activeSlide + 2 === index) {
      return {
        display: ll && "none",
        opacity: 1,
        transform: `translateX(${dim.x * 2}px) translateZ(-${
          dim.z + 100
        }px) rotateY(-35deg)`,
        zIndex: 8,
      };
    } else if (index < activeSlide - 2) {
      return {
        opacity: 0,
        transform: `translateX(-${dim.x * 2}px) translateZ(-${
          dim.z + 100
        }px) rotateY(35deg)`,
        zIndex: 7,
      };
    } else if (index > activeSlide + 2) {
      return {
        opacity: 0,
        transform: `translateX(${dim.x * 2}px) translateZ(-${
          dim.z + 100
        }px) rotateY(-35deg)`,
        zIndex: 7,
      };
    }
  };

  useEffect(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#testimonial-container",
        start: "top center",
        once: true,
      },
    });
    for (let idx = 0; idx < props.data.length; idx++) {
      tl.fromTo(
        `#testimonial-card-${idx}`,
        { opacity: 0 },
        { opacity: 1, duration: 0.3 }
      );
      tl.fromTo(
        `#testimonial-card-reflection-${idx}`,
        { opacity: 0 },
        { opacity: 1, duration: 0.3 },
        "<"
      );
    }
  }, []);
  return (
    <>
      {/* carousel */}
      <div className={style["slideC"]} id="testimonial-container">
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
              <SliderContent {...item} index={i} />
            </div>
            <div
              className={style["reflection"]}
              id={`testimonial-card-reflection-${i}`}
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
export default Slider;
const SliderContent = (props) => {
  return (
    <div
      className={style["sliderContent"]}
      id={`testimonial-card-${props.index}`}
    >
      <p>&ldquo;{props.message}&rdquo;</p>

      <p>by {props.name}</p>
      <p>{props.title}</p>
    </div>
  );
};
