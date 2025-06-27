 import faiza from "Assets/Images/faiza.jpeg";
import aboutUs from "Assets/Images/About-Us-bg.png";
import { useEffect } from "react";
import gsap from "gsap";
export default function WhatIDoSection() {
  useEffect(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        start: "top center",
        trigger: "#about-section",
        once: true,
      },
    });

    tl.fromTo(
      "#about-section",
      {
        clipPath: "inset(0% 0% 100% 0%)",
        maxHeight: 0,
        overflow: "hidden",
      },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        maxHeight: 1000,
        duration: 3,
        ease: "power2.out",
      }
    );
    tl.fromTo(
      "#about-heading",
      {
        text: {
          value: "",
          delimiter: "",
        },
      },
      {
        text: {
          value: "About Me",
          delimiter: "",
        },
        duration: 1.5,
        ease: "none",
      },
      "<"
    );
  }, []);
  return (
    <div
      className=" bg-cover bg-bottom bg-no-repeat py-10 relative flex flex-col-reverse t:flex-row max-w-fit flex-wrap t:flex-nowrap"
      id="about-section"
      style={{ backgroundImage: `url(${aboutUs})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-[#042539b5] z-10"></div>

      {/* Text Content */}
      <div className="w-full t:w-[70%] z-20 flex flex-col items-start font-[raleway] px-6 py-6 t:px-12 text-white">
        <h2 className="text-[40px] t:text-[60px] font-bold mb-2 text-left">
          About Me
        </h2>
        <p className="text-white text-sm t:text-base font-medium mb-4 text-left">
          Hello! My name is Faiza Faizan and I am a Qualified Autism Service
          Practitioner and Supervisor (QASP-S) from a reputable credentialing
          board QABA. I have dedicated my work in coaching and supporting
          parents, therapist and caregivers of individuals with Autism (mostly).
          My work revolves around training, formulating behavior and
          individualized educational plans and tracking its progress. I work
          closely with clients, families, and other professionals to ensure that
          therapy is tailored to each person’s unique needs. My goal in
          providing therapy is to empower individuals by helping them build
          communication, social, and daily living skills, ultimately enhancing
          their independence and quality of life.
        </p>
        <a
          href="/about"
          className="self-end font-medium inline-flex items-center text-white hover:underline transition-all duration-300"
        >
          See More <span className="ml-1">&rarr;</span>
        </a>
      </div>

      {/* Profile Image */}
      <div className="w-full t:w-auto flex justify-center items-center z-20 p-6">
        <img
          src={faiza}
          className="rounded-full w-[250px] h-[250px] ml:w-[300px] ml:h-[300px] border-2 border-white p-1 object-cover"
          alt="Faiza Faizan"
        />
      </div>
    </div>
  );
}
