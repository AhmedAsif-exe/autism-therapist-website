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
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/X";
// import SitemarkIcon from "./SitemarkIcon";

function Copyright() {
  return (
    <Typography variant="body2" sx={{ color: "#ffffff", mt: 1 }}>
      {"Copyright © "}
      <Link color="#ffffff" href="#">
        Faiza.
      </Link>
      &nbsp;
      {new Date().getFullYear()}
    </Typography>
  );
}

export default function Footer() {
  return (
    <Container
      maxWidth={false}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: { xs: 4, sm: 8 },
        // m: 0,
        width: "100%",
        py: { xs: 8, sm: 10 },
        textAlign: { sm: "center", md: "left" },
        backgroundColor: "#042539",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          width: "100%",
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            minWidth: { xs: "100%", sm: "60%" },
          }}
        >
          <Box sx={{ width: { xs: "100%", sm: "60%" } }}>
            {/* <SitemarkIcon /> */}
            <Typography
              variant="body2"
              gutterBottom
              sx={{
                fontWeight: 600,
                mt: 2,
                fontFamily: "'Raleway', sans-serif",
                fontSize: "20px",
                color: "white",
              }}
            >
              Join the newsletter
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", mb: 2, color: "white" }}
            >
              Subscribe for weekly updates. No spams ever!
            </Typography>
            <InputLabel htmlFor="email-newsletter" sx={{ color: "white" }}>
              Email
            </InputLabel>
            <Stack direction="row" spacing={1} useFlexGap>
              <TextField
                id="email-newsletter"
                hiddenLabel
                size="small"
                // variant="outlined"
                fullWidth
                aria-label="Enter your email address"
                placeholder="Your email address"
                slotProps={{
                  htmlInput: {
                    autoComplete: "off",
                    "aria-label": "Enter your email address",
                  },
                }}
                sx={{
                  width: "250px",
                  color: "whiteSmoke",
                  backgroundColor: "white",
                }}
              />
              <Button
                sx={{
                  borderRadius: "5px",
                  // fontSize: "20px",
                  padding: "10px 20px",
                  backgroundColor: "#EC5923",
                  color: "white",
                  borderWidth: "0px",
                }}
              >
                Subscribe
              </Button>
            </Stack>
          </Box>
        </Box>
        <Box
          sx={{
            display: { xs: "none", sm: "flex" },
            flexDirection: "column",
            gap: 1,
          }}
        >
          <Typography
            variant="body2"
            sx={{ fontWeight: "medium", color: "#EC5923" }}
          >
            Portfolio
          </Typography>
          <Link color="#ffffff" variant="body2" href="#">
            Home
          </Link>
          <Link color="#ffffff" variant="body2" href="#">
            About
          </Link>
          <Link color="#ffffff" variant="body2" href="#">
            Testimonials
          </Link>
          <Link color="#ffffff" variant="body2" href="#">
            Mentors
          </Link>
        </Box>
        <Box
          sx={{
            display: { xs: "none", sm: "flex" },
            flexDirection: "column",
            gap: 1,
          }}
        >
          <Typography
            variant="body2"
            sx={{ fontWeight: "medium", color: "#EC5923" }}
          >
            Content Writing
          </Typography>
          <Link color="#ffffff" variant="body2" href="#">
            Blogs
          </Link>
        </Box>
        <Box
          sx={{
            display: { xs: "none", sm: "flex" },
            flexDirection: "column",
            gap: 1,
          }}
        >
          <Typography
            variant="body2"
            sx={{ fontWeight: "medium", color: "#EC5923" }}
          >
            E-Commerce
          </Typography>
          <Link color="#ffffff" variant="body2" href="#">
            Resources
          </Link>
          <Link color="#ffffff" variant="body2" href="#">
            Contact
          </Link>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          pt: { xs: 4, sm: 8 },
          width: "100%",
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <div>
          <Copyright />
        </div>
        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          sx={{ justifyContent: "left", color: "white" }}
        >
          <IconButton
            color="inherit"
            size="small"
            aria-label="GitHub"
            sx={{ alignSelf: "center" }}
          >
            <FacebookIcon />
          </IconButton>
          <IconButton
            color="inherit"
            size="small"
            aria-label="X"
            sx={{ alignSelf: "center" }}
          >
            <TwitterIcon />
          </IconButton>
          <IconButton
            color="inherit"
            size="small"
            aria-label="Instagram"
            sx={{ alignSelf: "center" }}
          >
            <InstagramIcon />
          </IconButton>
        </Stack>
      </Box>
    </Container>
  );
}
