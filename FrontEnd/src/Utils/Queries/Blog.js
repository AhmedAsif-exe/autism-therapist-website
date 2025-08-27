// src/Utils/Queries/fetchAllBlogs.js
import { gql } from "@apollo/client";
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
