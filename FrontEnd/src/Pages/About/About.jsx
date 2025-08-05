import about from "Assets/Images/about-banner.jpg";
import faiza from "Assets/Images/faiza-pic.jpg";
import location from "Assets/Images/location.jpg";
import WhatIDoSection from "./WhatIDoSection";
import OurProcessSection from "./OurProcessSection";
import PerksSection from "./PerksSection";
import { useEffect } from "react";
import gsap from "gsap";
import Faq from "./Faq";
const meta = [
  {
    heading: "Our Vision on aba.virtual",
    src: faiza,
    remark: "Focused work real progress",
    content:
      "Hi! I’m Faiza Faizan the founder of aba.virtual &amp; a dedicated QASP who thrived as a coach and a remote ABA trainer. My journey in the filed of ABA started in 2018 back when I was RBT. I enjoyed being a home therapist, remedial therapist and also a clinician in the past. On the onset of COVID-19 I was trained to coach parents and other caregivers on the principles of Applied Behavior Analysis (ABA). Super reinforced by the outcomes my work became my passion. To this date I aspire to stretch my competencies to higher levels- in order to overcome challenges, for faster growth and extended learning for both caregivers and processionals. Aba.virtual is designed for caregivers, learners and therapists to promote independence on learning, having access to remote therapy and learning through engagement. ",
    reverse: false,
  },
  {
    heading: "Why ABA virtual?",
    src: location,
    remark: "A structure with flexibility and ease",
    content:
      "The vision is to apply ABA in different areas aiming to empower individuals & enhancing potentials to enhance their independence and quality of life. Our vision does not limit itself in providing therapy.The platform dedicates itself to provide easier support to learning individuals including caregivers, students and therapists based on evidence based strategies. The intention is to become a potent platform of accessibility in the areas that do not serve therapeutic services or have scarcity of resources. Aba.virtual extends its support and ambition in providing all services remotely while sitting at your convenient locations.",
    reverse: true,
  },
];

const About = ({ children }) => {
  useEffect(() => {
    const tl = gsap.timeline();

    tl.fromTo(
      "#about-line1",
      {
        text: {
          value: "",
          delimiter: "",
        },
      },
      {
        text: {
          value: "Know us better",
          delimiter: "",
        },
        duration: 1.5,
        ease: "none",
      }
    );

    tl.fromTo(
      "#about-line2",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1.5 },
      "<" // Start at same time as previous animation
    );
    tl.fromTo(
      "#about-line3",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1.5 },
      "<" // Start at same time as previous animation
    );
    tl.fromTo(
      "#about-image",
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 1.5 },
      "<" // Start at same time as previous animation
    );
  }, []);
  return (
    <>
      <div className="mt-[120px] l:px-[100px] px-[25px]">
        <div id="about-section" className="mt-12 text-center">
          <h3
            id="about-line1"
            className="text-[#28a5a8] t:text-xl text-md my-1 font-semibold"
          >
            Know us better
          </h3>

          <h1 id="about-line2" className="t:text-5xl font-bold my-1 text-2xl">
            About
            <span className="ml-3" style={{ color: "#265C7E" }}>
              aba<span style={{ color: "#f97544" }}>.virtual</span>
            </span>
          </h1>

          <p id="about-line3" className="mt-3 text-sm">
            Making lives a bit simpler and easier at each step
          </p>

          <img
            id="about-image"
            src={about}
            alt="about"
            className="mb-8 mt-4 w-full"
          />
        </div>

        {meta.map((m, idx) => (
          <WhatIDoSection {...m} key={idx} idx={idx} />
        ))}
        <PerksSection />
        <OurProcessSection />
      </div>
      <Faq />
    </>
  );
};
export default About;
