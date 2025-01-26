import style from "./OurProcessSection.module.css";
import Card from "../../../Utils/Card/Card";
const therapySteps = [
  {
    heading: "Assessment",
    description: [
      "Evaluate the child's behavior, skills, and challenges to create a personalized treatment plan.",
    ],
  },
  {
    heading: "Goal Setting",
    description: [
      "Establish specific, measurable, and achievable goals for the child’s development.",
    ],
  },
  {
    heading: "Intervention",
    description: [
      "Implement therapy techniques like Applied Behavior Analysis (ABA) to address the child’s needs.",
    ],
  },
  {
    heading: "Skill Building",
    description: [
      "Focus on developing social, communication, and functional skills through structured activities.",
    ],
  },
  {
    heading: "Family Involvement",
    description: [
      "Engage the family in therapy to ensure consistency and support at home.",
    ],
  },
  {
    heading: "Progress Monitoring",
    description: [
      "Continuously track and adjust the therapy plan based on the child’s progress and response.",
    ],
  },
];

export default function OurProcessSection() {
  return (
    <div className={style["our-process-section"]}>
      <h2 className={style["heading"]}>Our Process</h2>
      <div className={style["process-grid"]}>
        {therapySteps.map((step, stepNumber) => (
          <Card {...step} stepNumber={stepNumber + 1} />
        ))}
      </div>
    </div>
  );
}
