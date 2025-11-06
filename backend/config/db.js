import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || process.env.ATLAS;

    if (!uri) {
      throw new Error("❌ MongoDB connection string not found (MONGO_URI or ATLAS)");
    }

    console.log("⏳ Connecting to MongoDB...");

    const conn = await mongoose.connect(uri);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  }
};

export default connectDB;
