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
      "The process is characterized by a holistic review of client’s journey through preceding years. This could include but not limited to medical, school, educational histories. This stage usually does not require presence of client rather is a one-on-one intake process with the caregivers.",
    src: session, // Add image source here
  },
  {
    heading: "Signing documents",
    description:
      "An exchange of documents mainly from the consultant to the caregivers. These documents could mainly include a contract and consent form. The caregivers review each document before signing and reverting it back to the consultant. The consultant could require documents from the caregivers depending on its need.",
    src: assessment, // Add image source here
  },
  {
    heading: "Assessment phase",
    description:
      "The process of assessment is followed by the indirect interview (of parents/ caregivers) where the student is assessed on various domains and their skill levels (such as visual performance, social communication, academics, motor imitation etc). Simultaneous to it, all concerned behaviors are observed and assessed. The virtual assessment can last from as less as 5 days (or more).",
    src: supervisor, // Add image source here
  },
  {
    heading: "Parent and therapist commitments",
    description:
      "Before starting therapy, parents must sign a consent form based on ABA ethics, a Telehealth contract, and submit any required documents. The therapist is responsible for sharing all necessary information in advance and following the consent and code of conduct. This includes clarifying session details—such as format, facilitator, and caregiver requirements.",
    src: rapport, // Add image source here
  },
  {
    heading: "Assessment report and Intervention plans (IEPs or BIPs)",
    description:
      "A detailed report is provided that briefs student’s current level skills to their mastery levels. The report entails the domains that have been assessed and the criteria of the skill required to be taught. An Individualized Education Plan or a Behavior Intervention Plan is provided which contains goals to be worked on set on a mastery criteria, along with the required resources.",
    src: parentCommitments, // Add image source here
  },
  {
    heading: "Therapy Planning",
    description:
      "A mutually convenient time and days (i.e., for student and therapists) are scheduled monthly. A consultant or a supervisor initiates the therapy by developing rapport mastering skills required to perform goals effectively. The goals on the Intervention Plans are then run with the guidance of the therapist. With a consistent collaborative effort the instructor at the student’s end and the therapist run sessions in a consistent pattern.",
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
    );
  }, []);

  return (
    <div className="ml:px-[50px] pt-[20px] my-0 flex flex-col rounded-tl-[35%]">
      <h2
        className="l:text-[70px] text-[50px] font-[raleway] italic-not text-[#f97544] text-center m-0 mb-[30px]"
        id="our-process-header"
      >
        {" "}
        Our Process
      </h2>
      <p
        className="t:text-[20px] text-[16px] font-normal mx-auto mt-[10px] w-[60%] translate-y-[20px] opacity-0 t:leading-[40px] text-center text-black"
        id="our-process-sub-heading"
      >
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
