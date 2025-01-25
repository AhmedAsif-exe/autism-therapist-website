import style from "./TestimonialSection.module.css";
import TestimonialCard from "../../../Utils/TestimonialCard/TestimonialCard";
import { Carousel } from "react-responsive-3d-carousel";
import emily from "../../../Assets/Images/Emilly Carter.png";
import sarah from "../../../Assets/Images/Sarah Johnson.png";
import jacob from "../../../Assets/Images/Jacob Jones.png";
import arrow from "../../../Assets/Icons/right-arrow.png";
const testimonials = [
  {
    name: "Sarah Johnson",
    position: "Parent of a Child with Autism",
    src: sarah,
    testimonial:
      "The compassion and expertise shown by the therapist have been transformative for our son. Her tailored approach and dedication to understanding his unique needs have helped him make incredible progress in communication and social interaction. We couldn’t be more grateful!",
  },
  {
    name: "Emily Carter",
    position: "Special Education Teacher",
    src: emily,
    testimonial:
      "As a teacher, I’ve worked with several therapists, but the results we’ve seen from this autism therapy program are remarkable. The structured strategies and one-on-one care have given my student the confidence and skills to thrive both academically and socially.",
  },
  {
    name: "Jacob Jones",
    src: jacob,
    position: "Father and Advocate for Autism Awareness",
    testimonial:
      "Finding an autism therapist who truly cares about their clients is rare, and we’re so fortunate to have found one. Her ability to connect with our child and guide us as a family has been life-changing. She’s more than a therapist; she’s a partner in our journey.",
  },
];

export default function TestimonialSection() {
  const items = testimonials.map((testimonial) => (
    <TestimonialCard {...testimonial} />
  ));

  return (
    <div className={style["testimonial-section"]}>
      <h2 className={style["heading"]}>Testimonial</h2>
      <div className={style["carousel"]}>
        <Carousel
          items={items}
          startIndex={0}
          showArrows={false}
          showIndicators={false}
        />
      </div>
      <a className={style["see-more"]}>
        See More <img src={arrow} />
      </a>
    </div>
  );
}
