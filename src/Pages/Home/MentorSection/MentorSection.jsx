import style from "./MentorSection.module.css";
import Card from "../../../Utils/Card/Card";
import arrow from "../../../Assets/Icons/right-arrow.png";
import MentorInfoCard from "Utils/MentorInfoCard/MentorInfoCard";
import Devon from "../../../Assets/Images/Devon Lane.png";
import Floyd from "../../../Assets/Images/Floyd Miles.png";
const mentors = [
  {
    name: "Dr. Devon Lane",
    position: "Developmental Pediatrician",
    src: Devon,
    about: [
      "Dr. Devon Lane is a highly respected developmental pediatrician with over 15 years of experience working with children on the autism spectrum.",
      "He is deeply passionate about equipping families with the knowledge and tools they need to support their children, combining evidence-based practices with a warm and approachable demeanor.",
    ],
  },
  {
    name: "Floyd Miles",
    position: "Behavioral Therapist",
    src: Floyd,
    about: [
      "Floyd is a seasoned behavioral therapist specializing in Applied Behavior Analysis (ABA) therapy for children with autism. His expertise lies in designing individualized behavioral interventions to promote positive changes.",
      "His compassionate approach builds trust and helps children overcome developmental challenges.",
    ],
  },
];
export default function OurProcessSection() {
  return (
    <div className={style["mentor-section"]}>
      <h2 className={style["heading"]}>Mentor</h2>
      <div className={style["process-grid"]}>
        {mentors.map((mentor) => (
          <MentorInfoCard {...mentor} />
        ))}
      </div>
      <a className={style["see-more"]}>
        See More <img src={arrow} />
      </a>
    </div>
  );
}
