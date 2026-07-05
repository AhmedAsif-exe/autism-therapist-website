import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { LinkedIn } from "@mui/icons-material";
import api from "axiosInstance";
import { toast } from "react-toastify";
import InstagramIcon from "@mui/icons-material/Instagram";
import { useState } from "react";

const legalLinks = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/refund-policy", label: "Refund Policy" },
  { href: "/terms-and-conditions", label: "Terms & Conditions" },
  { href: "/service-delivery-policy", label: "Service Delivery Policy" },
];

const navColumns = [
  {
    title: "Portfolio",
    links: [
      { href: "/", label: "Home" },
      { href: "/about", label: "About" },
      { href: "/testimonials", label: "Testimonials" },
    ],
  },
  {
    title: "Content Writing",
    links: [{ href: "/blogs", label: "Blogs" }],
  },
  {
    title: "E-Commerce",
    links: [
      { href: "/resources", label: "Resources" },
      { href: "/games", label: "Games" },
      { href: "/contact", label: "Contact" },
    ],
  },
  { title: "Legal", links: legalLinks },
];

function Copyright() {
  return (
    <Typography variant="body2" sx={{ color: "#ffffff", mt: { xs: 0, sm: 1 } }}>
      {"Copyright © "}
      <Link color="#ffffff" href="#">
        aba.virtual
      </Link>
      &nbsp;
      {new Date().getFullYear()}
    </Typography>
  );
}

const NavColumn = ({ title, links }) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      gap: 1,
      "@media (max-width: 1440px)": {
        alignItems: "center",
        textAlign: "center",
      },
    }}
  >
    <Typography variant="body2" sx={{ fontWeight: "medium", color: "#EC5923" }}>
      {title}
    </Typography>
    {links.map(({ href, label }) => (
      <Link key={href} color="#ffffff" variant="body2" href={href}>
        {label}
      </Link>
    ))}
  </Box>
);

export default function Footer() {
  const [email, setEmail] = useState("");
  const handleSubscribe = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast.info("Please enter a valid email address.");
      return;
    }

    try {
      const res = await api.post("newsletter/subscribe", { email });

      if (res.data.success) {
        setEmail("");
        toast.success(res.data.message || "You’ve successfully subscribed!");
      } else {
        toast.error(res.data.error || "Subscription failed. Please try again.");
      }
    } catch (err) {
      console.error("Subscription error:", err);

      if (err.response) {
        toast.error(
          err.response.data.error || "Server error, try again later."
        );
      } else if (err.request) {
        toast.error("No response from server. Check your connection.");
      } else {
        toast.error("Unexpected error occurred.");
      }
    }
  };

  return (
    <Container
      maxWidth={false}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: { xs: 4, md: 6 },
        width: "100%",
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 6, sm: 8, md: 10 },
        backgroundColor: "#042539",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },
          gap: { xs: 5, md: 6 },
          width: "100%",
          "@media (max-width: 1440px)": {
            alignItems: "center",
            justifyContent: "center",
          },
          "@media (min-width: 1441px)": {
            justifyContent: "space-between",
          },
        }}
      >
        <Box
          sx={{
            width: { xs: "100%", lg: "42%" },
            maxWidth: 480,
            "@media (max-width: 1440px)": {
              textAlign: "center",
              mx: "auto",
            },
          }}
        >
          <Typography
            variant="body2"
            gutterBottom
            sx={{
              fontWeight: 600,
              fontFamily: "'Raleway', sans-serif",
              fontSize: { xs: "18px", sm: "20px" },
              color: "white",
            }}
          >
            Stay Updated with Our Blog
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, color: "white" }}>
            Subscribe to get the latest posts and updates delivered straight to
            your inbox.
          </Typography>
          <InputLabel
            htmlFor="email-newsletter"
            sx={{
              color: "white",
              "@media (max-width: 1440px)": {
                width: "100%",
                textAlign: "center",
              },
            }}
          >
            Email
          </InputLabel>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            useFlexGap
            sx={{
              width: "100%",
              "@media (max-width: 1440px)": {
                alignItems: "center",
                justifyContent: "center",
              },
            }}
          >
            <TextField
              id="email-newsletter"
              hiddenLabel
              size="small"
              value={email}
              fullWidth
              aria-label="Enter your email address"
              placeholder="Your email address"
              onChange={(e) => setEmail(e.target.value)}
              slotProps={{
                htmlInput: {
                  autoComplete: "off",
                  "aria-label": "Enter your email address",
                },
              }}
              sx={{ color: "whiteSmoke", backgroundColor: "white" }}
            />
            <Button
              onClick={handleSubscribe}
              sx={{
                borderRadius: "5px",
                padding: "10px 20px",
                backgroundColor: "#EC5923",
                color: "white",
                borderWidth: "0px",
                width: { xs: "100%", sm: "auto" },
                flexShrink: 0,
                "&:hover": { backgroundColor: "#d44d1c" },
              }}
            >
              Subscribe
            </Button>
          </Stack>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, minmax(0, 1fr))",
              sm: "repeat(2, minmax(0, 1fr))",
              md: "repeat(4, auto)",
            },
            gap: { xs: 3, sm: 4, md: 5 },
            width: { xs: "100%", lg: "auto" },
            flex: 1,
            "@media (max-width: 1440px)": {
              justifyContent: "center",
              justifyItems: "center",
              mx: "auto",
            },
            "@media (min-width: 1441px)": {
              justifyContent: "end",
            },
          }}
        >
          {navColumns.map((column) => (
            <NavColumn key={column.title} {...column} />
          ))}
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "center", sm: "flex-end" },
          justifyContent: "space-between",
          gap: 2,
          pt: { xs: 3, sm: 4 },
          width: "100%",
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Copyright />
        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          sx={{ justifyContent: "center", color: "white" }}
        >
          <IconButton
            color="inherit"
            size="small"
            aria-label="LinkedIn"
            sx={{ alignSelf: "center" }}
          >
            <a href="http://www.linkedin.com/in/faiza-faizan-b-s-qasp-s-509b03206">
              <LinkedIn />
            </a>
          </IconButton>
          <IconButton
            color="inherit"
            size="small"
            aria-label="Instagram"
            sx={{ alignSelf: "center" }}
          >
            <a href="https://www.instagram.com/aba.virtual/">
              <InstagramIcon />
            </a>
          </IconButton>
        </Stack>
      </Box>
    </Container>
  );
}
