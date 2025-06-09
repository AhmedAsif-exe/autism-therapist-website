import PageTemplate from "Utils/PageTemplate";
import resources from "Assets/Images/resources.jpg";
import { useState } from "react";
import ResourceList from "./ResourceList";
import CartDrawer from "./CartDrawer";

const sampleResources = [
  {
    id: "res001",
    title: "Understanding Autism - Beginner's Guide",
    category: "Downloadable",
    type: "PDF",
    price: 5,
    url: "/resources/autism-beginners-guide.pdf",
  },
  {
    id: "res002",
    title: "Daily Routine Visuals Pack",
    category: "Downloadable",
    type: "PPT",
    price: 7,
    url: "/resources/daily-routine-visuals.pptx",
  },
  {
    id: "res003",
    title: "Positive Reinforcement Basics",
    category: "Training",
    type: "Short Video",
    price: 8,
    url: "/videos/positive-reinforcement.mp4",
  },
  {
    id: "res004",
    title: "Managing Meltdowns – Practical Training",
    category: "Training",
    type: "Long Video",
    price: 12,
    url: "/videos/managing-meltdowns.mp4",
  },
  {
    id: "res005",
    title: "Social Stories Template Kit",
    category: "Downloadable",
    type: "PDF",
    price: 6,
    url: "/resources/social-stories-kit.pdf",
  },
  {
    id: "res006",
    title: "Communication Aids Collection",
    category: "Downloadable",
    type: "PPT",
    price: 10,
    url: "/resources/communication-aids.pptx",
  },
  {
    id: "res007",
    title: "Early Intervention Overview",
    category: "Training",
    type: "Short Video",
    price: 6,
    url: "/videos/early-intervention.mp4",
  },
  {
    id: "res008",
    title: "Advanced Therapy Techniques",
    category: "Training",
    type: "Long Video",
    price: 15,
    url: "/videos/advanced-therapy.mp4",
  },
];

const Resources = (props) => {
  const [category, setCategory] = useState("All");
  const [type, setType] = useState("All");

  return (
    <PageTemplate
      title={"Resources"}
      subtitle={
        "Explore curated resources designed to support growth, learning, and therapy progress."
      }
      src={resources}
    >
      <div className="p-6">
        <div className="flex gap-4 mb-4">
          <select
            onChange={(e) => setCategory(e.target.value)}
            value={category}
          >
            <option>All</option>
            <option>Downloadable</option>
            <option>Training</option>
          </select>
          <select onChange={(e) => setType(e.target.value)} value={type}>
            <option>All</option>
            <option>PDF</option>
            <option>PPT</option>
            <option>Short Video</option>
            <option>Long Video</option>
          </select>
        </div>

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
