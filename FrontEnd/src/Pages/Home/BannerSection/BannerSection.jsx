import { Button } from "@mui/base";
import { useEffect, useState } from "react";
import style from "./BannerSection.module.css";
import src from "../../../Assets/Images/boy-on-therapy-swing.jpg";
import eclipse1 from "../../../Assets/Images/Ellipse 1.png";
import eclipse2 from "../../../Assets/Images/Ellipse 2.png";
import eclipse3 from "../../../Assets/Images/Ellipse 3.png";
import gsap from "gsap";

export default function BannerSection() {
  useEffect(() => {
    const tl1 = gsap.timeline();
    tl1
      .to("#title-image", {
        duration: 1,
        opacity: 1,
        delay: 1,
      })
      .to(
        "#title-image",
        {
          y: 40,
          yoyo: true,
          repeat: -1,
          duration: 3,
          ease: "power1.inOut",
        },
        "-=0.5"
      );

    const tl2 = gsap.timeline();
    tl2
      .to("#title", {
        duration: 1,
        opacity: 1,
        delay: 1,
        y: 0,
      })
      .to(
        "#para2",
        {
          duration: 1,
          opacity: 1,
          y: 0,
        },
        "-=0.5"
      )
      .to(
        "#button",
        {
          duration: 1,
          scaleX: 1,
          opacity: 1,
        },
        "-=0.5"
      )
      .to(
        "#para1",
        {
          opacity: 1,
          duration: 1,
          scaleX: 1,
        },
        "-=0.5"
      );
  }, []);

  return (
    // <div className={style["banner-section"]} id="bg" >
    //   <div className={style["title-cta"]}>
    //     <h1 id="title">Dedicated to supporting children on the spectrum</h1>

    //     <p id="para">We provide specialized therapy for children with autism,</p>
    //     <p id="para">Fostering growth and learning in a safe, nurturing environment.</p>
    //     <p id="para">Our experienced team works closely with families</p>
    //     <p id="para">To develop personalized strategies that empower children to thrive.</p>

    //     <div className={style["button-container"]} id="button">
    //       <Button>Discover More</Button>
    //       <Button>Contact</Button>
    //     </div>
    //   </div>
    // </div>
    <div className={style["cover"]}>
      <div className={style["banner-section"]}>
        <div className={style["title-cta"]}>
          <p id="para1">Welcome to the Safe Space</p>
          <h1 className={style["title"]} id="title">
            Your child deserves to live their best life
          </h1>
          <p id="para2">
            Viverra enim sodales nunc sed ante cubilia. Phasellus sit
            scelerisque elit morbi natoque curabitur lectus adipiscing himenaeos
            bibendum.
          </p>
          <div className={style["button-container"]} id="button">
            <Button>Discover More</Button>
            <Button>Contact</Button>
          </div>
        </div>
        <div className={style["image"]} id="title-image"></div>
      </div>{" "}
    </div>
    // <div style={containerStyle}>
    //     <div
    //       onMouseEnter={() => setIsHovered(true)}
    //       onMouseLeave={() => setIsHovered(false)}
    //       style={cardStyle}
    //     >
    //       Hover Me
    //       <div style={shadowStyle}></div>
    //     </div>
    //   </div>
  );
}
