import bcrypt from "bcryptjs";
import { User } from "../models/user.model.js";
import Note from "../models/note.model.js";
import { toPublicUser } from "../utils/generateToken.js";

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("+password");
        const notesCount = await Note.countDocuments({user: req.user._id});

        res.status(200).json({success: true, user: toPublicUser(user), notesCount});
    } catch (error) {
        console.error("Error in getProfile controller", error);
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const {username} = req.body;
        if (!username?.trim()) {
            return res.status(400).json({success: false, message: "Username is required"});
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            {username: username.trim()},
            {returnDocument: "after"}
        ).select("+password");

        res.status(200).json({success: true, message: "Profile updated", user: toPublicUser(user)});
    } catch (error) {
        console.error("Error in updateProfile controller", error);
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
};

// change the password, or set one for the first time if the account was created with google
const changePassword = async (req, res) => {
    try {
        const {currentPassword, newPassword} = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({success: false, message: "New password must be at least 6 characters"});
        }

        const user = await User.findById(req.user._id).select("+password");

        if (user.password) {
            // 400 not 401 here, so the client doesn't treat it as an expired session
            if (!currentPassword || !(await bcrypt.compare(currentPassword, user.password))) {
                return res.status(400).json({success: false, message: "Current password is incorrect"});
            }
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.status(200).json({success: true, message: "Password updated", user: toPublicUser(user)});
    } catch (error) {
        console.error("Error in changePassword controller", error);
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
};

// removes the user and all of their notes
const deleteAccount = async (req, res) => {
    try {
        await Note.deleteMany({user: req.user._id});
        await User.findByIdAndDelete(req.user._id);

        res.status(200).json({success: true, message: "Account deleted"});
    } catch (error) {
        console.error("Error in deleteAccount controller", error);
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
};

export { getProfile, updateProfile, changePassword, deleteAccount };
