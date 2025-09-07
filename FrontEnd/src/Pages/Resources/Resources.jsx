import PageTemplate from "Utils/PageTemplate";
import resources from "Assets/Images/resources.jpg";
import { useState } from "react";
import ResourceList from "./ResourceList";
import CartDrawer from "./CartDrawer";
import Filter from "Utils/Filter";
const sampleResources = [
  // {
  //   id: "res001",
  //   title: "Understanding Autism - Beginner's Guide",
  //   category: "Downloadable",
  //   type: "PDF",
  //   price: 5,
  //   url: "Invoice-1_byyplx",
  //   image: "https://picsum.photos/800/450?random=1",
  //   description:
  //     "This beginner's guide provides a clear and accessible introduction to autism spectrum disorder. It explains the characteristics, challenges, and strengths of individuals on the spectrum using real-life examples. Whether you're a parent just starting your journey or a caregiver looking to understand more, this guide offers compassionate insights and practical advice to build empathy and awareness. Ideal for anyone new to the topic.",
  // },
  // {
  //   id: "res002",
  //   title: "Daily Routine Visuals Pack",
  //   category: "Downloadable",
  //   type: "PPT",
  //   price: 7,
  //   url: "Invoice-1_byyplx",
  //   image: "https://picsum.photos/800/450?random=2",
  //   description:
  //     "Designed to support structure and predictability, this pack includes a wide variety of editable visual routine cards suitable for daily activities. From morning hygiene to bedtime routines, each visual is easy to customize and print. These aids can help reduce anxiety, improve independence, and create a smoother flow to the day for children with autism. Great for home, school, or therapy settings.",
  // },
  // {
  //   id: "res003",
  //   title: "Positive Reinforcement Basics",
  //   category: "Training",
  //   type: "Short Video",
  //   price: 8,
  //   url: "zyqdtjjaeohr8ey1ifu9",
  //   image: "https://picsum.photos/800/450?random=3",
  //   description:
  //     "This short, focused training video introduces the fundamental principles of positive reinforcement and how they apply to behavior management in autism therapy. Learn how to identify desired behaviors, choose effective rewards, and implement a consistent reinforcement system. The video includes real-life examples and tips for parents and educators to apply immediately in daily interactions.",
  // },
  // {
  //   id: "res004",
  //   title: "Managing Meltdowns – Practical Training",
  //   category: "Training",
  //   type: "Long Video",
  //   price: 12,
  //   url: "How_NOT_To_Order_At_An_Indian_Restaurant_-_Trevor_Noah_From_I_Wish_You_Would_on_Netflix_rp3vnz",
  //   image: "https://picsum.photos/800/450?random=4",
  //   description:
  //     "This in-depth video course walks viewers through the emotional and sensory causes behind meltdowns and how to respond with empathy and effectiveness. It includes strategies like creating calm-down zones, using sensory tools, and de-escalation techniques. Ideal for therapists, teachers, and parents, the training empowers caregivers to prevent and manage meltdowns proactively, without shame or punishment.",
  // },
  // {
  //   id: "res005",
  //   title: "Social Stories Template Kit",
  //   category: "Downloadable",
  //   type: "PDF",
  //   price: 6,
  //   url: "Invoice-1_byyplx",
  //   image: "https://picsum.photos/800/450?random=5",
  //   description:
  //     "This printable template pack helps parents and therapists create custom social stories for children with autism. Each template is designed to teach social norms and behaviors through relatable, first-person narratives. Topics include going to school, sharing with others, visiting new places, and more. Social stories help reduce anxiety by preparing children for situations they may find confusing or overwhelming.",
  // },
  // {
  //   id: "res006",
  //   title: "Communication Aids Collection",
  //   category: "Downloadable",
  //   type: "PPT",
  //   price: 10,
  //   url: "Invoice-1_byyplx",
  //   image: "https://picsum.photos/800/450?random=6",
  //   description:
  //     "This downloadable set of augmentative and alternative communication (AAC) resources includes symbol boards, emotion charts, and choice boards. Created for non-verbal or minimally verbal individuals, it empowers children to express needs, make choices, and engage socially. The PowerPoint format allows easy customization for specific vocabularies and routines, making it a must-have toolkit for classrooms and therapy sessions.",
  // },
  // {
  //   id: "res007",
  //   title: "Early Intervention Overview",
  //   category: "Training",
  //   type: "Short Video",
  //   price: 6,
  //   url: "zyqdtjjaeohr8ey1ifu9",
  //   image: "https://picsum.photos/800/450?random=7",
  //   description:
  //     "This brief but impactful video highlights the importance of early intervention in autism treatment. It explains how early diagnosis and support during critical developmental windows can lead to better outcomes in communication, behavior, and social skills. The content is designed for parents and professionals new to early intervention and provides guidance on where to begin and what to expect.",
  // },
  // {
  //   id: "res008",
  //   title: "Advanced Therapy Techniques",
  //   category: "Training",
  //   type: "Long Video",
  //   price: 15,
  //   url: "zyqdtjjaeohr8ey1ifu9",
  //   image: "https://picsum.photos/800/450?random=8",
  //   description:
  //     "This comprehensive training video explores advanced strategies used in behavioral and developmental autism therapies. Techniques include task analysis, shaping complex behaviors, generalization across settings, and integrating technology in sessions. Designed for experienced therapists and educators, it offers research-backed tools and demonstrations to elevate intervention quality and individual outcomes.",
  // },
];

const Resources = (props) => {
  const [category, setCategory] = useState("All");
  const [type, setType] = useState("All");
  const handleClick = (tag) => {
    setCategory(tag);
  };
  return (
    <PageTemplate
      title={"Resources"}
      subtitle={"..support growth, promote learning & strengthen potentials."}
      src={resources}
    >
      <div className="ml:p-6">
        <Filter
          handleClick={handleClick}
          tags={["My-Learning", "Training", "Downloadable"]}
        />
        <ResourceList
          resources={sampleResources}
          category={category}
          type={type}
        />

        <CartDrawer />
      </div>
    </PageTemplate>
  );
};
export default Resources;
