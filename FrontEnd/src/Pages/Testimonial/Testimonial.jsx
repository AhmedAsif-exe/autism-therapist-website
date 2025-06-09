import PageTemplate from "Utils/PageTemplate";

import testimonial from "Assets/Images/About-Us-bg.png"
const Testimonial = ({ children }) => {
  return (
    <PageTemplate
      title={"Testimonial"}
      subtitle={"Real stories from those who’ve experienced the difference firsthand."}
      src={testimonial}
    >
      {children}
    </PageTemplate>
  );
};
export default Testimonial;
