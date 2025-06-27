import * as React from "react";
import { styled } from "@mui/material/styles";
import {
  Box,
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Container,
  Divider,
  MenuItem,
  Drawer,
  Typography,
  Avatar,
  Badge,
} from "@mui/material";
import { logout } from "axiosInstance";
import { toast } from "react-toastify";
import { useProjectContext } from "Utils/Context";
import logo from "Assets/Images/logo-removebg-preview.png";
import MenuIcon from "@mui/icons-material/Menu";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useNavigate } from "react-router-dom";
const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexShrink: 0,
  borderRadius: `calc(${theme.shape.borderRadius}px + 8px)`,
  backdropFilter: "blur(24px)",
  border: "1px solid",
  borderColor: (theme.vars || theme).palette.divider,
  //   backgroundColor: theme.vars
  //     ? `rgba(${theme.vars.palette.background.defaultChannel} / 0.4)`
  //     : alpha(theme.palette.background.default, 0.4),
  backgroundColor: "rgba(4, 37, 57, 0.8)",
  boxShadow: (theme.vars || theme).shadows[1],
  padding: "8px 12px",
}));

export default function AppAppBar() {
  const [open, setOpen] = React.useState(false);
  const { user, loggedIn, loading, cart } = useProjectContext();
  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const navigate = useNavigate();
  return (
    <AppBar
      position="fixed"
      enableColorOnDark
      sx={{
        boxShadow: 0,
        bgcolor: "transparent",
        backgroundImage: "none",
        mt: "calc(var(--template-frame-height, 0px) + 28px)",
      }}
    >
      <Container maxWidth="lg">
        <StyledToolbar variant="dense" disableGutters>
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              alignItems: "center",
              px: 0,
              justifyContent: "space-between",
            }}
          >
            <Box
              display={"flex"}
              alignItems={"center"}
              flexDirection={"row"}
              justifyContent={"space-between"}
              onClick={navigate.bind(this, "/")}
            >
              <Avatar src={logo} />
              <Typography px={"10px"} fontWeight="bold" color="#FFFFFF">
                aba
                <Box component="span" sx={{ color: "#f97544" }}>
                  .virtual
                </Box>
              </Typography>
            </Box>

            <Box sx={{ display: { xs: "none", md: "flex" } }}>
              <Button
                variant="text"
                color="info"
                size="small"
                sx={{ minWidth: 0, color: "#ffffff", mx: 1 }}
                onClick={navigate.bind(this, "/")}
              >
                Home
              </Button>
              <Button
                variant="text"
                color="info"
                size="small"
                sx={{ minWidth: 0, color: "#ffffff", mx: 1 }}
                onClick={navigate.bind(this, "/about")}
              >
                About
              </Button>

              <Button
                variant="text"
                color="info"
                size="small"
                sx={{ minWidth: 0, color: "#ffffff", mx: 1 }}
                onClick={navigate.bind(this, "/blogs")}
              >
                Blog
              </Button>
              <Button
                variant="text"
                color="info"
                size="small"
                sx={{ minWidth: 0, color: "#ffffff", mx: 1 }}
                onClick={navigate.bind(this, "/resources")}
              >
                Resources
              </Button>
              <Button
                variant="text"
                color="info"
                size="small"
                onClick={navigate.bind(this, "/games")}
                sx={{ minWidth: 0, color: "#ffffff", mx: 1 }}
              >
                Games
              </Button>
              <Button
                variant="text"
                size="small"
                onClick={navigate.bind(this, "/contact")}
                sx={{ minWidth: 0, color: "#ffffff", mx: 1 }}
              >
                Contact
              </Button>
            </Box>

            {loggedIn ? (
              <Box
                sx={{
                  display: { xs: "none", md: "flex" },
                  gap: 1,
                  alignItems: "center",
                }}
              >
                
                <Button
                  sx={{ padding: 0 }}
                  onClick={async () => {
                    await logout();
                    toast.success("Logged Out Successfully");
                  }}
                >
                  {<Avatar src={user.pfp} />}
                </Button>
              </Box>
            ) : (
              <Box
                sx={{
                  display: { xs: "none", md: "flex" },
                  gap: 1,
                  alignItems: "center",
                }}
              >
                <Button
                  color="#f97544"
                  variant="text"
                  size="small"
                  onClick={navigate.bind(this, "/login")}
                >
                  Sign in
                </Button>
                <Button
                  sx={{ backgroundColor: "#f97544" }}
                  variant="contained"
                  size="small"
                  onClick={navigate.bind(this, "/signup")}
                >
                  Sign up
                </Button>
              </Box>
            )}
          </Box>
          <Box sx={{ display: { xs: "flex", md: "none" }, gap: 1 }}>
            <IconButton aria-label="Menu button" onClick={toggleDrawer(true)}>
              <MenuIcon sx={{ color: "white" }} />
            </IconButton>
            <Drawer
              anchor="top"
              open={open}
              onClose={toggleDrawer(false)}
              PaperProps={{
                sx: {
                  top: "var(--template-frame-height, 0px)",
                },
              }}
            >
              <Box
                sx={{
                  p: 2,
                  backgroundColor: "rgba(4, 37, 57, 0.8)",
                  backdropFilter: "blur(24px)",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <IconButton onClick={toggleDrawer(false)}>
                    <CloseRoundedIcon sx={{ color: "white" }} />
                  </IconButton>
                </Box>{" "}
                <MenuItem>
                  <Button
                    variant="text"
                    color="info"
                    size="small"
                    sx={{ minWidth: 0, color: "#ffffff" }}
                    onClick={navigate.bind(this, "/")}
                  >
                    Home
                  </Button>
                </MenuItem>
                <MenuItem>
                  <Button
                    variant="text"
                    color="info"
                    size="small"
                    sx={{ minWidth: 0, color: "#ffffff" }}
                    onClick={navigate.bind(this, "/about")}
                  >
                    About
                  </Button>
                </MenuItem>
               
                <MenuItem>
                  <Button
                    variant="text"
                    color="info"
                    size="small"
                    sx={{ minWidth: 0, color: "#ffffff" }}
                    onClick={navigate.bind(this, "/blogs")}
                  >
                    Blog
                  </Button>
                </MenuItem>
                <MenuItem>
                  {" "}
                  <Button
                    variant="text"
                    color="info"
                    size="small"
                    sx={{ minWidth: 0, color: "#ffffff" }}
                    onClick={navigate.bind(this, "/resources")}
                  >
                    Resources
                  </Button>
                </MenuItem>
                <MenuItem>
                  {" "}
                  <Button
                    variant="text"
                    color="info"
                    size="small"
                    onClick={navigate.bind(this, "/games")}
                    sx={{ minWidth: 0, color: "#ffffff" }}
                  >
                    Games
                  </Button>
                </MenuItem>
                <MenuItem>
                  {" "}
                  <Button
                    variant="text"
                    size="small"
                    onClick={navigate.bind(this, "/contact")}
                    sx={{ minWidth: 0, color: "#ffffff" }}
                  >
                    Contact
                  </Button>
                </MenuItem>
                <Divider sx={{ my: 3 }} />
                <MenuItem>
                  <Button
                    color="#f97544"
                    variant="text"
                    size="small"
                    fullWidth
                    sx={{ color: "white" }}
                    onClick={navigate.bind(this, "/login")}
                  >
                    Sign in
                  </Button>
                </MenuItem>
                <MenuItem>
                  <Button
                    sx={{ backgroundColor: "#f97544" }}
                    variant="contained"
                    size="small"
                    fullWidth
                    onClick={navigate.bind(this, "/signup")}
                  >
                    Sign up
                  </Button>
                </MenuItem>
              </Box>
            </Drawer>
          </Box>
        </StyledToolbar>
      </Container>
    </AppBar>
  );
}
