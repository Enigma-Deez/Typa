import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Support both MONGO_URI and legacy ATLAS env var
    const uri = process.env.MONGO_URI || process.env.ATLAS;
    if (!uri) {
      throw new Error('MongoDB connection string is not set in environment (MONGO_URI or ATLAS)');
    }
    await mongoose.connect(uri);
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.log("❌ MongoDB Error:", err.message);
    // Exit the process if DB connection fails in dev/prod
    process.exit(1);
  }
};

export default connectDB;
