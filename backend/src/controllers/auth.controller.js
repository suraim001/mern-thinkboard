import bcrypt from "bcryptjs";
import { User } from "../models/user.model.js";
import { generateToken, toPublicUser } from "../utils/generateToken.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const register = async (req, res) => {
    try {
        const {username, email, password} = req.body;

        if (!username?.trim() || !email?.trim() || !password) {
            return res.status(400).json({success: false, message: "All fields are required"});
        }
        if (!EMAIL_REGEX.test(email)) {
            return res.status(400).json({success: false, message: "Invalid email address"});
        }
        if (password.length < 6) {
            return res.status(400).json({success: false, message: "Password must be at least 6 characters"});
        }

        const existingUser = await User.findOne({email: email.toLowerCase()});
        if (existingUser) {
            return res.status(409).json({success: false, message: "An account with this email already exists"});
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            isLoggedIn: true
        });

        res.status(201).json({
            success: true,
            message: "Account created successfully",
            token: generateToken(user),
            user: toPublicUser(user)
        });
    } catch (error) {
        console.error("Error in register controller", error);
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
};

const login = async (req, res) => {
    try {
        const {email, password} = req.body;

        if (!email?.trim() || !password) {
            return res.status(400).json({success: false, message: "Email and password are required"});
        }

        const user = await User.findOne({email: email.toLowerCase()}).select("+password");

        // account created with google and no password set yet
        if (user && !user.password) {
            return res.status(400).json({success: false, message: "This account uses Google sign-in. Continue with Google instead."});
        }

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({success: false, message: "Invalid email or password"});
        }

        user.isLoggedIn = true;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Logged in successfully",
            token: generateToken(user),
            user: toPublicUser(user)
        });
    } catch (error) {
        console.error("Error in login controller", error);
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
};

const googleCallback = (req, res) => {
    try {
        const token = generateToken(req.user);
        const CLIENT_URL = (process.env.NODE_ENV === 'production') ? "" : process.env.CLIENT_URL;

        res.redirect(`${CLIENT_URL}/auth-success?token=${token}`);
    } catch (error) {
        console.error("Google login error", error);
        res.redirect(`${CLIENT_URL}/login?error=google_failed`);
    }
};

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("+password");
        res.status(200).json({success: true, user: toPublicUser(user)});
    } catch (error) {
        console.error("Error in getMe controller", error);
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
};

// JWT is stateless, so the client drops the token; here we only update the login flag
const logout = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user._id, {isLoggedIn: false});
        res.status(200).json({success: true, message: "Logged out successfully"});
    } catch (error) {
        console.error("Error in logout controller", error);
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
};

export { register, login, googleCallback, getMe, logout };
