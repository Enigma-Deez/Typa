import mongoose from "mongoose";

const scoreSchema = new mongoose.Schema({
  username: { type: String, required: true },
  wpm: { type: Number, required: true },
  accuracy: { type: Number, required: true },
  season: { type: String, default: "2025-Q4" },
  deviceType: { type: String, enum: ["desktop", "mobile"], default: "desktop" },
}, { timestamps: true });

// ✅ Prevent duplicate usernames per season + device
scoreSchema.index({ username: 1, season: 1, deviceType: 1 }, { unique: true });

export default mongoose.model("Score", scoreSchema);
