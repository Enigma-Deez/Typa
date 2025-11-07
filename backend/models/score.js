import mongoose from "mongoose";

const scoreSchema = new mongoose.Schema({
  username: { type: String, required: true },
  wpm: Number,
  accuracy: Number,
  season: String,
  deviceType: String,
}, { timestamps: true });

// ✅ unique index: username+season+deviceType combo
scoreSchema.index({ username: 1, season: 1, deviceType: 1 }, { unique: true });

export default mongoose.model("Score", scoreSchema);
