import mongoose from "mongoose";

const scoreSchema = new mongoose.Schema({
  username: String,
  wpm: Number,
  accuracy: Number,
  date: { type: Date, default: Date.now },
});

export default mongoose.model("Score", scoreSchema);
