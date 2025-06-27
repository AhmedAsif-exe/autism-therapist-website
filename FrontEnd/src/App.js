import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BannerSection from "./Pages/Home/BannerSection";
import AboutMeSection from "./Pages/Home/AboutMeSection";
import TestimonialSection from "Pages/Home/TestimonialSection/TestimonialSection";
// import "react-responsive-3d-carousel/dist/styles.css";
import Layout from "Layout/Layout";
import Blogs from "./Pages/Blogs/Blogs";
import BlogPage from "Pages/BlogPage/BlogPage";
import Login from "Pages/Login/Login";
import About from "Pages/About/About";
import Resources from "Pages/Resources/Resources";
import SuccessPayment from "Utils/SuccessPayment";
import ErrorPayment from "Utils/ErrorPayment";
import VideoPlayer from "Pages/VideoPlayer/VideoPlayer";
import Process from "Pages/Home/Process/Process";
import BlogPreview from "Pages/Home/BlogPreview";
import Contact from "Pages/Contact/Contact";
import ResourcesPreview from "Pages/Home/ResourcesPreview";
import Expertise from "Pages/About/PerksSection";
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
                  <Process />
                  <AboutMeSection />
                  <TestimonialSection />
                  <BlogPreview />
                  <Expertise />
                  <ResourcesPreview />
                  <Contact />
                </>
              }
            />
            {/* Add more routes here if needed */}
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blogs/:id" element={<BlogPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Login />} />
            <Route path="/about" element={<About />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/resources/:id" element={<VideoPlayer />} />
            <Route
              path="/contact"
              element={
                <div className="py-14">
                  <Contact />
                </div>
              }
            />
            <Route path="/success" element={<SuccessPayment />} />
            <Route path="/error" element={<ErrorPayment />} />
          </Routes>
        </Layout>
      </Router>
    </div>
  );
}

export default App;
