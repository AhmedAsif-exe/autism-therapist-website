import { PortableText } from "@portabletext/react";
import { Typography, Box, List, ListItem, Alert } from "@mui/material";

const Block = {
  normal: ({ children }) => (
    <Typography paragraph sx={{ textAlign: "left" }}>
      {children}
    </Typography>
  ),
  h2: ({ children }) => (
    <Typography variant="h5" fontWeight={600} gutterBottom>
      {children}
    </Typography>
  ),
};
const components = {
  types: {
    image: ({ value }) => {
      const ref = value.asset._ref
        .replace("image-", "")
        .replace(/-(jpg|png|webp|jpeg)$/, ".$1");
      const url = `https://cdn.sanity.io/images/${process.env.REACT_APP_SANITY_PROJECT_ID}/${process.env.REACT_APP_SANITY_DATASET}/${ref}`;
      return (
        <Box my={4} display="flex" justifyContent="center">
          <img
            src={url}
            alt={value.alt || "Image"}
            style={{ width: "70%", borderRadius: 8 }}
          />
        </Box>
      );
    },
    customList: ({ value }) => {
      const isNumbered = value.style === "number";
      return (
        <List sx={{ pl: 4, listStyleType: isNumbered ? "decimal" : "disc" }}>
          {value.items.map((item, index) => (
            <ListItem key={index} sx={{ display: "list-item", py: 0.5 }}>
              <PortableText value={[item]} components={{ block: Block }} />
            </ListItem>
          ))}
        </List>
      );
    },
    alert: ({ value }) => {
      return (
        <Box my={4} display="flex" justifyContent="center">
          <Alert severity={value.severity} sx={{ width: "50%" }}>
            {value.message}
          </Alert>
        </Box>
      );
    },
  },
  marks: {
    strong: ({ children }) => <strong>{children}</strong>,
    underline: ({ children }) => (
      <span style={{ textDecoration: "underline" }}>{children}</span>
    ),
  },
  block: Block,
};

export default function PortableBlockRenderer({ value }) {
  return <PortableText value={value} components={components} />;
}
