const express = require("express");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const User = require("../Schema/User");

const router = express.Router();

// Manual Register
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    user = new User({ name, email, password: hashed });
    await user.save();

    res.status(201).json({ message: "User registered" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Manual Login
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(400).json({ message: info.message });
    }
    req.logIn(user, (err) => {
      if (err) return next(err);
      res.json({ message: "Login successful", user });
    });
  })(req, res, next);
});

// Google OAuth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect(process.env.FRONTEND_URL);
  }
);

// routes/auth.js
router.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: "Error logging out" });
    }
    req.session.destroy(() => {
      res.clearCookie("connect.sid"); // clear the cookie
      res.json({ message: "Logged out successfully" });
    });
  });
});
router.get("/me", (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    const { name, email, pfp, _id, paidItems } = req.user;
    res.json({
      user: { name, email, pfp, _id, paidItems },
    });
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});

module.exports = router;
