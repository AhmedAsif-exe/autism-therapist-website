const express = require("express");
const Stripe = require("stripe");
const User = require("../Schema/User");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const webhookRouter = express.Router();
const normalRouter = express.Router();
function callback(session) {
  console.log(session);
}
// Webhook route
webhookRouter.post("/", (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log("✅ Payment Success Webhook Fired", session);
    callback(session);
  }

  res.status(200).send("Received webhook");
});

// Regular payment route
normalRouter.post("/create-checkout-session", async (req, res) => {
  const { cart, user } = req.body;

  try {
    if (!cart?.length || !user) {
      return res.status(400).json({ error: "Cart and user are required." });
    }

    const line_items = cart.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.title || "Resource",
          description: `${item.category} - ${item.type}`,
        },
        unit_amount: Math.round((item.price || 1) * 100),
      },
      quantity: 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      success_url: process.env.FRONTEND_URL + "/success",
      cancel_url: process.env.FRONTEND_URL + "/cancel",
      metadata: {
        userEmail: user.email,
        userName: user.name,
        userId: user._id,
      },
    });

    res.json({ id: session.id });
  } catch (e) {
    console.log(e);
  }
});

normalRouter.post("/callback", async (req, res) => {
  const { cart, user } = req.body;
  if (!cart?.length || !user) {
    return res.status(400).json({ error: "Cart and user are required." });
  }
  try {
    const userInfo = await User.findById(user._id);

    const newItemIds = cart.map((item) => item.id);

    const updatedPaidItems = [
      ...new Set([...userInfo.paidItems, ...newItemIds]),
    ];
    console.log(userInfo);
    userInfo.paidItems = updatedPaidItems;
    await userInfo.save();
    res.status(200).json({ message: "Paid items updated successfully" });
  } catch (e) {
    console.log(e);
  }
});
module.exports = {
  webhookRouter,
  normalRouter,
};
