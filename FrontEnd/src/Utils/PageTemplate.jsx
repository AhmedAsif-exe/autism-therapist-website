import { Container, Box, Typography } from "@mui/material";
const PageTemplate = ({ children, title, subtitle, src }) => {
  console.log(src);
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
            <Typography
              variant="h1"
              gutterBottom
              color="#f97544"
              fontFamily={"Raleway, serif"}
            >
              {title}
            </Typography>
            <Typography color="#ffffff" fontSize={"20px"}>
              <span style={{ color: "#f97544" }}>//</span> {subtitle}{" "}
              <span style={{ color: "#f97544" }}>//</span>
            </Typography>
          </Box>
        </Box>

        {children}
      </Box>
    </Container>
  );
};
export default PageTemplate;
