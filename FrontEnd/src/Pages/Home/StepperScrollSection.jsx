import { useEffect, useRef, useState, useCallback } from "react";
import { useLenis } from "Utils/LenisProvider"; // <- custom hook
import { useInView } from "react-intersection-observer";
import CustomizedSteppers from "./Stepper"; // your MUI vertical stepper
import { Stack } from "@mui/material";
export default function StepperScrollSection() {
  const lenis = useLenis();
  const [activeStep, setActiveStep] = useState(0);
  const [locked, setLocked] = useState(false);
  const maxStep = 5;
  const sectionRef = useRef(null);

  const { ref: inViewRef, inView } = useInView({
    threshold: 0.5,
  });
  console.log(locked)
  const setRefs = useCallback(
    (node) => {
      sectionRef.current = node;
      inViewRef(node);
    },
    [inViewRef]
  );

  useEffect(() => {
    if (!lenis) return;

    if (inView && !locked && activeStep !== maxStep) {
      setLocked(true);
      lenis.stop(); 
      window.scrollTo({
        top: sectionRef.current.offsetTop - 100,
        behavior: "smooth",
      });
    }
  }, [inView, lenis]);

  useEffect(() => {
    if (!locked) return;

    const handleWheel = (e) => {
      e.preventDefault();

      setActiveStep((prev) => {
        let nextStep = prev;

        if (e.deltaY > 0 && prev < maxStep) {
          nextStep++;
        } else if (e.deltaY < 0 && prev > 0) {
          nextStep--;
        }

        // 🔓 Unlock on scroll past bottom
        if (nextStep === maxStep && e.deltaY > 0) {
          lenis?.start();
          setLocked(false);
        }

        return nextStep;
      });
    };

    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, [locked, lenis]);

  return (
    <Stack
      ref={setRefs}
      spacing={1}
      className="items-center justify-start"
      sx={{ width: "100%", minHeight: "500px" }}
    >
      <CustomizedSteppers
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        ref={setRefs}
      />
    </Stack>
  );
}
