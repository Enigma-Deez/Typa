import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || process.env.ATLAS;

    if (!uri) {
      throw new Error("❌ MongoDB connection string not found (MONGO_URI or ATLAS)");
    }

    console.log("⏳ Connecting to MongoDB...");

    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1); // Exit on failure to avoid partial startup
  }
};

export default connectDB;
