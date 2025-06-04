import React, { useEffect, useState } from "react";
import { BLOGS, fetchAllBlogs } from "../../Utils/Queries/Blog";
import PortableBlockRenderer from "./PortableBlockRenderer";
import { Container, Typography, Box, Chip, Divider } from "@mui/material";
import { CommentSection } from "react-comments-section";
import { checkAuthStatus } from "axiosInstance";
import Comments from "./Comments";
import { useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
export default function BlogPage() {
  const { id } = useParams();
  const { data, loading, error } = useQuery(BLOGS, { variables: { id } });

  return (
    <Container maxWidth={"100%"} sx={{ py: 4 }}>
      {!loading && (
        <Box key={data.Blog._id} my={2} width={"100%"}>
          {data.Blog.mainImage?.asset && (
            <Box mb={3} sx={{ width: "100%" }} p={0}>
              <img
                src={data.Blog.mainImage?.asset.url}
                style={{ borderRadius: "10px" }}
              />
            </Box>
          )}
          <Typography
            variant="h4"
            fontWeight={700}
            gutterBottom
            fontSize={"50px"}
          >
            {data.Blog.title}
          </Typography>

          <Box sx={{ mb: "50px" }}>
            <Chip label={data.Blog.categories} sx={{ mr: 1 }} />
          </Box>

          {data.Blog.sections.map((section, idx) => (
            <Box key={idx} mb={4} px={"100px"}>
              {section.subheading && (
                <Typography
                  variant="h6"
                  textAlign={"left"}
                  sx={{ marginBottom: "2rem" }}
                  fontWeight={600}
                  gutterBottom
                >
                  {section.subheading}
                </Typography>
              )}
              <PortableBlockRenderer value={section.contentRaw} />
            </Box>
          ))}

          <Divider sx={{ my: 4 }} />
          <Comments blogId={data.Blog._id} />
        </Box>
      )}
    </Container>
  );
}
