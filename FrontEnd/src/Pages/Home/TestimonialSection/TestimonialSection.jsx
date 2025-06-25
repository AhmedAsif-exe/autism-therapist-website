import Slider from "./helper/Slider";
import data from "./helper/data";

export default function TestimonialSection() {
  return (
    <div className="py-[50px] px-[50px] flex flex-col md:px-[40px] sm:px-0">
      <h2 className="text-[70px] font-[Raleway] font-normal text-center text-[#265c7e] mb-2">
        Testimonials
      </h2>
      <div className="flex flex-col justify-center items-center max-w-full h-screen">
        <Slider activeSlide={2} data={data} />
      </div>
    </div>
  );
}
