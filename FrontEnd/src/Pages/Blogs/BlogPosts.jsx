import {
  CardContent,
  Button,
  CardMedia,
  Typography,
  Avatar,
  AvatarGroup,
  Card,
  Link,
  Box,
  Grid,
  styled,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
const Tag = styled(Typography)(({ theme }) => ({
  display: "inline-block",
  backgroundColor: "#10B981", // emerald-500
  color: "white",
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  paddingTop: theme.spacing(0.5),
  paddingBottom: theme.spacing(0.5),
  borderRadius: "9999px",
  fontWeight: "bold",
  fontSize: "0.75rem",
  maxWidth: "100px",
}));
const SyledCard = styled(Card)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  padding: 0,
  height: "100%",
  backgroundColor: "whitesmoke",
  "&:hover": {
    backgroundColor: "transparent",
    cursor: "pointer",
  },
}));

const SyledCardContent = styled(CardContent)({
  display: "flex",
  flexDirection: "column",
  gap: 4,
  padding: 16,
  flexGrow: 1,
  "&:last-child": {
    paddingBottom: 16,
  },
});

const BlogTitle = styled(Typography)({
  textAlign: "left",
  fontSize: "25px",
  color: "#f97544",
  fontWeight: 700,
});
const StyledTypography = styled(Typography)({
  display: "-webkit-box",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: 3,
  overflow: "hidden",
  textOverflow: "ellipsis",
  textAlign: "left",
});
function formatDate(isoString) {
  const date = new Date(isoString);
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}
function Author({ authors, _id }) {
  console.log(authors);
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        gap: 2,
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px",
        color: "#265c7e",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 1,
          alignItems: "center",
        }}
      >
        <Avatar
          key={authors?.name}
          alt={authors?.name}
          src={authors?.image?.asset?.url || `/static/images/avatar/${1}.jpg`} // path relative to `public`
          sx={{ width: 24, height: 24, backgroundColor: "#265c7e" }}
        />

        <Typography variant="caption"> {authors?.name}</Typography>
      </Box>

      <Link
        variant="contained"
        sx={{
          borderRadius: "9999px", // oval shape
          textTransform: "none", // keep "Read More" casing
          paddingX: 3, // horizontal padding
          paddingY: 1, // vertical padding
          backgroundColor: "#10B981", // emerald green
          "&:hover": {
            backgroundColor: "#059669", // darker emerald on hove
          },
          color: "white",
          fontStyle: "normal",
          textDecoration: "none",
        }}
        href={`/blogs/${_id}`}
      >
        Read More
      </Link>
    </Box>
  );
}

const BlogPosts = ({ data }) => {
  return (
    <>
      {data?.allBlog?.map((blog, index) => (
        <Grid item xs={12} md={5} key={index}>
          <SyledCard variant="outlined" tabIndex={0}>
            <CardMedia
              component="img"
              alt="green iguana"
              image={blog?.mainImage?.asset?.url}
              sx={{
                aspectRatio: "16 / 9",
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            />
            <SyledCardContent>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                width="100%"
                gap={1}
              >
                <Tag variant="caption" component="div">
                  {blog.categories}
                </Tag>
                <Typography variant="caption">
                  {formatDate(blog._createdAt)}
                </Typography>
              </Box>
              <BlogTitle variant="h6" component="div">
                {blog.title}
              </BlogTitle>
              <StyledTypography
                variant="body2"
                color="text.secondary"
                gutterBottom
              >
                {blog.description}
              </StyledTypography>
            </SyledCardContent>
            <Author authors={blog?.authors[0]} _id={blog._id} />
          </SyledCard>
        </Grid>
      ))}
    </>
  );
};
export default BlogPosts;
