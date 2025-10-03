// src/Utils/Queries/fetchAllBlogs.js
import { gql } from "@apollo/client";

// ---- BLOG QUERIES ----
export const ALL_BLOGS = gql`
  {
    allBlog {
      _id
      title
      categories
      authors {
        name
        image {
          asset {
            url
          }
        }
      }
      description
      mainImage {
        asset {
          url
        }
      }
      _createdAt
    }
  }
`;

export const BLOGS = gql`
  query GetBlog($id: ID!) {
    Blog(id: $id) {
      _id
      title
      categories
      mainImage {
        asset {
          altText
          url
        }
      }
      authors {
        name
        description
        image {
          asset {
            url
          }
        }
        facebook
        instagram
        linkedIn
      }
      sections {
        subheading
        contentRaw
      }
      _createdAt
    }
  }
`;

// ---- RESOURCE QUERIES ----
export const ALL_RESOURCES = gql`
  {
    allResource {
      _id
      title
      category
      type
      price
      url
      image
      description
    }
  }
`;

export const RESOURCE = gql`
  query GetResource($id: ID!) {
    Resource(id: $id) {
      _id
      title
      category
      type
      price
      url
      image {
        asset {
          url
        }
      }
      description
    }
  }
`;
