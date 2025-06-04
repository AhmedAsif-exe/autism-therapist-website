const GoogleStrategy = require("passport-google-oauth20").Strategy;
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const User = require("../Schema/User");

module.exports = (passport) => {
  // Serialize user
  passport.serializeUser((user, done) => done(null, user.id));

  // Deserialize user
  passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
  });

  // Local Strategy (manual login)
  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      async (email, password, done) => {
        const user = await User.findOne({ email });

        if (!user) {
          return done(null, false, { message: "User not found" });
        }

        if (!user.password) {
          return done(null, false, {
            message:
              "This account uses Google login. Please use Google to sign in.",
          });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        return isMatch
          ? done(null, user)
          : done(null, false, { message: "Invalid password" });
      }
    )
  );

  // Google Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // First try to find the user by googleId
          let user = await User.findOne({ googleId: profile.id });

          // If not found by googleId, check if email exists
          if (!user) {
            const existingEmailUser = await User.findOne({
              email: profile.emails[0].value,
            });

            if (existingEmailUser) {
              existingEmailUser.googleId = profile.id;
              existingEmailUser.pfp =
                existingEmailUser.pfp || profile.photos?.[0]?.value || null;
              await existingEmailUser.save();
              user = existingEmailUser;
            } else {
              // Create a new user
              user = await User.create({
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
                pfp: profile.photos?.[0]?.value || null,
              });
            }
          }

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
};
