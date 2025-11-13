import PageTemplate from "Utils/PageTemplate";
import resourcesImg from "Assets/Images/resources.jpg";
import { useState } from "react";
import ResourceList from "./ResourceList";
import CartDrawer from "./CartDrawer";
import Filter from "Utils/Filter";

import { useQuery } from "@apollo/client";
import { ALL_RESOURCES } from "Utils/Queries/Blog";

const Resources = () => {
  const [category, setCategory] = useState("All");
  const [type, setType] = useState("All");

  const { loading, error, data } = useQuery(ALL_RESOURCES);

  const handleClick = (tag) => {
    setCategory(tag);
  };

  const resources = (data?.allResource || []).map(({ _id, ...rest }) => ({
    id: _id,
    ...rest,
  }));
  console.log(error);
  return (
    <PageTemplate
      title="Resources"
      subtitle="Explored curated resources designed to support growth, promote learning & strengthen potentials."
      src={resourcesImg}
    >
      <div className="ml:px-6">
        <Filter
          handleClick={handleClick}
          tags={["All", "My-Learning", "Training", "Downloadable"]}
        />
        {!loading && (
          <ResourceList resources={resources} category={category} type={type} />
        )}
        <CartDrawer />
      </div>
    </PageTemplate>
  );
};

export default Resources;
