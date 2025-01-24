import style from "./Card.module.css";
import arrow from "../../Assets/Icons/arrow.svg";
export default function Card({ heading, description, stepNumber }) {
  return (
    <div
      className={`${style["card"]} p-6 pb-8 flex flex-col gap-3 font-Outfit aos-init aos-animate`}
    >
      <div className={style["card-header"]}>
        <div className={style["icon-title"]}>
          <p>0{stepNumber}</p>
          {/* <img src={src} alt="process icon" /> */}
          <h3>{heading}</h3>
        </div>
        <img src={arrow} alt="arrow" />
      </div>
      <p className={style["card-body"]}>{description}</p>
    </div>
  );
}
