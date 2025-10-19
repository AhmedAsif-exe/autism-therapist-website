import { Button, CardMedia, styled, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjectContext } from "Utils/Context";
import api from "axiosInstance";
const GAMES_BUNDLE_PRICE = 4.99;
const GAMES_BUNDLE_BENEFITS = [
  "One-time purchase, a year of access",
  "Enhances learning and engagement",
];

const StyledTypography = styled(Typography)({
  display: "-webkit-box",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: 3,
  overflow: "hidden",
  textOverflow: "ellipsis",
  textAlign: "left",
});
export default function ResourceCard({ resource, category, preview = false }) {
  const { dispatch, user, cart } = useProjectContext();
  const navigate = useNavigate();
  const [isPaid, setIsPaid] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLockedGame, setModalLockedGame] = useState(null);
  console.log(resource);
  const onClickHandler = async () => {
    if (resource.category !== "Downloadable")
      navigate(`/resources/${resource.id}`);
    else {
      try {
        const res = await api.get(`/paypal/${resource.url}`, {
          responseType: "blob", // important for file download
        });

        // Convert blob into downloadable link
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
  console.log(resource, cart);
  const bundleInCart = cart.some((item) => item.id === resource.id);
  // Derive ownership from server-provided paidItems
  const hasBundleOwnership =
    Array.isArray(user?.paidItems) &&
    user.paidItems.some((item) => item?.id === resource.id);

  const handlePurchaseClick = (game) => {
    if (!preview) {
      setModalLockedGame(game);
      setModalOpen(true);
    } else {
      window.scrollTo(0, 0);
      navigate(`/resources`);
    }
  };

  const handleAddToCart = () => {
    if (!bundleInCart) {
      dispatch({
        type: "ADD",
        item: {
          id: resource.id,
          title: resource.title,
          price: resource.price,
        },
      });
    }
    // Close immediately per new spec (cart does NOT unlock)
    setModalOpen(false);
  };

  const handleCloseModal = () => setModalOpen(false);
  useEffect(() => {
    if (user)
      setIsPaid(user.paidItems.some((item) => item?.id === resource.id));
  }, [user]);
  return (
    <>
      {(category !== "My-Learning" || isPaid) && (
        <div className="rounded-xl shadow-md bg-white flex flex-col justify-between">
          <div>
            <CardMedia
              component="img"
              alt="green iguana"
              image={resource.image.asset.url}
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
              €{resource.price.toFixed(2)} ONLY
            </p>
          </div>
          {!isPaid ? (
            <Button
              onClick={handlePurchaseClick}
              fullWidth
              sx={{
                padding: "10px 0",
                backgroundColor: "#265c7e",
                color: "white",
                fontWeight: "700",
              }}
            >
              Add To Cart
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
      {modalOpen && !preview && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="purchase-modal-title"
          aria-describedby="purchase-modal-desc"
          onClick={handleCloseModal}
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
              fontFamily: "Fredoka One, sans-serif", // unified game font
              background: "#265c7e", // soft light gradient
              boxShadow:
                "0 20px 50px -12px rgba(4,37,57,0.32), 0 4px 16px rgba(4,37,57,0.16)",
              padding: "42px 46px 48px",
              display: "flex",
              flexDirection: "column",
              gap: 34,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                background: "none",
              }}
            />

            <header style={{ textAlign: "center", padding: "0 6px" }}>
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
                {resource.title}
              </h3>
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
                Unlock resources to enhance learning. One purchase, a year of
                access.
              </p>
            </header>

            <section>
              <ul
                style={{
                  listStyle: "none",
                  margin: 0,
                  padding: 0,
                  display: "grid",
                  gap: 16,
                }}
              >
                {GAMES_BUNDLE_BENEFITS.map((b, i) => (
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
                      {i + 1}
                    </span>
                    <span
                      style={{
                        fontSize: 17,
                        fontWeight: 600,
                        color: "#265c7e",
                        lineHeight: 1.35,
                      }}
                    >
                      {b}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <div style={{ textAlign: "center", display: "grid", gap: 20 }}>
              <div style={{ fontSize: 25, fontWeight: 700, color: "white" }}>
                Price{" "}
                <span style={{ color: "white", fontSize: 34, fontWeight: 900 }}>
                  €{resource.price}
                </span>
              </div>
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
                  Buy
                </button>
              )}
              {bundleInCart && !hasBundleOwnership && (
                <div
                  style={{ fontSize: 17, fontWeight: 700, color: "#f9644d" }}
                >
                  Bundle added to cart. Complete checkout to unlock.
                </div>
              )}
              {hasBundleOwnership && (
                <div
                  style={{ fontSize: 18, fontWeight: 700, color: "#57c785" }}
                >
                  Bundle owned ✔ All resources unlocked
                </div>
              )}
              <button
                onClick={handleCloseModal}
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
                Maybe Later
              </button>
              {/* Removed redundant unlock notice */}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
