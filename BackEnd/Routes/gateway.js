const express = require("express");
const paypal = require("@paypal/checkout-server-sdk");
const User = require("../Schema/User");
const router = express.Router();
const cron = require("node-cron");
const Stripe = require("stripe");
const fs = require("fs");
const path = require("path");
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

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function ensureAuth(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Not authenticated" });
}
// --- PayPal Client Setup ---
function paypalClient() {
  // const env = new paypal.core.SandboxEnvironment(
  //   process.env.PAYPAL_CLIENT_ID,
  //   process.env.PAYPAL_CLIENT_SECRET
  // );
  // process.env.NODE_ENV === "production"
  //   ?
  //
  const env = new paypal.core.LiveEnvironment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  );
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
router.post("/create-stripe-session", ensureAuth, async (req, res) => {
  try {
    const { cart } = req.body;
    if (!cart || !cart.length) {
      return res.status(400).json({ error: "Cart cannot be empty" });
    }

    const line_items = cart.map((item) => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: item.title || "Item",
        },
        unit_amount: Math.round((item.price || 0) * 100), // cents
      },
      quantity: item.quantity || 1,
    }));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/error`,
      billing_address_collection: "auto",
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe session error:", err);
    res.status(500).json({ error: "Failed to create Stripe checkout session" });
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
  // const filePath = `C:/Users/LENOVO/Downloads/${file}`;
  res.download(filePath); // sets headers for download
});

router.get("/videos/stream/:id", ensureAuth, (req, res) => {
  const id = req.params.id;

  // Map ID → File path
  const videoPath = path.join("/var/www/protected/", `${id}`);

  if (!fs.existsSync(videoPath)) {
    return res.status(404).json({ error: "Video not found" });
  }

  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;

  // Handle streaming (Range requests)
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;

    const file = fs.createReadStream(videoPath, { start, end });

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": "video/mp4",
    });

    file.pipe(res);
  } else {
    res.writeHead(200, {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4",
    });

    fs.createReadStream(videoPath).pipe(res);
  }
});
module.exports = router;
