import "./App.css";
import BannerSection from "./Pages/Home/BannerSection/BannerSection";
import WhatIDoSection from "./Pages/Home/WhatIDoSection/WhatIDoSection";
import OurProcessSection from "./Pages/Home/OurProcessSection/OurProcessSection";
import AboutMeSection from "./Pages/Home/AboutMeSection/AboutMeSection";
import SectionDivider from "Utils/SectionDivider/SectionDivider";
import TestimonialSection from "Pages/Home/TestimonialSection/TestimonialSection";
import "react-responsive-3d-carousel/dist/styles.css";

function App() {
  return (
    <div className="App">
      <BannerSection />
      {/* <SectionDivider /> */}
      <WhatIDoSection />
      {/* <SectionDivider /> */}
      <OurProcessSection />
      <TestimonialSection />
      {/* <SectionDivider />
      <AboutMeSection /> */}
    </div>
  );
}

export default App;
