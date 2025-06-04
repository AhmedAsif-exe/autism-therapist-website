// src/sanityclient.js or src/sanityGraphQLClient.js

import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const projectId = process.env.REACT_APP_SANITY_PROJECT_ID;
const dataset = process.env.REACT_APP_SANITY_DATASET;
const token = process.env.REACT_APP_SANITY_TOKEN;

const endpoint = `https://${projectId}.api.sanity.io/v1/graphql/${dataset}/default`;
const httpLink = new HttpLink({
  uri: endpoint,
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const sanityGraphQLClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});
