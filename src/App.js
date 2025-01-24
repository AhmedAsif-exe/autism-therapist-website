import "./App.css";
import BannerSection from "./Pages/Home/BannerSection/BannerSection";
import AboutUsSection from "./Pages/Home/AboutUsSection/AboutUsSection";
import OurProcessSection from "./Pages/Home/OurProcessSection/OurProcessSection";
function App() {
  return (
    <div className="App">
      <BannerSection />
      <AboutUsSection />
      <OurProcessSection />
    </div>
  );
}

export default App;
