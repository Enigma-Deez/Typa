import express from "express";
import Score from "../models/score.js";
import { CURRENT_SEASON } from "../config/season.js";

const router = express.Router();

// ✅ POST /api/scores/submit
router.post("/submit", async (req, res) => {
  try {
    const { username, wpm, accuracy, season = CURRENT_SEASON, deviceType = "desktop" } = req.body;

    // Basic validation
    if (!username || !wpm || !accuracy) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ✅ Check if username already exists in this season
    const existingUser = await Score.findOne({ username, season });
    if (existingUser) {
      return res.status(400).json({ error: "Username already taken for this season" });
    }

    // ✅ Save new score
    const score = new Score({ username, wpm, accuracy, season, deviceType });
    await score.save();

    res.json({ message: "Score submitted successfully!" });
  } catch (err) {
    console.error("❌ Submit error:", err);
    res.status(500).json({ error: "Failed to submit score" });
  }
});

// ✅ GET /api/scores/season/:season?deviceType=...
router.get("/season/:season", async (req, res) => {
  try {
    const { season } = req.params;
    const { deviceType } = req.query;

    const query = { season };
    if (deviceType) query.deviceType = deviceType;

    const scores = await Score.find(query).sort({ wpm: -1 }).limit(20);
    res.json(scores);
  } catch (err) {
    console.error("❌ Leaderboard fetch error:", err);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

// ✅ Fallback legacy route /api/scores/leaderboard
router.get("/leaderboard", async (req, res) => {
  try {
    const scores = await Score.find({ season: CURRENT_SEASON })
      .sort({ wpm: -1 })
      .limit(20);
    res.json(scores);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

export default router;
