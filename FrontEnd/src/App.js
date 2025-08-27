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
import { ReceptiveFunctionGame } from "Pages/Games/Game1";
import GamesHome from "Pages/Games/GamesHome";
import { Game2 } from "Pages/Games/Game2";
import { Game3 } from "Pages/Games/Game3";
import { Game4 } from "Pages/Games/Game4";
import { Game5 } from "Pages/Games/Game5";
import { Game6 } from "Pages/Games/Game6";
import { Game7 } from "Pages/Games/Game7";
import { Game8 } from "Pages/Games/Game8";
import { Game9 } from "Pages/Games/Game9";
import { Game10 } from "Pages/Games/Game10";
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
                  <div className="t:px-0 px-[25px]">
                    <Expertise />
                  </div>
                  <ResourcesPreview />
                  <Contact />
                  <GamesHome />
                </>
              }
            />
            {/* Add more routes here if needed */}
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blogs/:id" element={<BlogPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Login />} />
            <Route path="/about" element={<About />} />
            <Route path="/games" element={<GamesHome />} />
            <Route path="/games/1" element={<ReceptiveFunctionGame />} />
            <Route path="/games/2" element={<Game2 />} />
            <Route path="/games/3" element={<Game3 />} />
            <Route path="/games/4" element={<Game4 />} />
            <Route path="/games/5" element={<Game5 />} />
            <Route path="/games/6" element={<Game6 />} />
            <Route path="/games/7" element={<Game7 />} />
            <Route path="/games/8" element={<Game8 />} />
            <Route path="/games/9" element={<Game9 />} />
            <Route path="/games/10" element={<Game10 />} />
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
