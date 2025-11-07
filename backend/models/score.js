// models/Score.js
import mongoose from "mongoose";

scoreSchema.index({ username: 1, season: 1, deviceType: 1 }, { unique: true });
const scoreSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  wpm: Number,
  accuracy: Number,
  season: String,
  deviceType: String,
}, { timestamps: true });

export default mongoose.model("Score", scoreSchema);
