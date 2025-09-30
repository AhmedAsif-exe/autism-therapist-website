import api, { checkAuthStatus } from "axiosInstance";

export const initiateCheckoutSession = async (cart, user) => {
  try {
    const { data } = await api.post("/paypal/create-order", { cart });

    if (data?.links) {
      const approvalUrl =
        data.links.find((link) => link.rel === "approve").href +
        "&locale.x=en_US";

      window.location.href = approvalUrl;
    } else {
      console.error("No PayPal approval link found", data);
    }
  } catch (err) {
    if (err.response?.status === 401) {
      window.location.href = "/login";
    } else {
      console.error("Error initiating checkout session:", err);
    }
  }
};

export async function successCallback(cart, user) {
  try {
    console.log("Calling payment success callback for user:", user?.email);
    console.log(
      "Cart items:",
      cart?.map((item) => ({ id: item.id, title: item.title }))
    );

    const { data } = await api.post("/paypal/callback", {
      cart,
      user,
    });

    console.log("Payment callback successful:", data);
    return data;
  } catch (err) {
    console.error(
      "Payment callback failed:",
      err.response?.data || err.message
    );
    return null;
  }
}
