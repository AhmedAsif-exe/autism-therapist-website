import StepperScrollSection from "./StepperScrollSection";

const Process = () => {
  return (
    <div className="px-[5%] flex flex-col mb-[60px]">
      <h2 className="text-[70px] font-[raleway] italic-not text-[#f97544] mb-[30px] text-center m-0">
        Our Process
      </h2>
      <div className="flex items-stretch gap-6 justify-around">
        <StepperScrollSection/>
      </div>
    </div>
  );
};
export default Process;
