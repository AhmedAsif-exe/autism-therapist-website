import style from "./Card.module.css";
import arrow from "../../Assets/Icons/arrow.svg";
export default function Card({
  heading,
  description,
  stepNumber,
  src,
  removeArrow,
  className,
}) {
  let logo;
  if (stepNumber !== undefined) logo = <p>0{stepNumber}</p>;
  else if (src !== undefined) logo = <img src={src} alt="process icon" />;

  return (
    <div
      className={`${style["card"]} p-6 pb-8 flex flex-col gap-3 font-Outfit aos-init aos-animate ${className}`}
    >
      <div className={style["card-header"]}>
        <div className={style["icon-title"]}>
          {logo}
          <h3>{heading}</h3>
        </div>
        {!removeArrow && <img src={arrow} alt="arrow" />}
      </div>

      <p className={style["card-body"]}>{description[0]}</p>
      <p className={style["card-body"]}>{description[1]}</p>
    </div>
  );
}
