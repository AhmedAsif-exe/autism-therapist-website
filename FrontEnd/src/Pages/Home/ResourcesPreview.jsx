import resources from "Assets/Images/resources.jpg";
import { Typography } from "@mui/material";
import { styled } from "@mui/system";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { useEffect } from "react";
import ResourceCard from "Pages/Resources/ResourceCard";
const sampleResources = [
  {
    id: "res001",
    title: "Understanding Autism - Beginner's Guide",
    category: "Downloadable",
    type: "PDF",
    price: 5,
    url: "Invoice-1_byyplx",
    image: "https://picsum.photos/800/450?random=1",
    description:
      "This beginner's guide provides a clear and accessible introduction to autism spectrum disorder. It explains the characteristics, challenges, and strengths of individuals on the spectrum using real-life examples. Whether you're a parent just starting your journey or a caregiver looking to understand more, this guide offers compassionate insights and practical advice to build empathy and awareness. Ideal for anyone new to the topic.",
  },
  {
    id: "res002",
    title: "Daily Routine Visuals Pack",
    category: "Downloadable",
    type: "PPT",
    price: 7,
    url: "Invoice-1_byyplx",
    image: "https://picsum.photos/800/450?random=2",
    description:
      "Designed to support structure and predictability, this pack includes a wide variety of editable visual routine cards suitable for daily activities. From morning hygiene to bedtime routines, each visual is easy to customize and print. These aids can help reduce anxiety, improve independence, and create a smoother flow to the day for children with autism. Great for home, school, or therapy settings.",
  },
  {
    id: "res003",
    title: "Positive Reinforcement Basics",
    category: "Training",
    type: "Short Video",
    price: 8,
    url: "zyqdtjjaeohr8ey1ifu9",
    image: "https://picsum.photos/800/450?random=3",
    description:
      "This short, focused training video introduces the fundamental principles of positive reinforcement and how they apply to behavior management in autism therapy. Learn how to identify desired behaviors, choose effective rewards, and implement a consistent reinforcement system. The video includes real-life examples and tips for parents and educators to apply immediately in daily interactions.",
  },
];

const ResourcesPreview = () => {
  
  useEffect(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        start: "top center",
        trigger: "#resource-section",
        once: true,
      },
    });

    tl.fromTo(
      "#resource-section",
      {
        clipPath: "inset(0% 0% 100% 0%)",
        maxHeight: 0,
        overflow: "hidden",
      },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        maxHeight: 2000,
        duration: 3,
        ease: "power2.out",
      }
    );
  }, []);
  return (
    <div
      className="relative w-full overflow-hidden bg-center bg-cover after:absolute after:inset-0 after:bg-black after:opacity-50 after:content-['']"
      style={{ backgroundImage: `url(${resources})` }}
      id="resource-section"
    >
      <div className=" relative z-10 p-4 px-10 text-white">
        <h2 className="ms:text-[70px] text-[40px] text-[#f97544] mt-2 font-[raleway]">
          Resources
        </h2>
        <p className="ms:text-sm text-xs mt-2">
          <span className="text-[#f97544]">//</span> Explore curated resources
          designed to support growth, learning, and therapy progress.{" "}
          <span className="text-[#f97544]">//</span>
        </p>
        <div className="grid grid-cols-1 my-16 ml:grid-cols-2 t:grid-cols-3 gap-8">
          {sampleResources.map((r) => (
            <ResourceCard resource={r} />
          ))}
        </div>
      </div>
      <a
        className="text-[#f97544] z-10 absolute bottom-5 px-4 py-2 rounded-lg right-10 cursor hover:underline"
        href="/resources"
      >
        Read More
      </a>
    </div>
  );
};

export default ResourcesPreview;
