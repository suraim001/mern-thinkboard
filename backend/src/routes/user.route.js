import express from "express";
import { isAuthenticated } from "../middlewear/isAuthenticated.js";
import { changePassword, deleteAccount, getProfile, updateProfile } from "../controllers/user.controller.js";

const router = express.Router();

router.use(isAuthenticated); // every user route needs a logged in user

router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.put("/password", changePassword);
router.delete("/profile", deleteAccount);

export default router;
