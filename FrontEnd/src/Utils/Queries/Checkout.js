import api from "axiosInstance";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

export async function initiateCheckoutSession(cart, user) {
  try {
    const { data } = await api.post("/gateway/create-checkout-session", {
      cart,
      user,
    });

    const stripe = await stripePromise;

    const { error } = await stripe.redirectToCheckout({
      sessionId: data.id,
    });

    if (error) {
      console.error("Stripe redirect error:", error);
    }
  } catch (err) {
    console.error("Submit comment error:", err);
    return null;
  }
}
export async function successCallback(cart, user) {
  try {
    console.log("Calling payment success callback for user:", user?.email);
    console.log("Cart items:", cart?.map(item => ({ id: item.id, title: item.title })));
    
    const { data } = await api.post("/gateway/callback", {
      cart,
      user,
    });
    
    console.log("Payment callback successful:", data);
    return data;
  } catch (err) {
    console.error("Payment callback failed:", err.response?.data || err.message);
    return null;
  }
}
