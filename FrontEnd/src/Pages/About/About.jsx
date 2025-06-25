import about from "Assets/Images/about-banner.jpg";
import faiza from "Assets/Images/faiza.jpeg";
import location from "Assets/Images/location.jpg";
import WhatIDoSection from "./WhatIDoSection";
import OurProcessSection from "./OurProcessSection";
import PerksSection from "./PerksSection";
import { useEffect } from "react";
import gsap from "gsap";
const meta = [
  {
    heading: "Empowering Autism Support Through Expert Guidance",
    src: faiza,
    remark: "Expert care. Real progress",
    content:
      "Hello! My name is Faiza Faizan and I am a Qualified Autism Service Practitioner and Supervisor (QASP-S) from a reputable credentialing board QABA. I have dedicated my work in coaching and supporting parents, therapists, and caregivers of individuals with Autism (mostly). My work revolves around training, formulating behavior and individualized educational plans, and tracking its progress. With a strong foundation in evidence-based practices, I strive to create meaningful change in the lives of those I support.",
    reverse: false,
  },
  {
    heading: "Personalized Autism Therapy for Meaningful Growth",
    src: location,
    remark: "Therapy that fits your needs",
    content:
      "I work closely with clients, families, and other professionals to ensure that therapy is tailored to each person’s unique needs. My goal in providing therapy is to empower individuals by helping them build communication, social, and daily living skills, ultimately enhancing their independence and quality of life. Each step of the journey is guided by compassion, evidence-based strategies, and a deep respect for every individual’s potential.",
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
          value: "Know Everything... About Me",
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
    <div className="mt-[120px] l:px-[100px] px-[25px]">
      <div id="about-section" className="mt-12 text-center">
        <h3
          id="about-line1"
          className="text-[#28a5a8] t:text-xl text-md my-1 font-semibold"
        >
          Know Everything... About Me
        </h3>

        <h1 id="about-line2" className="t:text-5xl font-bold my-1 text-2xl">
          About
          <span className="ml-3" style={{ color: "#265C7E" }}>
            aba<span style={{ color: "#f97544" }}>.virtual</span>
          </span>
        </h1>

        <p id="about-line3" className="mt-3 text-sm">
          Empowering growth through evidence-based autism therapy resources and
          tools.
        </p>

        <img id="about-image" src={about} alt="about" className="mb-8 mt-4 w-full" />
      </div>

      {meta.map((m, idx) => (
        <WhatIDoSection {...m} key={idx} idx={idx} />
      ))}
      <PerksSection />
      <OurProcessSection />
      {/* <ExpertiseSection /> */}
    </div>
  );
};
export default About;
