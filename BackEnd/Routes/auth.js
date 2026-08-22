const express = require("express");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const User = require("../Schema/User");

const router = express.Router();

function backendBase() {
  return (process.env.BACKEND_PUBLIC_URL || "http://localhost:5000").replace(
    /\/+$/,
    "",
  );
}

const AVATAR_DIR = path.join(__dirname, "..", "uploads", "avatars");
fs.mkdirSync(AVATAR_DIR, { recursive: true });

const avatarUpload = multer({
  storage: multer.diskStorage({
    destination: AVATAR_DIR,
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${req.user._id}-${crypto.randomBytes(6).toString("hex")}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

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
router.get("/me", async (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    const { name, email, pfp, _id, paidItems, role, password } = req.user;
    res.json({
      user: {
        name,
        email,
        pfp,
        _id,
        paidItems,
        role,
        hasPassword: !!password,
      },
    });
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});

function ensureAuth(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  return res.status(401).json({ message: "Not authenticated" });
}

const ROLES = ["Parent", "Trainer", "Caretaker"];

// Update the caller's own profile. Only `role` is editable here today.
router.patch("/profile", ensureAuth, async (req, res) => {
  const { role } = req.body || {};
  if (role !== undefined && role !== null && !ROLES.includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  req.user.role = role || null;
  await req.user.save();
  res.json({ role: req.user.role });
});

// Change (or, for Google-only accounts with no password yet, set) the
// caller's password. Existing local accounts must prove they know the
// current password; Google-only accounts have none to prove.
router.post("/change-password", ensureAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};

  if (!newPassword || newPassword.length < 6) {
    return res
      .status(400)
      .json({ message: "New password must be at least 6 characters long" });
  }

  if (req.user.password) {
    const isMatch = await bcrypt.compare(currentPassword || "", req.user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }
  }

  req.user.password = await bcrypt.hash(newPassword, 10);
  await req.user.save();
  res.json({ message: "Password updated" });
});

// Upload/replace the caller's profile picture.
router.post("/avatar", ensureAuth, (req, res) => {
  avatarUpload.single("avatar")(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const previousPfp = req.user.pfp;
    req.user.pfp = `${backendBase()}/uploads/avatars/${req.file.filename}`;
    await req.user.save();

    // Best-effort cleanup of the previous locally-hosted avatar (never a
    // Google photo URL, which lives outside AVATAR_DIR and must not be touched).
    if (previousPfp?.includes("/uploads/avatars/")) {
      const oldPath = path.join(AVATAR_DIR, path.basename(previousPfp));
      fs.unlink(oldPath, () => {});
    }

    res.json({ pfp: req.user.pfp });
  });
});

module.exports = router;
