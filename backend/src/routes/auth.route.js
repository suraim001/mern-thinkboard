import express from "express";
import passport from "passport";
import { isAuthenticated } from "../middlewear/isAuthenticated.js";
import { getMe, googleCallback, login, logout, register } from "../controllers/auth.controller.js";

const router = express.Router();

// email + password
router.post("/register", register);
router.post("/login", login);

// Redirect to google login
router.get("/google", passport.authenticate("google", {scope: ["profile", "email"], session: false}));

const CLIENT_URL = (process.env.NODE_ENV === 'development') ? process.env.CLIENT_URL : "";

router.get("/google/callback",
    passport.authenticate("google", {session: false, failureRedirect: `${CLIENT_URL}/login?error=google_failed`}),
    googleCallback
);

router.get("/me", isAuthenticated, getMe);
router.post("/logout", isAuthenticated, logout);

export default router;
