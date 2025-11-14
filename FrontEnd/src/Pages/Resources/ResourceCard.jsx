import { useEffect, useState } from "react";
import {
  Button,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
} from "@mui/material";
import { CheckCircle, ExpandMore, ExpandLess } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useProjectContext } from "Utils/Context";
import api from "axiosInstance";

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

          {/* See More */}
          <div className="mt-2">
            <button
              onClick={() => setShowMore(!showMore)}
              className="flex items-center text-[#f97544] text-sm font-semibold hover:underline"
            >
              {showMore ? "See Less" : "See More"}
              {showMore ? (
                <ExpandLess fontSize="small" />
              ) : (
                <ExpandMore fontSize="small" />
              )}
            </button>

            <Collapse in={showMore} timeout="auto" unmountOnExit>
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
            </Collapse>
          </div>

          {/* Price */}
          <p className="text-lg font-bold text-[#f97544] mt-auto">
            €{resource.price?.toFixed(2) ?? "0.00"} ONLY
          </p>

          {/* Buttons */}
          {!isPaid ? (
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
              Add To Cart
            </Button>
          ) : (
            <Button
              onClick={onClickHandler}
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
              {resource.category === "Downloadable" ? "Download" : "Watch"}
            </Button>
          )}
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
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,30,44,0.65)",
            backdropFilter: "blur(5px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2147483647,
            overflowY: "auto",
            padding: "32px 18px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 560,
              borderRadius: 24,
              position: "relative",
              fontFamily: "Fredoka One, sans-serif",
              background: "#265c7e",
              boxShadow:
                "0 20px 50px -12px rgba(4,37,57,0.32), 0 4px 16px rgba(4,37,57,0.16)",
              padding: "42px 46px 48px",
              display: "flex",
              flexDirection: "column",
              gap: 34,
            }}
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
              {" "}
              <h3
                id="purchase-modal-title"
                style={{
                  margin: 0,
                  fontSize: 36,
                  fontWeight: 900,
                  letterSpacing: 0.5,
                  color: "white",
                  textShadow: "0 1px 4px rgba(4,37,57,0.10)",
                }}
              >
                {" "}
                {resource.title}{" "}
              </h3>{" "}
              <p
                id="purchase-modal-desc"
                style={{
                  margin: "14px auto 0",
                  maxWidth: 520,
                  fontSize: 19,
                  lineHeight: 1.45,
                  fontWeight: 500,
                  color: "#59d6adff",
                }}
              >
                {" "}
                Unlock resources to enhance learning. One purchase, a year of
                access.{" "}
              </p>{" "}
            </header>{" "}
            <section>
              {" "}
              <ul
                style={{
                  listStyle: "none",
                  margin: 0,
                  padding: 0,
                  display: "grid",
                  gap: 16,
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
                      background: "#fafafa",
                      padding: "14px 18px",
                      borderRadius: 18,
                      border: "2px solid #f3c9b8",
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
              </ul>{" "}
            </section>{" "}
            <div style={{ textAlign: "center", display: "grid", gap: 20 }}>
              {" "}
              <div style={{ fontSize: 25, fontWeight: 700, color: "white" }}>
                {" "}
                Price{" "}
                <span style={{ color: "white", fontSize: 34, fontWeight: 900 }}>
                  €{resource.price?.toFixed(2) ?? "0.00"}
                </span>{" "}
              </div>{" "}
              {!hasBundleOwnership && !bundleInCart && (
                <button
                  onClick={handleAddToCart}
                  style={{
                    margin: "0 auto",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 12,
                    padding: "18px 42px",
                    borderRadius: 26,
                    border: "3px solid #f3c9b8",
                    background: "linear-gradient(135deg,#ffffff,#fff8f3)",
                    color: "#f9644d",
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
                  {" "}
                  Buy{" "}
                </button>
              )}{" "}
              {bundleInCart && !hasBundleOwnership && (
                <div
                  style={{ fontSize: 17, fontWeight: 700, color: "#f9644d" }}
                >
                  {" "}
                  Bundle added to cart. Complete checkout to unlock.{" "}
                </div>
              )}{" "}
              {hasBundleOwnership && (
                <div
                  style={{ fontSize: 18, fontWeight: 700, color: "#57c785" }}
                >
                  {" "}
                  Bundle owned ✔ All resources unlocked{" "}
                </div>
              )}{" "}
              <button
                onClick={() => setModalOpen(false)}
                style={{
                  margin: "2px auto 0",
                  background: "transparent",
                  border: "none",
                  color: "white",
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
              {/* Removed redundant unlock notice */}{" "}
            </div>{" "}
          </div>{" "}
        </div>
      )}{" "}
    </>
  );
}
