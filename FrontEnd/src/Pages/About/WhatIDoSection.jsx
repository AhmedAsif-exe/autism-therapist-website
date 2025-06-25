import { useEffect } from "react";
import gsap from "gsap";

export default function WhatIDoSection({
  heading,
  remark,
  src,
  content,
  reverse,
  idx,
}) {
  useEffect(() => {
    const t2 = gsap.timeline({
      scrollTrigger: {
        trigger: `#me-${idx}`,
        start: "top center",
        once: true,
      },
    });

    t2.fromTo(
      `#me-${idx}-heading`,
      {
        text: {
          value: "",
          delimiter: "",
        },
      },
      {
        text: {
          value: heading,
          delimiter: "",
        },
        duration: 1.5,
        ease: "none",
      }
    );

    t2.fromTo(
      `#me-${idx}-img`,
      { opacity: 0, x: reverse ? 100 : -100 },
      { opacity: 1, x: 0, duration: 1.5 },
      "<"
    );
    t2.fromTo(
      `#me-${idx}-content`,
      { opacity: 0, x: reverse ? -100 : 100 },
      { opacity: 1, x: 0, duration: 1.5 },
      "<"
    );
  }, []);
  return (
    <div id={`me-${idx}`} className="mt-10 mb-20">
      <h2
        className={`l:text-[35px] t:text-[30px] ml:text-[25px] text-[20px] font-[Raleway] text-[#f97544] mb-4 ${
          reverse ? "text-right" : "text-left"
        }`}
        id={`me-${idx}-heading`}
      >
        {heading}
      </h2>
      <div
        className={`flex justify-between items-start ${
          reverse ? "l:flex-row-reverse" : "l:flex-row"
        } flex-col `}
      >
        <div
          id={`me-${idx}-img`}
          className={`l:min-w-[50%] ml:min-w-[70%] min-w-[100%] ${reverse ? "self-end" : "self-start"} ml:min-h-[400px] min-h-[300px] rounded-[5px] bg-cover bg-no-repeat`}
          style={{
            backgroundImage: `url(${src})`,
            backgroundPosition: reverse ? "center" : "left",
          }}
        />
        <div id={`me-${idx}-content`} className="flex flex-col l:mt-0 mt-4 l:max-w-[45%]">
          <h3 className="text-[#28a5a8] text-[18px]  text-start mt-2 t:mb-6">
            /// {remark} ///
          </h3>
          <p className="text-[20px] text-justify mb-2">{content}</p>
        </div>
      </div>
    </div>
  );
}
