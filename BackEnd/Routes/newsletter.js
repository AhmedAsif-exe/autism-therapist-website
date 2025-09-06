// routes/newsletter.js
const express = require("express");
const Subscriber = require("../Schema/Subscriber.js");

const router = express.Router();

router.post("/subscribe", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    const existing = await Subscriber.findOne({ email });
    if (existing) return res.status(400).json({ error: "Already subscribed" });

    const newSub = new Subscriber({ email });
    await newSub.save();

    res.json({ success: true, message: "Subscribed successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
