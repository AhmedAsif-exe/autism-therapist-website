import React, { useEffect, useState } from "react";
import { BLOGS } from "Utils/Queries/Blog";
import PortableBlockRenderer from "./PortableBlockRenderer";
import { Container, Typography, Box, Chip, Divider } from "@mui/material";

import Comments from "Utils/Comments";
import { useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import { Facebook, Twitter, Instagram, LinkedIn } from "@mui/icons-material";

function AuthorIntro({ authors }) {
  console.log(authors);
  return (
    <section className="bg-gray-100 py-16 px-6 rounded-lg">
      <div className="max-w-5xl mx-auto flex flex-col ml:flex-row items-center t:items-start gap-12">
        {/* Left Side: Text */}
        <div className="flex-1 text-center t:text-left">
          <h1 className="text-3xl t:text-4xl font-bold leading-snug">
            About the Author
          </h1>
          {authors[0].description.map((d) => (
            <p className="mt-6 text-gray-700 leading-relaxed">{d}</p>
          ))}
        </div>

        {/* Right Side: Profile */}
        <div className="flex flex-col items-center ">
          <img
            src={authors[0].image.asset.url} // replace with real image
            alt="Alex Rin"
            className="w-64 h-64 rounded-full object-cover"
          />
          <h3 className="mt-4 text-xl text-center font-semibold">
            {authors[0].name}
          </h3>
          <div className="flex gap-4 mt-3 text-gray-500 text-lg">
            {authors[0].facebook && (
              <a href={authors[0].facebook} aria-label="Facebook">
                <Facebook />
              </a>
            )}
            {authors[0].twitter && (
              <a href={authors[0].twitter} aria-label="Facebook">
                <Twitter />
              </a>
            )}
            {authors[0].instagram && (
              <a href={authors[0].instagram} aria-label="Dribbble">
                <Instagram />
              </a>
            )}
            {authors[0].linkedIn && (
              <a href={authors[0].linkedIn} aria-label="LinkedIn">
                <LinkedIn />
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function BlogPage() {
  const { id } = useParams();
  const { data, loading, error } = useQuery(BLOGS, { variables: { id } });

  return (
    <Container maxWidth={"100%"} sx={{ py: 4, p: 0 }}>
      {!loading && (
        <Box key={data.Blog._id} my={2} width={"100%"}>
          {data.Blog.mainImage?.asset && (
            <Box mb={3} sx={{ width: "100%" }} p={0}>
              <div
                className="mx-auto"
                style={{
                  backgroundImage: `url(${data.Blog.mainImage?.asset.url})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  borderRadius: "10px",
                  width: "100%", // or fixed width like '500px'
                  height: "450px", // adjust as needed
                }}
              ></div>
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
            <Box key={idx} mb={4} className="t:px-[100px] px-[40px]">
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

          <AuthorIntro authors={data?.Blog?.authors} />
          <Divider sx={{ my: 4 }} />
          <Comments blogId={data.Blog._id} />
        </Box>
      )}
    </Container>
  );
}
