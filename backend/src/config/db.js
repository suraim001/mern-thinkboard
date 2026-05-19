import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MONGODB connected successfully!");
    } catch (error) {
        console.error("Failed to connect MONGODB!", error);
        process.exit(1); // 1: exit with failure
    }
};

export default connectDB;
