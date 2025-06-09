import { Button } from "@mui/material";
import { useEffect, useState } from "react";
import { useProjectContext } from "Utils/Context";
export default function ResourceCard({ resource }) {
  const { dispatch, user } = useProjectContext();

  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    if (user) setIsPaid(user.paidItems.find((item) => item === resource.id));
  }, [user]);
  return (
    <div className="border rounded-xl p-4 shadow-md bg-white">
      <h2 className="text-lg font-semibold">{resource.title}</h2>
      <p className="text-sm text-gray-500">
        {resource.category} — {resource.type}
      </p>
      <p className="font-bold mt-2">${resource.price}</p>
      {!isPaid ? (
        <Button  onClick={() => dispatch({ type: "ADD", item: resource })} fullWidth>
          Add to Cart
        </Button>
      ) : (
        <Button fullWidth>
          {resource.category === "Downloadable" ? "Download" : "Watch"}
        </Button>
      )}
    </div>
  );
}
