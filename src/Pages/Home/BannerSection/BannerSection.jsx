import { Button } from "@mui/base";
import style from "./BannerSection.module.css";
import src from "../../../Assets/Images/Therapist.png";
import eclipse3 from "../../../Assets/Images/Ellipse 3.png";
import eclipse2 from "../../../Assets/Images/Ellipse 2.png";
import eclipse1 from "../../../Assets/Images/Ellipse 1.png";
export default function BannerSection() {
  return (
    <div className={style["banner-section"]}>
      <div className={style["title-cta"]}>
        <p>/You are not alone/</p>
        <h1>
          Faiza Faizan <br></br> Autism Therapist
        </h1>
        <Button>Contact</Button>
      </div>
      <div className={style["image"]}>
        <img src={src} alt="Therapist" />
      </div>
      <img
        src={eclipse3}
        alt="background effect"
        className={style["eclipse-3"]}
      />
      <img
        src={eclipse2}
        alt="background effect"
        className={style["eclipse-2"]}
      />
      <img
        src={eclipse1}
        alt="background effect"
        className={style["eclipse-1"]}
      />
    </div>
  );
}
