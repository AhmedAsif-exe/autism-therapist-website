import style from "./Card.module.css";
import arrow from "../../Assets/Icons/arrow.svg";
export default function Card({
  heading,
  description,
  stepNumber,
  src,

  className,
}) {
  let logo;
  if (stepNumber !== undefined) logo = <p>0{stepNumber}</p>;
  else if (src !== undefined) logo = <img src={src} alt="process icon" />;

  return (
    <div
      className={`${style["card"]} p-6 pb-8 flex flex-col gap-3 font-Outfit aos-init aos-animate ${className}`}
      id={`card-${stepNumber}`}
    >
      {/* <div className={style["card-header"]}>
        <div className={style["icon-title"]}>
          <img src={src} alt="process icon" className={style["card-logo"]} />

          <h3>{heading}</h3>
        </div>
        {!removeArrow && <img src={arrow} alt="arrow" />}
      </div> */}

      <p className={style["card-body"]}>{description}</p>
    </div>
  );
}
