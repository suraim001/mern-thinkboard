import jwt from "jsonwebtoken";

export const generateToken = (user) => {
    return jwt.sign({id: user._id, email: user.email}, process.env.SECRET_KEY, {expiresIn: "7d"});
};

// only the fields that are safe to send to the client
export const toPublicUser = (user) => ({
    _id: user._id,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    isVerified: user.isVerified,
    hasPassword: Boolean(user.password),
    hasGoogle: Boolean(user.googleId),
    createdAt: user.createdAt
});
