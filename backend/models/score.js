import mongoose from "mongoose";

const scoreSchema = new mongoose.Schema({
  username: { type: String, required: true },
  wpm: { type: Number, required: true },
  accuracy: { type: Number, required: true },
  season: { type: String, default: "Season 1" },
  deviceType: { type: String, enum: ["mobile", "desktop"], default: "desktop" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Score", scoreSchema);
