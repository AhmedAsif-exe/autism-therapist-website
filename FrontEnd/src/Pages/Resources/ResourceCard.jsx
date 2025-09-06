import { Button, CardMedia, styled, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjectContext } from "Utils/Context";

const StyledTypography = styled(Typography)({
  display: "-webkit-box",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: 3,
  overflow: "hidden",
  textOverflow: "ellipsis",
  textAlign: "left",
});
export default function ResourceCard({ resource, category }) {
  const { dispatch, user } = useProjectContext();
  const navigate = useNavigate();
  const [isPaid, setIsPaid] = useState(false);
  const onClickHandler = () => {
    if (resource.category !== "Downloadable")
      navigate(`/resources/${resource.id}`);
    else {
      const cloud_name = process.env.REACT_APP_CLOUD_NAME;
      const url = `https://res.cloudinary.com/${cloud_name}/image/upload/v1749517502/${
        resource.url
      }.${resource.type.toLowerCase()}`;

      const link = document.createElement("a");
      link.href = url;
      link.download = `${resource.title}.${resource.type.toLowerCase()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  useEffect(() => {
    if (user) setIsPaid(user.paidItems.some((item) => item === resource.id));
  }, [user]);
  return (
    <>
      {(category !== "My-Learning" || isPaid) && (
        <div className="rounded-xl shadow-md bg-white flex flex-col justify-between">
          <div>
            <CardMedia
              component="img"
              alt="green iguana"
              image={resource.image}
              sx={{
                aspectRatio: "16 / 9",
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            />
            <h2 className="text-lg font-semibold text-[#f97544] mt-2">
              {resource.title}
            </h2>
            <p className="text-sm text-emerald-500">
              {resource.category} — {resource.type}
            </p>{" "}
            <StyledTypography
              className="p-4 pt-4"
              variant="body2"
              color="text.secondary"
              gutterBottom
            >
              {resource.description}{" "}
            </StyledTypography>
            <p
              className="font-bold my-1 "
              style={{
                color: "#f97544",
                fontSize: "20px",
                margin: "10px",
                textAlign: "start",
              }}
            >
              ${resource.price} ONLY
            </p>
          </div>
          {!isPaid ? (
            <Button
              onClick={() => dispatch({ type: "ADD", item: resource })}
              fullWidth
              sx={{
                padding: "10px 0",
                backgroundColor: "#265c7e",
                color: "white",
                fontWeight: "700",
              }}
            >
              Add to Cart
            </Button>
          ) : (
            <Button
              fullWidth
              onClick={onClickHandler}
              sx={{
                padding: "10px 0",
                backgroundColor: "#265c7e",
                color: "white",
                fontWeight: "700",
              }}
            >
              {resource.category === "Downloadable" ? "Download" : "Watch"}
            </Button>
          )}
        </div>
      )}
    </>
  );
}
