import Header from "./Header";
import Footer from "./Footer";
import { ToastContainer } from "react-toastify";
import { ContextProvider } from "Utils/Context";
import { ApolloProvider } from "@apollo/client";
import { sanityGraphQLClient } from "sanityclient";
import CartDrawer from "Pages/Resources/CartDrawer";
const Layout = (props) => {
  return (
    <>
      <ApolloProvider client={sanityGraphQLClient}>
        <ContextProvider>
          <Header />
          <ToastContainer />
          {props.children}
          <CartDrawer />
          <Footer />
        </ContextProvider>
      </ApolloProvider>
    </>
  );
};

export default Layout;
