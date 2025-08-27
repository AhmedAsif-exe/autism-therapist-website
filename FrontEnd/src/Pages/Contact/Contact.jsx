import React, { useEffect } from "react";
import {
  Typography,
  TextField,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import gsap from "gsap";
import { Instagram, LinkedIn, Email } from "@mui/icons-material";

export const ContactInfoSection = () => {
  const contactInfo = {
    phone: "faiza.qasps",
    email: "contact@aba.virtual",
    address: "http://www.linkedin.com/in/faiza-faizan-b-s-qasp-s-509b03206",
  };

  const subjectOptions = [
    { id: "general1", label: "Inquire about resources", checked: true },
    { id: "general2", label: "Consult the professional", checked: false },
    { id: "general3", label: "Write a blog for us", checked: false },
    {
      id: "general4",
      label: "ABAT requires remote supervision",
      checked: false,
    },
    {
      id: "general5",
      label: "Require ABAT competency assessment",
      checked: false,
    },
  ];

  useEffect(() => {
    const t1 = gsap.timeline({
      scrollTrigger: {
        trigger: "#contact",
        start: "top 90%",
        once: true,
      },
    });
    t1.fromTo(
      "#subtitle",
      {
        text: {
          value: "",
          delimiter: "",
        },
      },
      {
        text: {
          value: "Any question or remarks? Just write us a message!",
          delimiter: "",
        },
        duration: 1.5,
        ease: "none",
      }
    );
    t1.fromTo(
      "#contact",
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 1.5 },
      "<"
    );
  }, []);

  return (
    <div className="ml:px-14 ">
      <div className="flex flex-col items-center justify-center text-center mb-8 mt-10">
        <h1 className="font-bold text-[40px] font-['Poppins',Helvetica] text-[#F97544]">
          Contact Us
        </h1>
        <p className="font-medium text-lg text-[#4BB7BA]" id="subtitle">
          Any question or remarks? Just write us a message!
        </p>
      </div>
      <div
        className="flex flex-col t:flex-row rounded-lg shadow-lg max-w-[1440px] mx-auto mb-6"
        id="contact"
      >
        <div
          className="relative w-full flex flex-col justify-between p-8 t:w-[491px] h-[647px] bg-cover bg-center t:rounded-tl-[10px] t:rounded-bl-[10px] overflow-hidden"
          style={{
            backgroundColor: "#4BB7BA",
          }}
        >
          <div className="absolute w-[297px] h-[295px] bottom-[-100px] right-[-80px]">
            <div className="absolute w-[269px] h-[269px] top-[26px] left-7 bg-[#F97544] rounded-full" />
            <div className="absolute w-[138px] h-[138px] top-0 left-0 bg-[#F9754480] rounded-full" />
          </div>
          <div>
            <h3 className="text-start text-white font-semibold text-[28px]">
              Contact Information
            </h3>
            <p className="text-start text-[#265C7E] text-[18px] font-semibold ">
              Get in touch with us here
            </p>
          </div>
          <List>
            <ListItem>
              <ListItemAvatar>
                <Instagram sx={{ color: "white" }} />
              </ListItemAvatar>{" "}
              <ListItemText className="text-white">
                {contactInfo.phone}
              </ListItemText>
            </ListItem>
            <ListItem>
              <ListItemAvatar>
                <Email sx={{ color: "white" }} />
              </ListItemAvatar>
              <ListItemText className="text-white">
                {contactInfo.email}
              </ListItemText>
            </ListItem>
            <ListItem>
              <ListItemAvatar sx={{ alignSelf: "start" }}>
                <LinkedIn sx={{ color: "white" }} />
              </ListItemAvatar>
              <ListItemText className="text-white">
                <a href="http://www.linkedin.com/in/faiza-faizan-b-s-qasp-s-509b03206">
                  Faiza Faizan (B.S, QASP-S)
                </a>
              </ListItemText>
            </ListItem>
          </List>
          <div className="flex gap-2">
            <div className="w-[30px] h-[30px] bg-white rounded-full flex items-center justify-center">
              <LinkedIn sx={{ color: "black" }} />
            </div>
            <div className="relative">
              <div className="w-[30px] h-[30px] bg-white rounded-full flex items-center justify-center">
                <img
                  src="https://c.animaapp.com/mc6n3jxhPDSCCl/img/vector-1.svg"
                  alt="Instagram"
                  className="w-[15px] h-[15px]"
                />
              </div>
              <img
                src="https://c.animaapp.com/mc6n3jxhPDSCCl/img/clarity-cursor-hand-click-line.svg"
                alt="Hand"
                className="absolute top-[26px] left-[13px] w-6 h-6"
              />
            </div>
            <div className="w-[30px] h-[30px] bg-[#1a1a1a] rounded-full flex items-center justify-center">
              <Email sx={{ color: "white" }} />
            </div>
          </div>
        </div>
        <div className="w-full p-10 flex flex-col gap-4">
          <div className="flex flex-col t:flex-row gap-4">
            <TextField label="First Name" fullWidth variant="standard" />
            <TextField
              label="Last Name"
              defaultValue="Doe"
              fullWidth
              variant="standard"
            />
          </div>
          <div className="flex flex-col t:flex-row gap-4">
            <TextField
              label="Email"
              fullWidth
              variant="standard"
              type="email"
            />
            <div className="relative w-full">
              <TextField
                label="Phone Number"
                defaultValue="+1 012 3456 789"
                fullWidth
                variant="standard"
              />
              <img
                src="https://c.animaapp.com/mc6n3jxhPDSCCl/img/clarity-cursor-hand-click-line.svg"
                alt="Cursor"
                className="absolute right-0 bottom-0 w-6 h-6"
              />
            </div>
          </div>
          <FormControl>
            <FormLabel className="text-start text-[#4BB7BA]">
              Enquiry Type
            </FormLabel>
            <RadioGroup row defaultValue="general1">
              {subjectOptions.map((option) => (
                <FormControlLabel
                  key={option.id}
                  value={option.id}
                  control={
                    <Radio
                      sx={{
                        color: "#4BB7BA[800]",
                        "&.Mui-checked": {
                          color: "#4BB7BA[600]",
                        },
                      }}
                      checked={option.checked}
                    />
                  }
                  label={option.label}
                />
              ))}
            </RadioGroup>
          </FormControl>
          <TextField
            label="Message"
            placeholder="Write your message.."
            multiline
            minRows={3}
            variant="standard"
            fullWidth
          />
          <div className="flex justify-end">
            <Button
              variant="contained"
              sx={{
                borderRadius: 4,
                px: 6,
                py: 1.5,
                bgcolor: "#F97544",
                boxShadow: "0px 0px 14px #0000001f",
              }}
            >
              Send Message
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ContactInfoSection;
