import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BannerSection from "./Pages/Home/BannerSection/BannerSection";
import WhatIDoSection from "./Pages/Home/WhatIDoSection/WhatIDoSection";
import OurProcessSection from "./Pages/Home/OurProcessSection/OurProcessSection";
import AboutMeSection from "./Pages/Home/AboutMeSection/AboutMeSection";
import TestimonialSection from "Pages/Home/TestimonialSection/TestimonialSection";
import ExpertiseSection from "Pages/Home/ExpertiseSection/ExpertiseSection";
import MentorSection from "Pages/Home/MentorSection/MentorSection";
import "react-responsive-3d-carousel/dist/styles.css";
import Layout from "Layout/Layout";
import Blogs from "./Pages/Blogs/Blogs";
import BlogPage from "Pages/BlogPage/BlogPage";
import Login from "Pages/Login/Login";
function App() {
  return (
    <div className="App">
      <Router>
        <Layout>
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <BannerSection />
                  <OurProcessSection />
                  <AboutMeSection />
                  <TestimonialSection />
                </>
              }
            />
            {/* Add more routes here if needed */}
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blogs/:id" element={<BlogPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Login />} />
          </Routes>
        </Layout>
      </Router>
    </div>
  );
}

export default App;
