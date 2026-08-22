const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  googleId: String,
  email: { type: String, unique: true },
  password: String,
  name: String,
  pfp: { type: String, default: null }, // URL to profile picture (e.g., from Google)
  role: {
    type: String,
    enum: ["Parent", "Trainer", "Caretaker"],
    default: null,
  },
  paidItems: [
    {
      id: String,
      purchasedAt: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
