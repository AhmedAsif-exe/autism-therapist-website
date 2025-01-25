import style from "./TestimonialCard.module.css";
import { Rating } from "@mui/material";
export default function TestimonialCard({ name, position, testimonial, src }) {
  return (
    <div className={style["card"]}>
      <Rating name="read-only" value={5} readOnly />
      <p className={style["statement"]}>“{testimonial}”</p>
      <div className={style["testimonial-header"]}>
        <img src={src} alt="jacob jones" />
        <div className={style["testimonial-name"]}>
          <p>{name}</p>
          <p>{position}</p>
        </div>
      </div>
    </div>
  );
}
