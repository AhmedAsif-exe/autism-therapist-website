import { Button } from "@mui/base";
import { useEffect, useState } from "react";
 import bannerImage from "Assets/Images/between_worlds.jpg";

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
          y: 20,
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
    <div className="relative">
      <div className="flex flex-col items-center t:flex-row l:justify-around justify-between items-start md:items-center min-h-screen px-10  xl:px-20 pt-28 bg-white rounded-b-[50%]">
        <div className="flex flex-col items-start max-w-full t:max-w-[45%] l:max-w-[50%] z-10 font-raleway">
          <p
            id="para1"
            className="text-[#f97544] opacity-0 text-[18px] font-semibold scale-90 m-0 font-inter"
          >
            Welcome to the Safe Space
          </p>
          <h1
            id="title"
            className="ml:text-[60px] mm:text-[40px] text-[25px] font-medium font-[raleway] ml:leading-[75px] text-[#265c7e] mb-5 text-left opacity-0 translate-y-5"
          >
            Your child deserves to live their best life
          </h1>
          <p
            id="para2"
            className="opacity-0 translate-y-5 mm:text-[18px] text-[14px] font-light pb-2 text-left m-0 font-inter"
          >
            Viverra enim sodales nunc sed ante cubilia. Phasellus sit
            scelerisque elit morbi natoque curabitur lectus adipiscing himenaeos
            bibendum.
          </p>
          <div
            id="button"
            className="opacity-0 scale-90 mt-5 flex flex-col ml:flex-row gap-3 w-full"
          >
            <a className="bg-[#265c7e] text-white text-[20px] px-5 py-2 rounded shadow-md font-londrina min-w-[150px]" href="#process-section">
              Discover More
            </a>
            <a className="border-2 border-[#f97544] text-[#f97544] text-[20px] px-5 py-2 rounded font-londrina min-w-[150px]" href="/contact">
              Contact
            </a>
          </div>
        </div>
        <div
          id="title-image"
          className={`opacity-0 l:mt-0 ml:mt-16 mt-5 l:[transform:perspective(1000px)_rotateY(-15deg)] min-h-[400px] l:min-w-[30%] self-center t:min-w-[40%] ml:min-w-[50%] min-w-full px-5 bg-cover bg-center bg-no-repeat shadow-[30px_40px_60px_rgba(0,0,0,0.3)]`}
          style={{
            backgroundImage: `url(${bannerImage})`,
            // transform: "perspective(1000px) rotateY(-15deg)",
            boxShadow: "8px -8px 0px 0px #f97544",
          }}
        />
      </div>
    </div>
  );
}
