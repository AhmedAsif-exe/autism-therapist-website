import PageTemplate from "Utils/PageTemplate";
import Logo from "Assets/Images/logo.jpg";
const About = ({ children }) => {
  return <PageTemplate title={"About"} subtitle={"Check out my timeline and my trade"} src={Logo}>{children}</PageTemplate>;
};
export default About;
