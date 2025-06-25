import Header from "./Header";
import Footer from "./Footer";
import { ToastContainer } from "react-toastify";
import { ContextProvider } from "Utils/Context";
import { ApolloProvider } from "@apollo/client";
import { sanityGraphQLClient } from "sanityclient";
const Layout = (props) => {
  return (
    <>
      <ApolloProvider client={sanityGraphQLClient}>
        <ContextProvider>
          <Header />
          <ToastContainer />
          {props.children}
          <Footer />
        </ContextProvider>
      </ApolloProvider>
    </>
  );
};

export default Layout;
