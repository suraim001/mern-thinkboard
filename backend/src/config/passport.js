import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import passport from "passport";
import { User } from "../models/user.model.js";

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback",
    proxy: true // trust the https proxy in production so the callback url stays https
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails?.[0]?.value;
            const avatar = profile.photos?.[0]?.value;

            // find by googleId first, then fall back to an existing account with the same email
            let user = await User.findOne({googleId: profile.id}) || await User.findOne({email: email?.toLowerCase()});

            if (!user) {
                user = await User.create({
                    googleId: profile.id,
                    username: profile.displayName,
                    email,
                    avatar,
                    isVerified: true
                });
            } else {
                // linking google to an email/password account that never proved it owns the email:
                // drop that password so whoever registered it with this email can't keep access
                if (!user.googleId && !user.isVerified) user.password = undefined;
                user.googleId = profile.id;
                user.avatar = avatar || user.avatar;
                user.isVerified = true;
            }

            user.isLoggedIn = true;
            await user.save();

            return done(null, user);
        } catch (error) {
            return done(error, null);
        }
    }
));

export default passport;
