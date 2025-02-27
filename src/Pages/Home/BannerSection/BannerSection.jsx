import { Button } from "@mui/base";
import style from "./BannerSection.module.css";
import src from "../../../Assets/Images/boy-on-therapy-swing.jpg";
import eclipse3 from "../../../Assets/Images/Ellipse 3.png";
import eclipse2 from "../../../Assets/Images/Ellipse 2.png";
import eclipse1 from "../../../Assets/Images/Ellipse 1.png";
import { useState, useEffect } from "react";
export default function BannerSection() {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // This will trigger when the component mounts
    setAnimate(true);
  }, []);
  return (
    <div className={style["banner-section"]}>
      <div className={`${style["title-cta"]} ${animate ? style.animate : ""}`}>
        <p>Welcome to the Safe Space</p>
        <h1>Your child deserves to live their best life</h1>
        <p>
          Viverra enim sodales nunc sed ante cubilia. Phasellus sit scelerisque
          elit morbi natoque curabitur lectus adipiscing himenaeos bibendum.
        </p>
        <div className={style["button-container"]}>
          <Button>Discover More</Button>
          <Button>Contact</Button>
        </div>
      </div>
      <div className={style["image"]}></div>
    </div>
  );
}
