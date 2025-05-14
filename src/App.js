import "./App.css";
import BannerSection from "./Pages/Home/BannerSection/BannerSection";
import WhatIDoSection from "./Pages/Home/WhatIDoSection/WhatIDoSection";
import OurProcessSection from "./Pages/Home/OurProcessSection/OurProcessSection";
import AboutMeSection from "./Pages/Home/AboutMeSection/AboutMeSection";
import TestimonialSection from "Pages/Home/TestimonialSection/TestimonialSection";
import ExpertiseSection from "Pages/Home/ExpertiseSection/ExpertiseSection";
import MentorSection from "Pages/Home/MentorSection/MentorSection";
import "react-responsive-3d-carousel/dist/styles.css";
import Footer from "Layout/Footer";
import Header from "Layout/Header";

function App() {
  return (
    <div className="App">
      <Header />
      <BannerSection />
      {/* 
      <WhatIDoSection />
       */}
      <OurProcessSection />
      <AboutMeSection />
      <TestimonialSection />
      {/* <MentorSection /> */}
      {/* <ExpertiseSection /> */}
      <Footer />
    </div>
  );
}

export default App;
