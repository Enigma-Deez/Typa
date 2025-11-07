// models/score.js
import mongoose from "mongoose";

const scoreSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true },
  wpm: { type: Number, required: true },
  accuracy: { type: Number, required: true },
  season: { type: String, required: true },
  deviceType: { type: String, enum: ["desktop", "mobile"], default: "desktop" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Score", scoreSchema);
