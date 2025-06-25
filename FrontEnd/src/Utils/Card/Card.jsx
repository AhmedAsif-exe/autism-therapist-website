import style from "./Card.module.css";
import arrow from "../../Assets/Icons/arrow.svg";
export default function Card({
  heading,
  description,
  stepNumber,
  src,
  remove,
  className,
}) {
  return (
    <div
      className={`${style["card"]} p-6 pb-8 shadow-lg hover:shadow-xl ${!remove && "bg-[#265c7e]"} flex flex-col gap-3 font-Outfit aos-init aos-animate ${className}`}
      id={`card-${stepNumber}`}
    >
      {remove && (
        <div className={style["card-header"]}>
          <div className={style["icon-title"]}>
            <img src={src} alt="process icon" className={style["card-logo"]} />

            <h3>{heading}</h3>
          </div>
        </div>
      )}

      <p className={style["card-body"]}>{description}</p>
    </div>
  );
}
