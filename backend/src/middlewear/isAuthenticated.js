import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

// expects header => Authorization: Bearer <token>
export const isAuthenticated = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({success: false, message: "Unauthorized: token missing"});
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.SECRET_KEY);

        const user = await User.findById(decoded.id).select("-password -otp -otpExpiry -token");
        if (!user) {
            return res.status(401).json({success: false, message: "Unauthorized: user not found"});
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({success: false, message: "Unauthorized: invalid or expired token"});
    }
};
