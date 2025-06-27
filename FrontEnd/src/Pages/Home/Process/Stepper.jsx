import { styled } from "@mui/material/styles";

import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import gsap from "gsap";
import StepConnector, {
  stepConnectorClasses,
} from "@mui/material/StepConnector";
import session from "Assets/Icons/session-meeting.png";
import assessment from "Assets/Icons/assesment-phase.png";
import supervisor from "Assets/Icons/supervisor-review.png";
import rapport from "Assets/Icons/rapport-building.png";
import parentCommitments from "Assets/Icons/parent-commitment.png";
import therapyPlanning from "Assets/Icons/planning.png";
import { Avatar } from "@mui/material";

import { useEffect } from "react";
const steps = [
  "Initial Consultation",
  "Assessment Phase",
  "Supervisor Review",
  "Rapport Building",
  "Parent Commitments",
  "Therapy Planning",
];

const therapyStepsData = [
  {
    title: "Gather Background",
    description:
      "Collect medical, educational, and behavior history from caregivers.",
    icon: session,
  },
  {
    title: "Assessment Phase",
    description: "Run interviews and virtual assessments over a few days.",
    icon: assessment,
  },
  {
    title: "Supervisor Review",
    description: "Present findings to supervisor for feedback and approval.",
    icon: supervisor,
  },
  {
    title: "Build Rapport",
    description:
      "Engage in preferred online activities to build student trust.",
    icon: rapport,
  },
  {
    title: "Parent Commitments",
    description: "Get consent forms and documents signed by parents.",
    icon: parentCommitments,
  },
  {
    title: "Plan & Train",
    description: "Create plans and train caregivers to use them effectively.",
    icon: therapyPlanning,
  },
];

const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.vertical}`]: {
    marginLeft: 6, // space from step icon
    paddingLeft: 8,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage:
        "linear-gradient(180deg, rgba(249, 117, 68, 1) 0%, rgba(87, 199, 133, 1) 100%)",
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage:
        "linear-gradient(180deg, rgba(249, 117, 68, 1) 0%, rgba(87, 199, 133, 1) 100%)",
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    transition: "all 0.3s ease-in-out",
    border: 0,
    backgroundColor: "#eaeaf0",
    borderRadius: 1,
    width: 3,
    height: "100%", // necessary for vertical layout
    ...theme.applyStyles?.("dark", {
      backgroundColor: theme.palette.grey[800],
    }),
  },
}));

const ColorlibStepIconRoot = styled("div")(({ theme }) => ({
  backgroundColor: "#ccc",
  zIndex: 1,
  color: "#fff",
  width: 20,
  height: 20,
  display: "flex",
  borderRadius: "50%",
  justifyContent: "center",
  alignItems: "center",
  marginLeft: 5,
  ...theme.applyStyles("dark", {
    backgroundColor: theme.palette.grey[700],
  }),
  transition: "all 0.3s ease-in-out",
  fontSize: "12px",

  variants: [
    {
      props: ({ ownerState }) => ownerState.active,
      style: {
        backgroundColor: "rgba(87, 199, 133, 1) ",
        boxShadow: "0 4px 10px 0 rgba(0,0,0,.25)",
        width: 30,
        height: 30,
        marginLeft: 0,
      },
    },
    {
      props: ({ ownerState }) => ownerState.completed,
      style: {
        backgroundColor: "#265c7e",
        width: 30,
        height: 30,
        marginLeft: 0,
        transformOrigin: "center",
      },
    },
  ],
}));

function ColorlibStepIcon(props) {
  const { active, completed, className } = props;

  const icons = {
    1: <Avatar src={session} />,
    2: <Avatar src={assessment} />,
    3: <Avatar src={supervisor} />,
    4: <Avatar src={rapport} />,
    5: <Avatar src={parentCommitments} />,
    6: <Avatar src={therapyPlanning} />,
  };

  return (
    <ColorlibStepIconRoot
      ownerState={{ completed, active }}
      className={className}
    >
      {/* {icons[String(props.icon)]} */}
    </ColorlibStepIconRoot>
  );
}

export default function CustomizedSteppers({ activeStep, setActiveStep }) {
  useEffect(() => {
    gsap.fromTo(
      "#current-card",
      {
        y: 100,
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power2.out",
      }
    );

    gsap.fromTo(
      "#flip-card",
      { rotateY: 90, opacity: 0 },
      {
        rotateY: 0,
        opacity: 1,
        duration: 0.6,
        ease: "power2.out",
        transformOrigin: "center",
      }
    );
  }, [activeStep]);

  return (
    <>
      <div className="hidden t:block w-full">
        <Stepper
          orientation="horizontal"
          activeStep={activeStep}
          connector={<ColorlibConnector />}
        >
          {steps.map((label, index) => (
            <Step
              key={label}
              onClick={() => setActiveStep(index)}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <StepLabel StepIconComponent={ColorlibStepIcon} />
              <div
                className={`mt-2 text-sm text-center text-gray-700 ${
                  activeStep >= index
                    ? "ml:text-[16px] text-[10px]"
                    : "ml:text-[14px] text-[8px]"
                }`}
              >
                {label}
              </div>
            </Step>
          ))}
        </Stepper>
      </div>
      <div className="t:grid grid-cols-3 w-full gap-4 hidden mt-6">
        {therapyStepsData.map((t, idx) => {
          if (idx < activeStep)
            return (
              <div
                key={idx}
                className="text-center flex flex-col items-center t:mt-3 mt-1 border border-[#28a5a8]  p-4 rounded-lg shadow-xl border-2 text-[17px] transition-opacity duration-500 opacity-100"
              >
                {" "}
                <Avatar
                  src={t.icon}
                  sx={{
                    backgroundColor: "#28a5a8",
                    p: 2,
                    height: 60,
                    width: 60,
                  }}
                />
                <h2 className="font-semibold mt-1  text-[#f97544] text-xl">
                  {steps[idx]}
                </h2>
                <p className="mt-1">{t.description}</p>
              </div>
            );
        })}
        <div
          key={activeStep}
          id="current-card"
          className="text-center flex flex-col items-center border t:mt-3 mt-1 border-[#28a5a8] p-4 rounded-lg shadow-xl border-2 text-[17px] transition-opacity duration-500 opacity-100"
        >
          <Avatar
            src={therapyStepsData[activeStep].icon}
            sx={{ backgroundColor: "#28a5a8", p: 2, height: 60, width: 60 }}
          />
          <h2 className="font-semibold mt-1  text-[#f97544] text-xl">
            {steps[activeStep]}
          </h2>
          <p className="mt-1">{therapyStepsData[activeStep].description}</p>
        </div>
      </div>
      <div className="t:hidden block ">
        <p className="text-[40px] text-[#57c785] font-[raleway]">
          0{activeStep + 1}
        </p>
        <div
          key={activeStep}
          id="flip-card"
          className="text-center flex flex-col w-[300px] items-center border mt-[50px] border-[#28a5a8] p-4 rounded-lg shadow-xl border-2 text-[17px] transition-opacity duration-500 opacity-100"
        >
          <Avatar
            src={therapyStepsData[activeStep].icon}
            sx={{ backgroundColor: "#28a5a8", p: 2, height: 60, width: 60 }}
          />
          <h2 className="font-semibold mt-1  text-[#f97544] text-xl">
            {steps[activeStep]}
          </h2>
          <p className="mt-1">{therapyStepsData[activeStep].description}</p>
        </div>
      </div>
    </>
  );
}
