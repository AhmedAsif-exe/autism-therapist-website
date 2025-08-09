import { Container, Box, Typography } from "@mui/material";
const PageTemplate = ({ children, title, subtitle, src }) => {
  return (
    <Container
      maxWidth="100%"
      component="main"
      sx={{ display: "flex", flexDirection: "column", my: 2 }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          maxWidth: "100%",
          Height: "100vh",
        }}
      >
        <Box
          sx={{
            position: "relative",
            backgroundImage: `url(${src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            padding: "100px 0",
            borderRadius: "10px",
            overflow: "hidden", // ensures overlay stays inside
          }}
        >
          {/* Overlay */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.20)", // correct alpha format
              zIndex: 1,
            }}
          />

          {/* Content on top */}
          <Box sx={{ position: "relative", zIndex: 2, textAlign: "center" }}>
            <h1 className="ml:text-[70px] text-[40px] text-[#f97544] font-[raleway] mb-4">
              {title}
            </h1>
            <p className="text-white ml:text-[20px] text-[14px]">{subtitle}</p>
          </Box>
        </Box>

        {children}
      </Box>
    </Container>
  );
};
export default PageTemplate;
