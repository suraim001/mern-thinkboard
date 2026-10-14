import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {type: String, trim: true},
    email: {type: String, required: true, unique: true, lowercase: true, trim: true},
    password: {type: String, select: false}, // never returned unless asked with .select("+password")
    googleId: {type: String},
    avatar: {type: String},
    isVerified: {type: Boolean, default: false},
    isLoggedIn: {type: Boolean, default: false},
    token: {type: String, default: null, select: false},
    otp: {type: String, default: null, select: false},
    otpExpiry: {type: String, default: null, select: false}
},{timestamps: true})

export const User = mongoose.model('User', userSchema);
