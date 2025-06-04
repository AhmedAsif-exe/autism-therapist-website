import style from "./TestimonialSection.module.css";
import TestimonialCard from "../../../Utils/TestimonialCard/TestimonialCard";
import { Carousel } from "react-responsive-3d-carousel";
import emily from "../../../Assets/Images/Emilly Carter.png";
import sarah from "../../../Assets/Images/Sarah Johnson.png";
import jacob from "../../../Assets/Images/Jacob Jones.png";
import arrow from "../../../Assets/Icons/right-arrow.png";
import Slider from "./helper/Slider";
import data from "./helper/data";

export default function TestimonialSection() {
  return (
    <div className={style["testimonial-section"]}>
      <h2 className={style["heading"]}>Testimonials</h2>
      <div className={style["center"]}>
        <Slider activeSlide={2} data={data} />
      </div>
      <a className={style["see-more"]}>
        See More <img src={arrow} />
      </a>
    </div>
  );
}
