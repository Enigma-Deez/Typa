import mongoose from "mongoose";

const scoreSchema = new mongoose.Schema({
  username: { type: String, required: true },
  wpm: { type: Number, required: true },
  accuracy: { type: Number, required: true },
  totalChars: { type: Number },
  timeTaken: { type: Number },
  season: { type: String, required: true },
  deviceType: { type: String, default: "desktop" },
}, { timestamps: true });

// ✅ Default export for easy import
export default mongoose.model("Score", scoreSchema);
