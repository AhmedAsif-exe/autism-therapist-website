import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Container,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { ArrowBack, CheckCircle } from "@mui/icons-material";
import { RESOURCE } from "Utils/Queries/Blog";
import { useProjectContext, formatPrice } from "Utils/Context";
import { downloadResource } from "./downloadResource";

function AuthorIntro({ authors }) {
  const author = authors?.[0];

  if (!author) return null;

  return (
    <section className="bg-[#f7fafc] py-14 px-6 rounded-xl mt-10 shadow-inner">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
        {/* Left: Text */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#265c7e]">
            About the Trainer
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

const actionButtonStyle = {
  gap: 12,
  padding: "10px 26px",
  borderRadius: 26,
  border: "none",
  background: "#45B4B3",
  color: "white",
  fontSize: 20,
  fontWeight: 900,
  cursor: "pointer",
  boxShadow: "0 8px 18px rgba(4,37,57,0.12), 0 1px 3px rgba(4,37,57,0.15)",
  transition: "all 150ms ease",
};

export default function ResourceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dispatch, user, cart, currency, rate } = useProjectContext();
  const [isPaid, setIsPaid] = useState(false);

  const { loading, error, data } = useQuery(RESOURCE, { variables: { id } });
  const resource = data?.Resource;

  const inCart = cart.some((item) => item.id === id);

  useEffect(() => {
    if (user) setIsPaid(user.paidItems.some((item) => item?.id === id));
  }, [user, id]);

  const handleAddToCart = () => {
    if (!inCart) {
      dispatch({
        type: "ADD",
        item: { id, title: resource.title, price: resource.price },
      });
    }
  };

  const handleOpen = () => {
    if (resource.category !== "Downloadable") navigate(`/resources/${id}/watch`);
    else downloadResource(resource);
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress sx={{ color: "#45B4B3" }} />
      </Box>
    );
  }

  if (error || !resource) {
    return (
      <Container maxWidth="md" sx={{ pt: { xs: "110px", sm: "130px" }, pb: 8 }}>
        <Alert severity="error">
          We couldn't load this resource. It may have been removed.
        </Alert>
        <button
          onClick={() => navigate("/resources")}
          style={{ ...actionButtonStyle, marginTop: 24 }}
        >
          Back to Resources
        </button>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="lg"
      component="main"
      sx={{ pt: { xs: "110px", sm: "130px" }, pb: 10 }}
    >
      {/* Back link */}
      <button
        onClick={() => navigate("/resources")}
        className="flex items-center gap-1 text-[#f9644d] font-semibold hover:underline mb-6"
        style={{ background: "transparent", border: "none", cursor: "pointer" }}
      >
        <ArrowBack fontSize="small" />
        Back to Resources
      </button>

      {/* Hero: image + details */}
      <div className="flex t:flex-row flex-col gap-10 items-start">
        <img
          src={resource.image?.asset?.url}
          alt={resource.title}
          className="w-full t:w-1/2 rounded-lg shadow-lg object-cover"
        />

        <div className="flex-1">
          <h1 className="text-3xl ml:text-4xl font-extrabold text-[#45B4B3]">
            {resource.title}
          </h1>

          <Box sx={{ mt: 1.5, display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Chip label={resource.category} size="small" />
            <Chip label={resource.type} size="small" variant="outlined" />
          </Box>

          <p className="text-2xl font-bold text-[#f97544] mt-4">
            {formatPrice(resource.price, currency, rate)}
          </p>

          <p className="mt-4 text-base leading-relaxed text-black">
            <b className="text-[#f97544]">Description: </b>
            {resource.description}
          </p>

          {!!resource.perks?.length && (
            <List dense className="mt-2 space-y-1">
              {resource.perks.map((item, i) => (
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
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-4 mt-8">
            {isPaid ? (
              <button onClick={handleOpen} style={actionButtonStyle}>
                {resource.category === "Downloadable" ? "Download" : "Watch"}
              </button>
            ) : inCart ? (
              <div style={{ ...actionButtonStyle, cursor: "default" }}>
                Added to cart ✔
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                style={actionButtonStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {`Buy for ${formatPrice(resource.price, currency, rate)}`}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Training disclaimer + trainer bio */}
      <section className="mt-12">
        {resource.category === "Training" && (
          <Alert severity="warning">
            Our trainings are for <strong>educational purposes only</strong> and
            do not qualify for continuing education units (CEUs).
          </Alert>
        )}

        <AuthorIntro authors={resource.authors} />
      </section>
    </Container>
  );
}
