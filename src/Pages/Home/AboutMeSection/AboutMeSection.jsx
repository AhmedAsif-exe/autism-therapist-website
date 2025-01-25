import { Button } from "@mui/base";
import style from "./AboutMeSection.module.css";
export default function WhatIDoSection() {
  return (
    <div className={style["about-us-section"]}>
      <div className={style["image"]}>
        {/* <img src={src} alt="Therapist" /> */}
      </div>
      <div className={style["title-cta"]}>
        {/* <p className={style["para-heading"]}>/About Us/</p> */}
        <h2>About Me</h2>
        <p className={style["content"]}>
          Hello! I’m Faiza Faizan, a Qualified Autism Service Practitioner and
          Supervisor (QASP-S), accredited by the renowned QABA credentialing
          board. My passion lies in coaching and supporting parents, therapists,
          and caregivers of individuals with Autism, among others.
        </p>
        <p className={style["content"]}>
          My work focuses on training, developing behavior and individualized
          educational plans, and monitoring their progress. I collaborate
          closely with clients, families, and professionals to ensure therapy is
          customized to meet each individual’s specific needs.
        </p>
        <p className={style["content"]}>
          My ultimate aim is to empower individuals by helping them develop
          communication, social, and daily living skills, enhancing their
          independence and overall quality of life.
        </p>

        <Button>Learn more</Button>
      </div>
    </div>
  );
}
