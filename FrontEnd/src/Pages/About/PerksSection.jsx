import { duration, List, ListItem, ListItemAvatar } from "@mui/material";
import { CheckCircleOutline } from "@mui/icons-material";
import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import expertise from "Assets/Images/expertise.jpg";
import { opacity } from "@cloudinary/url-gen/actions/adjust";
const faizaExpertise = [
  "I primarily work with children diagnosed with ASD, up to 10 years old.",
  "I track skill development and behavior changes to guide interventions.",
  "I have telehealth experience since the onset of COVID-19.",
  "I coach parents, caregivers, and therapists virtually across settings.",
  "I enjoy analyzing behavior data to track progress and regressions.",
  "My QASP-S credential allows me to create IEPs, ICPs, and BIPs.",
  "I design my own resources, based on research and individual needs.",
];
const PerksSection = () => {
  useEffect(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#expertise",
        start: "top center",
        once: true,
      },
    });

    for (let idx = 0; idx < faizaExpertise.length; idx++) {
      tl.fromTo(
        `#expertise-${idx}`,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4 }
      );
    }
    tl.fromTo(
      "#expertise-img",
      { opacity: 0, scale: 0 },
      { opacity: 1, scale: 1, duration: 1.5 },
      "0"
    );
  }, []);
  return (
    <div className="l:px-[5%] flex flex-col l:my-[60px] my-[40px]" id="expertise">
      <h2
        className="l:text-[70px] text-[50px] font-[raleway] italic-not text-[#f97544] mb-[30px] text-center m-0"
        id="expertise-heading"
      >
        Expertise
      </h2>
      <div className="flex t:flex-row flex-col items-center gap-6 justify-around">
        {/* Image will match List's height via flex behavior */}
        <img
          src={expertise}
          alt="expertise"
          className="h-full l:w-[30%] ml:w-[40%] w-full mt-10"
        />

        <List className="flex flex-col justify-around l:w-[60%] t:w-[90%] w-full">
          {faizaExpertise.map((item, index) => (
            <ListItem
              key={index}
              className="flex items-start"
              id={`expertise-${index}`}
            >
              <CheckCircleOutline
                sx={{ color: "#28a5a8", marginRight: "10px", marginTop: "3px" }}
              />
              {item}
            </ListItem>
          ))}
        </List>
      </div>
    </div>
  );
};

export default PerksSection;
