import Header from "./Header";
import Footer from "./Footer";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "Utils/Context";
import { ApolloProvider } from "@apollo/client";
import { sanityGraphQLClient } from "sanityclient";
import DummyHeader from "./DummyHeader";
const Layout = (props) => {
  return (
    <>
      <ApolloProvider client={sanityGraphQLClient}>
        <AuthProvider>
          {/* <Header /> */}
          <DummyHeader />
          <ToastContainer />
          {props.children}
          <Footer />
        </AuthProvider>
      </ApolloProvider>
    </>
  );
};

export default Layout;
