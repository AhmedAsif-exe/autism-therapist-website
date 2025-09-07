import * as React from "react";

import Box from "@mui/material/Box";
import { useState } from "react";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import FormControl from "@mui/material/FormControl";
import InputAdornment from "@mui/material/InputAdornment";
import OutlinedInput from "@mui/material/OutlinedInput";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import RssFeedRoundedIcon from "@mui/icons-material/RssFeedRounded";
import blogBanner from "Assets/Images/blog_banner.jpg";
import { ALL_BLOGS } from "Utils/Queries/Blog";
import { useQuery } from "@apollo/client";
import BlogPosts from "./BlogPosts";
import PageTemplate from "Utils/PageTemplate";
function Search({ value, onChange }) {
  return (
    <FormControl sx={{ flexGrow: 1 }} variant="outlined">
      <OutlinedInput
        size="small"
        id="search"
        placeholder="Search…"
        sx={{ flexGrow: 1 }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        startAdornment={
          <InputAdornment position="start" sx={{ color: "text.primary" }}>
            <SearchRoundedIcon fontSize="small" />
          </InputAdornment>
        }
        inputProps={{
          "aria-label": "search",
        }}
      />
    </FormControl>
  );
}

export default function MainContent() {
  const { data, loading, error } = useQuery(ALL_BLOGS);
  const [search, setSearch] = useState("");
  const filteredData = data
    ? data.allBlog.filter((blog) =>
        blog.title.toLowerCase().includes(search.toLowerCase())
      )
    : [];
  console.log(filteredData);

  return (
    <PageTemplate
      title={"Blog"}
      subtitle={"Stay in the loop with the latest about our products"}
      src={blogBanner}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 1,
          // width: { xs: "100%", md: "fit-content" },
          overflow: "auto",
        }}
      >
        <Search value={search} onChange={setSearch} />
        <IconButton size="small" aria-label="RSS feed">
          <RssFeedRoundedIcon />
        </IconButton>
      </Box>

      <Grid container spacing={5} columns={12} justifyContent={"center"}>
        {!loading && <BlogPosts data={filteredData} />}
      </Grid>
    </PageTemplate>
  );
}
