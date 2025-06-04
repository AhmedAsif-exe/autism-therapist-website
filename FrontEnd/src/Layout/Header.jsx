import { useEffect, useState } from "react";
import {
  AccountCircle,
  ShoppingCart,
  ArrowDropDownTwoTone,
} from "@mui/icons-material";
import { logout } from "../axiosInstance";
import { Avatar, Box, Button } from "@mui/material";
import { toast } from "react-toastify";
import { useAuth } from "Utils/Context";
// import SitemarkIcon from "./SitemarkIcon";
export default function Header() {
  const { user, loggedIn, loading } = useAuth();
  console.log(user);
  return (
    <header
      className="p-4 border-b border-orange-500 flex justify-between items-center flex-wrap sticky top-0 z-[1000]"
      style={{
        backgroundColor: "white",
        paddingLeft: "40px",
        paddingRight: "40px",
      }}
    >
      <h1 className="text-xl font-bold " style={{ color: "#265C7E" }}>
        ABA<span style={{ color: "#f97544" }}>.Virtual</span>
      </h1>
      <nav className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
        <a href="/" className="hover:text-orange-500">
          Home
        </a>
        <a href="#about" className="hover:text-orange-500">
          About
        </a>
        <a href="#testimonials" className="hover:text-orange-500">
          Testimonials
        </a>
        <a href="blogs" className="block hover:orange-600 ">
          Blogs
        </a>

        <div className="relative group">
          <a href="#e-commerce" className="hover:text-orange-500">
            E-Commerce
            <ArrowDropDownTwoTone />
          </a>
          <div className="absolute hidden group-hover:block bg-white p-2 rounded mt-2">
            <a
              href="#resources"
              className="block hover:orange-600 p-1 text-left"
            >
              Resources
            </a>
            <a href="#games" className="block hover:orange-600 p-1 text-left">
              Games
            </a>
          </div>
        </div>
        <a href="#contact" className="block hover:orange-600 p-1 text-left">
          Contact
        </a>
      </nav>
      {loading ? null : !loggedIn ? (
        <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded md:ml-4">
          Login
        </button>
      ) : (
        <Box display="flex" justifyContent={"space-between"} width={"200px"}>
          <ShoppingCart
            sx={{ color: "#265c7e", height: "30px", width: "30px" }}
          />

          <Button
            sx={{
              backgroundColor: "#f97316", // Tailwind's orange-500
              color: "white",
              borderRadius: 1,
              ml: { md: 4 },
              "&:hover": {
                backgroundColor: "#ea580c", // Tailwind's orange-600
              },
            }}
            endIcon={
              !user?.pfp ? (
                <AccountCircle sx={{ height: "30px", width: "30px" }} />
              ) : (
                <Avatar
                  src={console.log(user?.pfp) || user?.pfp}
                  sx={{ height: "30px", width: "30px" }}
                />
              )
            }
            onClick={async () => {
              await logout();
              toast.success("Logged Out Successfully");
            }}
          >
            {user.name}
          </Button>
        </Box>
      )}
    </header>
  );
}
