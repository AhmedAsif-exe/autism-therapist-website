import Slider from "./helper/Slider";
import data from "./helper/data";

export default function TestimonialSection() {
  return (
    <div className="pt-[50px] t:px-[50px] flex flex-col px-[20px] overflow-hidden">
      <h2 className="l:text-[70px] text-[50px] font-[raleway] italic-not text-[#f97544] mb-[30px] text-center m-0">
        Testimonials
      </h2>
      <div className="flex flex-col justify-center items-center max-w-full my-[100px]">
        <Slider activeSlide={2} data={data} />
      </div>
    </div>
  );
}
