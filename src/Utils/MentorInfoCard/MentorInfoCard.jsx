import style from "./MentorInfoCard.module.css";
import { Rating } from "@mui/material";
export default function MentorInfoCard({ name, position, src, about }) {
  return (
    <div className={style["card"]}>
      <img src={src} className={style["mentor-image"]} />
      <div className={style["mentor-body"]}>
        <div className={style["mentor-info-header"]}>
          <div>
            <p className={style["mentor-info-name"]}>{name}</p>
            <p className={style["mentor-info-position"]}>{position}</p>
          </div>
        </div>
        <div className={style["statement-container"]}>
          <p className={style["statement"]}>{about[0]}</p>
          <p className={style["statement"]}>{about[1]}</p>
          <a className={style["link"]}>
            Follow On Instagram
            <svg
              class="bf de kc pr qr qp rp"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2.5"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="7" y1="17" x2="17" y2="7"></line>
              <polyline points="7 7 17 7 17 17"></polyline>
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
