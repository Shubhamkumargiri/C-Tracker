import mongoose from "mongoose";

const connectDB = async () => {
    const mongoUri = process.env.MONGO_URI || process.env.MONGO_URL;

    if (!mongoUri) {
        console.error(
            "MongoDB connection string is missing. Add MONGO_URI to backend/.env before starting the server."
        );
        process.exit(1);
    }

    try {
        await mongoose.connect(mongoUri);
        console.log("MongoDB connected");
    } catch (err) {
        console.error("Failed to connect to MongoDB:", err.message);
        process.exit(1);
    }
};

export default connectDB;
