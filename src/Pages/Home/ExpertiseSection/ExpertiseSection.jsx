import style from "./ExpertiseSection.module.css";
import arrow from "../../../Assets/Icons/right-arrow.png";
import Card from "Utils/Card/Card";
import personality from "../../../Assets/Icons/personality.png";
import management from "../../../Assets/Icons/management.png";

import sensory from "../../../Assets/Icons/sensory.png";
import training from "../../../Assets/Icons/training.png";
import writing from "../../../Assets/Icons/writing.png";
import social from "../../../Assets/Icons/social.svg";
const expertise = [
  {
    src: personality,
    heading: "Behavioral Therapy",
    description: [
      "Specializes in implementing evidence-based interventions like Applied Behavior Analysis (ABA) to support individuals with autism. Utilizes structured techniques to promote meaningful communication, foster essential social skills, and encourage adaptive behaviors.",
      "Tailors intervention plans to each individual’s unique needs, ensuring measurable progress while empowering them to navigate their environments with confidence and independence.",
    ],
  },
  {
    src: sensory,
    heading: "Sensory Integration Therapy",
    description: [
      "Experienced in helping individuals with sensory processing issues by addressing sensitivities to sounds, textures, lights, and other sensory stimuli. Utilizes evidence-based techniques to create personalized sensory integration plans that help individuals feel more comfortable in their environment.",
      //   "Works on developing coping strategies to manage sensory overload and increase tolerance to challenging sensory inputs. Collaborates with caregivers and educators to ensure consistent support across home, school, and community settings.",
    ],
  },
  {
    src: social,
    heading: "Social Skills Development",
    description: [
      "Focuses on teaching essential social skills like making eye contact, starting conversations, and understanding non-verbal cues to promote peer interactions.",
    ],
  },
  {
    src: management,
    heading: "Parent Coaching",
    description: [
      "Offers guidance and strategies to parents on how to support their child’s development, manage behaviors, and navigate everyday challenges effectively.",
    ],
  },
  //   {
  //     src: writing,
  //     heading: "Educational Planning",
  //     description:
  //       "Expertise in designing individualized education plans (IEPs) and collaborating with schools to create supportive learning environments for students with autism.",
  //   },
  //   {
  //     src: training,
  //     heading: "Communication Training",
  //     description:
  //       "Proficient in using tools like PECS (Picture Exchange Communication System) and assistive technologies to develop or improve verbal and non-verbal communication.",
  //   },
];

export default function ExpertiseSection() {
  console.log(expertise);
  return (
    <div className={style["expertise-section"]}>
      <h2 className={style["heading"]}>Expertise</h2>
      <div className={style["grid"]}>
        {expertise.map((element, index) => (
          <Card {...element} className={style[`grid-${index}`]} />
        ))}
      </div>
      <a className={style["see-more"]}>
        See More <img src={arrow} />
      </a>
    </div>
  );
}
