import api, { checkAuthStatus } from "axiosInstance";

export const initiateCheckoutSession = async (
  cart,
  user,
  method = "paypal",
  { currency = "EUR", rate = 1 } = {}
) => {
  try {
    let res;
    if (method === "stripe") {
      res = await api.post("/paypal/create-stripe-session", {
        cart,
        currency,
        rate,
      });
      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } else {
      // PayPal: always EUR from cart base prices
      const { data } = await api.post("/paypal/create-order", { cart });
      const approvalUrl =
        data.links?.find((link) => link.rel === "approve")?.href +
        "&locale.x=en_US";
      if (approvalUrl) window.location.href = approvalUrl;
    }
  } catch (err) {
    if (err.response?.status === 401) {
      window.location.href = "/login";
    } else {
      console.error("Checkout error:", err);
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
