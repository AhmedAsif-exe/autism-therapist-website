const express = require("express");
const paypal = require("@paypal/checkout-server-sdk");
const User = require("../Schema/User");
const router = express.Router();
const cron = require("node-cron");

cron.schedule("0 0 * * *", async () => {
  // Runs every day at midnight
  const users = await User.find();
  const oneYear = 365 * 24 * 60 * 60 * 1000;
  const now = Date.now();

  for (const user of users) {
    user.paidItems = user.paidItems.filter(
      (item) => now - new Date(item.purchasedAt).getTime() < oneYear
    );
    await user.save();
  }
});

function ensureAuth(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Not authenticated" });
}
// --- PayPal Client Setup ---
function paypalClient() {
  const env = new paypal.core.SandboxEnvironment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  );
  // process.env.NODE_ENV === "production"
  //   ? new paypal.core.LiveEnvironment(
  //       process.env.PAYPAL_CLIENT_ID,
  //       process.env.PAYPAL_CLIENT_SECRET
  //     )
  //   :

  return new paypal.core.PayPalHttpClient(env);
}

// --- Create Order ---
// --- Create Order ---
router.post("/create-order", ensureAuth, async (req, res) => {
  try {
    const { cart } = req.body;

    if (!cart || !cart.length) {
      return res.status(400).json({ error: "Cart cannot be empty" });
    }

    // Build items
    const items = cart.map((item) => ({
      name: item.title || "Item",
      unit_amount: {
        currency_code: "EUR",
        value: (item.price || 0).toFixed(2),
      },
      quantity: String(item.quantity || 1),
    }));

    // Calculate total from items
    const total = items.reduce(
      (sum, item) =>
        sum + parseFloat(item.unit_amount.value) * parseInt(item.quantity),
      0
    );

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "EUR",
            value: total.toFixed(2),
            breakdown: {
              item_total: {
                currency_code: "EUR",
                value: total.toFixed(2),
              },
            },
          },
          items,
        },
      ],
      application_context: {
        brand_name: "ABA Virtual",
        landing_page: "LOGIN",
        user_action: "PAY_NOW",
        return_url: `${process.env.FRONTEND_URL}/success`,
        cancel_url: `${process.env.FRONTEND_URL}/error`,
        locale_code: "en-US", // enforce English
      },
    });

    const order = await paypalClient().execute(request);
    res.status(200).json(order.result);
  } catch (err) {
    console.error("PayPal Create Order Error:", err);
    res.status(500).json({ error: "Failed to create PayPal order" });
  }
});

// --- Capture Order ---
router.post("/callback", async (req, res) => {
  console.log(req.body);
  const { cart, user } = req.body;

  if (!cart?.length || !user) {
    return res.status(400).json({ error: "Cart and user are required." });
  }

  try {
    const userInfo = await User.findById(user._id);

    // Filter out already owned items
    const existingIds = userInfo.paidItems.map((item) => item.id);

    const newItems = cart
      .filter((item) => !existingIds.includes(item.id))
      .map((item) => ({
        id: item.id,
        purchasedAt: new Date(),
      }));

    userInfo.paidItems.push(...newItems);
    await userInfo.save();

    res.status(200).json({ message: "Paid items updated successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Something went wrong" });
  }
});
router.get("/:file", (req, res) => {
  const file = req.params.file;
  console.log(file);
  const filePath = `/var/www/protected/${file}`;
  // const filePath = "C:/Users/LENOVO/Downloads/FFC-features.pdf";
  res.download(filePath); // sets headers for download
});

module.exports = router;
