import style from "./OurProcessSection.module.css";
import Card from "../../../Utils/Card/Card";
import gsap from "gsap";
import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, useState } from "react";
import session from "../../../Assets/Icons/session-meeting.svg";
import assessment from "../../../Assets/Icons/assesment-phase.png";
import supervisor from "../../../Assets/Icons/supervisor-review.png";
import rapport from "../../../Assets/Icons/rapport-building.png";
import parentCommitments from "../../../Assets/Icons/parent-commitment.png";
import therapyPlanning from "../../../Assets/Icons/planning.png";

const therapySteps = [
  {
    heading: "Initial Consultation",
    description:
      "Meet with caregivers to gather a holistic history (medical, educational, behavioral) of the student.",
    src: session, // Add image source here
  },
  {
    heading: "Assessment Phase",
    description:
      "Conduct indirect interviews and virtual assessments (3+ days) to evaluate skills and behaviors across domains.",
    src: assessment, // Add image source here
  },
  {
    heading: "Supervisor Review",
    description:
      "Submit assessment findings and proposed interventions to the supervisor for approval and feedback.",
    src: supervisor, // Add image source here
  },
  {
    heading: "Rapport Building",
    description:
      "Begin engaging with the student through preferred online activities to build trust and familiarity.",
    src: rapport, // Add image source here
  },
  {
    heading: "Parent Commitments",
    description:
      "Parents must sign consent and Telehealth forms and provide necessary documents before therapy starts.",
    src: parentCommitments, // Add image source here
  },
  {
    heading: "Therapy Planning",
    description:
      "Create and explain the IEP and BIP, ensuring caregivers are trained in their use and understand session expectations.",
    src: therapyPlanning, // Add image source here
  },
];

export default function OurProcessSection() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".our-process-section",
        start: "top top", // scroll starts when container hits top
        end: "+=1000", // how far to scroll (in pixels)
        scrub: 1, // ties timeline to scroll progress
        pin: true, // optional: pins container in place

        delay: 1, // delay before starting the animation
      },
    });

    tl.to(
      "#our-process-header",
      {
        opacity: 1,
        y: 0,
        duration: 1,
      },
      "-=0.5"
    )
      .to(
        "#our-process-sub-heading",
        {
          opacity: 1,
          y: 0,
          duration: 1,
        },
        "-=0.5"
      )
      .to("#card:nth-child(1)", {
        opacity: 1,
        y: 0,
        duration: 1,
      })
      .to(
        "#card:nth-child(2)",
        {
          opacity: 1,
          y: 0,
          duration: 1,
        },
        "-=0.5"
      ) // Start the second card after a 0.2s delay
      .to(
        "#card:nth-child(3)",
        {
          opacity: 1,
          y: 0,
          duration: 1,
        },
        "-=0.5"
      ) // Continue for other cards with the same pattern
      .to(
        "#card:nth-child(4)",
        {
          opacity: 1,
          y: 0,
          duration: 1,
        },
        "-=0.5"
      ) // Continue for other cards with the same pattern
      .to(
        "#card:nth-child(5)",
        {
          opacity: 1,
          y: 0,
          duration: 1,
        },
        "-=0.5"
      )
      .to(
        "#card:nth-child(6)",
        {
          opacity: 1,
          y: 0,
          duration: 1,
        },
        "-=0.5"
      );
  }, []);

  return (
    <div className={style["our-process-section"]}>
      <h2 className={style["heading"]} id="our-process-header">
        Our Process
      </h2>
      <p className={style["sub-heading"]} id="our-process-sub-heading">
        The process of delivering therapy virtually is designed in a structured
        however, simple manner. The work is designed and organized for best
        convenience of coaching therapist and caregivers.
      </p>
      <div className={style["process-grid"]} id="carousel">
        {therapySteps.map((step, stepNumber) => (
          <Card {...step} stepNumber={stepNumber + 1} />
        ))}
      </div>
    </div>
  );
}
