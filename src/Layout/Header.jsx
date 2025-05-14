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
import { ArrowDropDownTwoTone } from "@mui/icons-material";
// import SitemarkIcon from "./SitemarkIcon";
export default function Header() {
  return (
    <header
      className="p-4 border-b border-orange-500 flex justify-between items-center flex-wrap sticky top-0 z-[1000]"
      style={{ backgroundColor: "white" }}
    >
      <h1 className="text-xl font-bold " style={{ color: "#265C7E" }}>
        ABA<span style={{ color: "#f97544" }}>.Virtual</span>
      </h1>
      <nav className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
        <a href="#home" className="hover:text-orange-500">
          Home
        </a>
        <a href="#about" className="hover:text-orange-500">
          About
        </a>
        <a href="#testimonials" className="hover:text-orange-500">
          Testimonials
        </a>

        <div className="relative group">
          <a href="#content-writing" className="hover:text-orange-500">
            Content Writing <ArrowDropDownTwoTone />
          </a>
          <div className="absolute hidden group-hover:block bg-white p-2 rounded mt-2 text-left">
            <a href="#blogs" className="block hover:orange-600 p-1">
              Blogs
            </a>
            <a href="#research" className="block hover:orange-600 p-1">
              Research
            </a>
          </div>
        </div>
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
      <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded md:ml-4">
        Login
      </button>
    </header>
  );
}
