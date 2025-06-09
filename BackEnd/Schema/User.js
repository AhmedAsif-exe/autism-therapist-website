const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  googleId: String,
  email: { type: String, unique: true },
  password: String,
  name: String,
  pfp: { type: String, default: null }, // URL to profile picture (e.g., from Google)
  paidItems: [{ type: String, default: null }],
});

module.exports = mongoose.model("User", userSchema);
