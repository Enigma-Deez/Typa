import express from "express";
import Score from "../models/Score.js";

const router = express.Router();

// POST /api/scores/submit
router.post("/submit", async (req, res) => {
  try {
    const { username, wpm, accuracy, season = "2025-Q4", deviceType = "desktop" } = req.body;
    const score = new Score({ username, wpm, accuracy, season, deviceType });
    await score.save();
    res.json({ message: "Score submitted successfully!" });
  } catch (err) {
    console.error("Submit error:", err);
    res.status(500).json({ error: "Failed to submit score" });
  }
});

// GET /api/scores/season/:season?deviceType=...
router.get("/season/:season", async (req, res) => {
  try {
    const { season } = req.params;
    const { deviceType } = req.query;

    const query = { season };
    if (deviceType) query.deviceType = deviceType;

    const scores = await Score.find(query).sort({ wpm: -1 }).limit(20);
    res.json(scores);
  } catch (err) {
    console.error("Leaderboard fetch error:", err);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

// Fallback route for legacy /leaderboard
router.get("/leaderboard", async (req, res) => {
  try {
    const scores = await Score.find().sort({ wpm: -1 }).limit(20);
    res.json(scores);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

export default router;
