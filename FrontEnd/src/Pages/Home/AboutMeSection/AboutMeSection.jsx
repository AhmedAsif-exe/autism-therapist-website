import style from "./AboutMeSection.module.css";
import faiza from "../../../Assets/Images/faiza.jpeg";
import arrow from "../../../Assets/Icons/arrow.svg";
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
    <div className={style["about-us-section"]} id="about-section">
      <div className={style["title-cta"]}>
        <h2 id="about-heading">About Me</h2>
        <p className={style["content"]}>
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
        </p>{" "}
        <a className={`${style["see-more"]} hover:underline`} href="/about">
          See More <span> &rarr;</span>
        </a>
      </div>

      <img src={faiza} className={style["image"]} />
    </div>
  );
}
