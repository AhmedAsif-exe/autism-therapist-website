require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
const MongoStore = require("connect-mongo");

require("./Config/passport")(passport);
const authRoutes = require("./Routes/auth");
const commentRoutes = require("./Routes/comments");
const paymentRoutes = require("./Routes/gateway")
const app = express();

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Mongo DB connected successfully"));

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(
  "/gateway/webhook",
  express.raw({ type: "application/json" }),
  paymentRoutes.webhookRouter
);

app.use(express.json()); // Now safe
app.use(
  session({
    secret: process.env.MONGODB_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 2,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Use routes
// All other normal JSON routes
app.use("/auth", authRoutes);
app.use("/comments", commentRoutes);
app.use("/gateway", paymentRoutes.normalRouter);
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
