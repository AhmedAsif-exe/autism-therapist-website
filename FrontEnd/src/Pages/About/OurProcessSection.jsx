import Card from "../../Utils/Card/Card";
import gsap from "gsap";
import { useEffect } from "react";
import session from "Assets/Icons/session-meeting.png";
import assessment from "Assets/Icons/assesment-phase.png";
import supervisor from "Assets/Icons/supervisor-review.png";
import rapport from "Assets/Icons/rapport-building.png";
import parentCommitments from "Assets/Icons/parent-commitment.png";
import therapyPlanning from "Assets/Icons/planning.png";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
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

export default function OurProcessSection() {
  useEffect(() => {
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
    ).to(
      "#our-process-sub-heading",
      {
        opacity: 1,
        y: 0,
        duration: 1,
      },
      "-=0.5"
    );  }, []);

  return (
   <div className="ml:px-[50px] pt-[20px] my-0 flex flex-col rounded-tl-[35%]">
      <h2
        className="l:text-[70px] text-[50px] font-[raleway] italic-not text-[#f97544] text-center m-0 mb-[30px]"
        id="our-process-header"
      >
        {" "}
        Our Process
      </h2>
      <p className="t:text-[20px] text-[16px] font-normal mx-auto mt-[10px] w-[60%] translate-y-[20px] opacity-0 t:leading-[40px] text-center text-black" id="our-process-sub-heading">
        The process of delivering therapy virtually is designed in a structured
        however, simple manner.
      </p>
      <div className="self-center ml:p-[10px] mt-[40px]" id="carousel">
        <VerticalTimeline lineColor="#265c7e">
          {therapySteps.map((step, stepNumber) => (
            <VerticalTimelineElement
              className="vertical-timeline-element--work"
              contentStyle={{
                background: "#265c7e",
                padding: "5px",
                color: "#fff",
              }}
              contentArrowStyle={{
                borderRight: "7px solid  #265c7e",
              }}
              date={step.heading}
              iconStyle={{ background: "#f97544", color: "#fff" }}
              dateClassName="text-[40px] text-white l:text-[#265c7e] font-[raleway] text-start leading-[130%] m-0 p-0"
              icon={
                <img
                  src={step.src}
                  alt="process icon"
                  className="l:h-[40px] l:w-[40px] h-[25px] w-[25px] m-[7.5px] l:m-[10px]"
                />
              }
            >
              <Card {...step} stepNumber={stepNumber + 1} />
            </VerticalTimelineElement>
          ))}
        </VerticalTimeline>
      </div>
    </div>
  );
}
