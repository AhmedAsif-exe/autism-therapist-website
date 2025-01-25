import style from "./SectionDivider.module.css";
export default function SectionDivider() {
  return (
    <div className={style["section-divider"]}>
      <div className={style["section-divider-item"]} />
      <div className={style["section-divider-item"]} />
      <div className={style["section-divider-item"]} />
    </div>
  );
}
