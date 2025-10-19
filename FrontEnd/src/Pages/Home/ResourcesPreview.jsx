import resources from "Assets/Images/resources.jpg";
import { Typography } from "@mui/material";
import { styled } from "@mui/system";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { useEffect } from "react";
import ResourceCard from "Pages/Resources/ResourceCard";
const sampleResources = [
  {
    category: "Downloadable",
    description:
      "A guide book to teach class of items receptively & expressively",
    id: "0063aeaf-3355-42f2-9533-31482f8aa7f9",
    image: {
      __typename: "Image",
      asset: {
        url: "https://cdn.sanity.io/images/1dbkj11i/production/d70828d778da3cb2bc0c7725d924f17b7a13193f-1280x720.png",
      },
    },
    price: 8.5,
    title: "FFC- Class Guide book",
    type: "PDF",
    url: "FFC-class.pdf",
    __typename: "Resource",
  },
  {
    category: "Downloadable",
    description:
      "A guide book to teach features of items receptively & expressively",
    id: "66a24624-06f8-4b54-9357-1f6a8f267545",
    image: {
      __typename: "Image",
      asset: {
        url: "https://cdn.sanity.io/images/1dbkj11i/production/aac080c9392de42cebcb1d2a72c9635b3ef85a0f-1280x720.png",
      },
    },
    price: 8.5,
    title: "FFC- Feature Guide Book",
    type: "PDF",
    url: "FFC-features.pdf",
    __typename: "Resource",
  },
  {
    category: "Downloadable",
    description:
      "A guide book to teach functions of items receptively & expressively",
    id: "c10906d4-bc72-482e-b5c1-d11e097f7bd6",
    image: {
      __typename: "Image",
      asset: {
        url: "https://cdn.sanity.io/images/1dbkj11i/production/429e54d6d43f72baef43801144c86d2db261b690-1280x720.png",
      },
    },
    price: 8.5,
    title: "FFC- Function Guide Book",
    type: "PDF",
    url: "FFC-function.pdf",
    __typename: "Resource",
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
          Explore curated resources designed to support growth, learning, and
          therapy progress.
        </p>
        <div className="grid grid-cols-1 my-16 ml:grid-cols-2 t:grid-cols-3 gap-8 max-w-[1440px] mx-auto">
          {sampleResources.map((r) => (
            <ResourceCard resource={r} preview={true} />
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
