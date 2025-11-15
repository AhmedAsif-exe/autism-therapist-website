import { useEffect, useState } from "react";
import {
  Button,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Chip,
} from "@mui/material";
import { CheckCircle, ExpandMore, ExpandLess } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useProjectContext } from "Utils/Context";
import api from "axiosInstance";

function AuthorIntro({ authors }) {
  const author = authors?.[0];

  if (!author) return null;

  return (
    <section className="bg-[#f7fafc] py-14 px-6 rounded-xl mt-10 shadow-inner">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
        {/* Left: Text */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#265c7e]">
            About the Author
          </h1>

          <div className="mt-5 space-y-4 text-gray-700 leading-relaxed">
            {author.description?.map((d, i) => (
              <p key={i}>{d}</p>
            ))}
          </div>
        </div>

        {/* Right: Profile */}
        <div className="flex flex-col items-center">
          <img
            src={author.image.asset.url}
            alt={author.name}
            className="w-56 h-56 rounded-full object-cover shadow-lg border-4 border-[#45B4B3]/20"
          />
          <h3 className="mt-4 text-xl font-bold text-[#265c7e]">
            {author.name}
          </h3>
        </div>
      </div>
    </section>
  );
}

export default function ResourceCard({ resource, category, preview = false }) {
  const { dispatch, user, cart } = useProjectContext();
  const navigate = useNavigate();
  const [isPaid, setIsPaid] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const bundleInCart = cart.some((item) => item.id === resource.id);

  const hasBundleOwnership =
    Array.isArray(user?.paidItems) &&
    user.paidItems.some((item) => item?.id === resource.id);

  useEffect(() => {
    if (user)
      setIsPaid(user.paidItems.some((item) => item?.id === resource.id));
  }, [user]);

  const handleAddToCart = () => {
    if (!bundleInCart) {
      dispatch({
        type: "ADD",
        item: { id: resource.id, title: resource.title, price: resource.price },
      });
    }
    setModalOpen(false);
  };

  const handlePurchaseClick = () => {
    if (!preview) setModalOpen(true);
    else {
      window.scrollTo(0, 0);
      navigate(`/resources`);
    }
  };

  const onClickHandler = async () => {
    if (resource.category !== "Downloadable")
      navigate(`/resources/${resource.id}`);
    else {
      try {
        const res = await api.get(`/paypal/${resource.url}`, {
          responseType: "blob",
        });
        const blob = new Blob([res.data], {
          type: res.headers["content-type"],
        });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${resource.title}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      } catch (err) {
        console.error("Download failed:", err);
      }
    }
  };

  if (category === "My-Learning" && !isPaid) return null;

  return (
    <>
      {/* Card */}
      <div className="bg-white rounded-2xl shadow-lg flex flex-col overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <img
          src={resource.image.asset.url}
          alt={resource.title}
          className="aspect-video object-cover border-b border-gray-200"
        />

        <div className="p-4 flex flex-col flex-grow">
          <h2 className="text-lg font-bold text-[#f97544] line-clamp-1">
            {resource.title}
          </h2>
          <p className="text-sm text-emerald-600">
            {resource.category} — {resource.type}
          </p>
          <p className="text-gray-600 text-sm mt-2 line-clamp-2">
            {resource.description}
          </p>
          {/* Price */}
          <p className="text-lg font-bold text-[#f97544] mt-auto">
            €{resource.price?.toFixed(2) ?? "0.00"} ONLY
          </p>
          {/* Buttons */}
          <Button
            onClick={handlePurchaseClick}
            fullWidth
            sx={{
              mt: 1.5,
              py: 1,
              backgroundColor: "#265c7e",
              color: "white",
              fontWeight: 700,
              borderRadius: 2,
              "&:hover": { backgroundColor: "#1e4e6a" },
            }}
          >
            See More
          </Button>
        </div>
      </div>
      {/* Modal */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="purchase-modal-title"
          aria-describedby="purchase-modal-desc"
          onClick={() => setModalOpen(false)}
          className="
                    fixed inset-0 
                    bg-[rgba(15,30,44,0.65)] 
                    backdrop-blur-[5px]
                    flex items-center justify-center 
                    z-[2147483647]
                    px-[9px] py-4
                    
                  "
        >
          <div
            onClick={(e) => e.stopPropagation()}
            onWheel={(e) => {
              e.stopPropagation(); // prevent scroll bubbling to background
            }}
            className="
                w-full
                max-w-[1200px]
                max-h-[90vh]
                rounded-[12px]
                overflow-y-auto
                border-[5px] border-[#45b4b3]
                relative
                font-['Fredoka_One',sans-serif]
                bg-[#ffffff]
                shadow-[0_20px_50px_-12px_rgba(4,37,57,0.32),0_4px_16px_rgba(4,37,57,0.16)]
                ml:p-[42px_46px_48px]
                p-[24px_18px_30px]
                flex flex-col
                gap-[34px]
              "
          >
            {" "}
            <div
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                background: "none",
              }}
            />{" "}
            <header style={{ textAlign: "center", padding: "0 6px" }}>
              <div className="flex gap-10 t:flex-row flex-col items-center">
                {" "}
                <img
                  src={resource.image.asset.url}
                  alt={resource.title}
                  className="min-w-[300px] max-w-[500px] w-[90%] "
                  style={{
                    // border: "2px solid rgb(249, 117, 68)",
                    borderRadius: 8,
                  }}
                />{" "}
                <div>
                  <h3
                    id="purchase-modal-title"
                    style={{
                      margin: 0,
                      fontSize: 24,
                      fontWeight: 900,
                      letterSpacing: 0.5,
                      color: "#45B4B3",
                      textAlign: "start",
                      paddingTop: 18,
                      textShadow: "0 1px 4px rgba(4,37,57,0.10)",
                    }}
                  >
                    {resource.title}{" "}
                  </h3>{" "}
                  <p
                    id="purchase-modal-desc"
                    style={{
                      margin: "14px auto 0",
                      textAlign: "start",
                      fontSize: 16,
                      lineHeight: 1.45,
                      fontWeight: 500,
                      color: "#000000",
                    }}
                  >
                    <b className="text-[#f97544]">Description: </b>
                    {resource.description}
                  </p>{" "}
                  <List dense className="mt-2 space-y-1">
                    {resource?.perks?.map((item, i) => (
                      <ListItem
                        key={i}
                        className="bg-green-50 rounded-lg shadow-sm"
                        sx={{ py: 0.5 }}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckCircle className="text-emerald-500" />
                        </ListItemIcon>
                        <ListItemText
                          primary={item}
                          primaryTypographyProps={{
                            fontWeight: 500,
                            color: "green.800",
                            variant: "body2",
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </div>
              </div>
            </header>{" "}
            <section>
              {/* <ul
                style={{
                  listStyle: "none",
                  margin: 0,
                  padding: 0,
                  display: "grid",
                  background: "#fafafa",
                  gap: 4,
                }}
              >
                {" "}
                {[
                  "One-time purchase, a year of access",
                  "Enhances learning and engagement",
                ].map((b, i) => (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,

                      padding: "14px 18px",

                      boxShadow: "0 2px 6px rgba(4,37,57,0.06)",
                    }}
                  >
                    {" "}
                    <span
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 12,
                        background: "#f97544",
                        color: "#fff",
                        fontSize: 18,
                        fontWeight: 800,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 2px 6px rgba(249,117,68,0.32)",
                      }}
                    >
                      {" "}
                      {i + 1}{" "}
                    </span>{" "}
                    <span
                      style={{
                        fontSize: 17,
                        fontWeight: 600,
                        color: "#265c7e",
                        lineHeight: 1.35,
                      }}
                    >
                      {" "}
                      {b}{" "}
                    </span>{" "}
                  </li>
                ))}{" "}
              </ul>{" "} */}
              <AuthorIntro authors={resource.authors} />
            </section>{" "}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 18,
              }}
            >
              <button
                onClick={() => setModalOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#f9644d",
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: "pointer",
                  textDecoration: "underline",
                  opacity: 0.85,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = 1;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = 0.85;
                }}
              >
                {" "}
                Maybe Later{" "}
              </button>{" "}
              {!hasBundleOwnership && !bundleInCart && !isPaid && (
                <button
                  onClick={handleAddToCart}
                  style={{
                    gap: 12,
                    padding: "9px 21px",
                    borderRadius: 26,

                    background: "#45B4B3",
                    color: "white",
                    fontSize: 22,
                    fontWeight: 900,
                    cursor: "pointer",
                    boxShadow:
                      "0 8px 18px rgba(4,37,57,0.12), 0 1px 3px rgba(4,37,57,0.15)",
                    transition: "all 150ms ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {`Buy for €${resource.price?.toFixed(2) ?? "0.00"}`}
                </button>
              )}{" "}
              {isPaid && (
                <button
                  onClick={onClickHandler}
                  fullWidth
                  style={{
                    gap: 12,
                    padding: "9px 21px",
                    borderRadius: 26,

                    background: "#45B4B3",
                    color: "white",
                    fontSize: 22,
                    fontWeight: 900,
                    cursor: "pointer",
                    boxShadow:
                      "0 8px 18px rgba(4,37,57,0.12), 0 1px 3px rgba(4,37,57,0.15)",
                    transition: "all 150ms ease",
                  }}
                >
                  {resource.category === "Downloadable" ? "Download" : "Watch"}
                </button>
              )}
              {bundleInCart && !hasBundleOwnership && (
                <div
                  style={{
                    gap: 12,
                    padding: "9px 21px",
                    borderRadius: 26,

                    background: "#45B4B3",
                    color: "white",
                    fontSize: 22,
                    fontWeight: 900,
                    cursor: "pointer",
                    boxShadow:
                      "0 8px 18px rgba(4,37,57,0.12), 0 1px 3px rgba(4,37,57,0.15)",
                    transition: "all 150ms ease",
                  }}
                >
                  {" "}
                  Added to cart ✔
                </div>
              )}{" "}
            </div>{" "}
          </div>{" "}
        </div>
      )}{" "}
    </>
  );
}
