import session from "Assets/Icons/session-meeting.png";
import assessment from "Assets/Icons/assesment-phase.png";
import supervisor from "Assets/Icons/supervisor-review.png";
import rapport from "Assets/Icons/rapport-building.png";
import parentCommitments from "Assets/Icons/parent-commitment.png";
import therapyPlanning from "Assets/Icons/planning.png";
// import {
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import style from "./BallAnimation.module.css";
import Card from "Utils/Card/Card";
//   VerticalTimeline,
//   VerticalTimelineElement,
// } from "react-vertical-timeline-component";
// import "react-vertical-timeline-component/style.min.css";
const therapySteps = [
  {
    heading: "Initial Consultation",
    description:
      "Meet with caregivers to gather a holistic history (medical, educational, behavioral) of the student. This step helps build a foundational understanding of the student's needs and sets the tone for a collaborative process moving forward.",
    src: session, // Add image source here
  },
  {
    heading: "Assessment Phase",
    description:
      "Conduct indirect interviews and virtual assessments (3+ days) to evaluate skills and behaviors across domains. The data collected during this phase informs the development of targeted intervention strategies.",
    src: assessment, // Add image source here
  },
  {
    heading: "Supervisor Review",
    description:
      "Submit assessment findings and proposed interventions to the supervisor for approval and feedback. This ensures that clinical decisions are aligned with best practices and tailored to the student's individual goals.",
    src: supervisor, // Add image source here
  },
  {
    heading: "Rapport Building",
    description:
      "Begin engaging with the student through preferred online activities to build trust and familiarity. Establishing a positive therapeutic relationship is critical for successful intervention and long-term progress.",
    src: rapport, // Add image source here
  },
  {
    heading: "Parent Commitments",
    description:
      "Parents must sign consent and Telehealth forms and provide necessary documents before therapy starts. Their active participation and cooperation are essential for reinforcing strategies at home and ensuring consistent progress.",
    src: parentCommitments, // Add image source here
  },
  {
    heading: "Therapy Planning",
    description:
      "Create and explain the IEP and BIP, ensuring caregivers are trained in their use and understand session expectations. This collaborative planning phase empowers families and promotes cohesive implementation across environments.",
    src: therapyPlanning, // Add image source here
  },
];

const BallAnimation = () => {
  useEffect(() => {
    const path = document.querySelector(".theLine");

    const t1 = gsap.timeline({
      scrollTrigger: {
        trigger: "#scroll-container",
        start: "top top",
        end: "center top",
        pinSpacing: true,
        scroller: "body",
        // anticipatePin:1,
        scrub: 2,
        pin: true,
      },
    });

    // Ball motion path animation
    t1.to(".ball01", {
      motionPath: {
        path,
        align: path,
        autoRotate: true,
        alignOrigin: [0.5, 0.5],
        start: 0,
        end: 0.17,
      },
      duration: 4,
    })
      .to("#card-1", { translateY: 0, opacity: 1, duration: 2 }, "<")
      .to("#card-1", { translateY: -100, opacity: 0, duration: 2 }, ">");

    t1.to(".ball01", {
      motionPath: {
        path,
        align: path,
        autoRotate: true,
        alignOrigin: [0.5, 0.5],
        start: 0.17,
        end: 0.34,
      },
      duration: 4,
    })
      .to("#card-2", { translateY: 0, opacity: 1, duration: 2 }, "<")
      .to("#card-2", { translateY: -100, opacity: 0, duration: 2 }, ">");

    t1.to(".ball01", {
      motionPath: {
        path,
        align: path,
        autoRotate: true,
        alignOrigin: [0.5, 0.5],
        start: 0.34,
        end: 0.51, // Final destination
      },
      duration: 4,
    })
      .to("#card-3", { translateY: 0, opacity: 1, duration: 2 }, "<")
      .to("#card-3", { translateY: -100, opacity: 0, duration: 2 }, ">");

    t1.to(".ball01", {
      motionPath: {
        path,
        align: path,
        autoRotate: true,
        alignOrigin: [0.5, 0.5],
        start: 0.51,
        end: 0.68, // Final destination
      },
      duration: 4,
    })
      .to("#card-4", { translateY: 0, opacity: 1, duration: 2 }, "<")
      .to("#card-4", { translateY: -100, opacity: 0, duration: 2 }, ">");

    t1.to(".ball01", {
      motionPath: {
        path,
        align: path,
        autoRotate: true,
        alignOrigin: [0.5, 0.5],
        start: 0.68,
        end: 0.85, // Final destination
      },
      duration: 4,
    })
      .to("#card-5", { translateY: 0, opacity: 1, duration: 2 }, "<")
      .to("#card-5", { translateY: -100, opacity: 0, duration: 2 }, ">");

    t1.to(".ball01", {
      motionPath: {
        path,
        align: path,
        autoRotate: true,
        alignOrigin: [0.5, 0.5],
        start: 0.85,
        end: 1, // Final destination
      },
      duration: 4,
    })
      .to("#card-6", { translateY: 0, opacity: 1, duration: 2 }, "<")
      .to("#card-6", { translateY: -100, opacity: 0, duration: 2 }, ">");
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        // height: "100vh",
        borderRadius: "35% 0 0 0",
        background: "#265c7e",
      }}
    >
      <h2 className={style["heading"]}>Our Process</h2>
      <div
        id="scroll-container"
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          // backgroundColor: "olive",
          maxWidth: "100vw",
          maxHeight: "100vh", // 👈 Add this to make it scrollable
          position: "relative",
          // padding: "0 40px",

          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            // height: "fit-content",
            overflowY: "hidden",
            display: "flex",
            justifyContent: "start",
            flexDirection: "row",
          }}
        >
          <svg
            viewBox="0 0 600 1200"
            style={{
              height: "600px",
              margin: "130px 0",

              alignItems: "self-start",
            }}
          >
            <path
              className="theLine"
              d="M 0,0
        Q 450 230 300 450 
        T 130 750
        Q 100 850 300 1000
        T 0 1200"
              fill="none"
              stroke="white"
              strokeWidth="6"
            />

            <circle className="ball01" r="20" cx="25" cy="25" fill="red" />
            {/* <circle className="ball02" r="20" cx="100" cy="25" fill="gray" />
          <circle className="ball03" r="20" cx="100" cy="125" fill="gray" />
          <circle className="ball04" r="20" cx="100" cy="225" fill="gray" /> */}
            {/* <circle className="ball05" r="20" cx="0" cy="300" fill="gray" />
          <circle className="ball06" r="20" cx="0" cy="400" fill="gray" />
          <circle className="ball07" r="20" cx="0" cy="500" fill="gray" /> */}
          </svg>
        </div>

        <div
          id="div"
          style={{
            alignSelf: "center",
            width: "50%",
            position: "relative",
          }}
        >
          {therapySteps.map(({ src, description, heading }, index) => (
            <Card
              description={description}
              stepNumber={index}
              key={index}
              className={style["card"]}
            />
          ))}
          {/* <div className={`${style["box"]} ${style["card-3"]}`} id="card-3"/> */}
        </div>
      </div>
    </div>
  );
};

export default BallAnimation;
