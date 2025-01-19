import { Button } from "@mui/base";
import style from "./AboutUsSection.module.css";
import src from "../Assets/Images/About Us.png";
export default function BannerSection() {
  return (
    <div className={style["about-us-section"]}>
      <div className={style["image"]}>
        <img src={src} alt="Therapist" />
      </div>
      <div className={style["title-cta"]}>
        <p className={style["para-heading"]}>/About Us/</p>
        <h1>Dedicated to Supporting Children with Autism and Their Families</h1>
        <p className={style["content"]}>
          We provide specialized therapy for children with autism, fostering
          growth and learning in a safe, nurturing environment. Our experienced
          team works closely with families to develop personalized strategies
          that empower children to thrive.
        </p>
        <Button>Learn more</Button>
      </div>
    </div>
  );
}
