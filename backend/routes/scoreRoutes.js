import express from "express";
import Score from "../models/score.js";
import { CURRENT_SEASON } from "../config/season.js";

const router = express.Router();

// ✅ POST /api/scores/submit
router.post("/submit", async (req, res) => {
  try {
    const { username, wpm, accuracy, season = CURRENT_SEASON, deviceType = "desktop" } = req.body;

    // ✅ 1. Check for missing fields
    if (!username || wpm == null || accuracy == null) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ✅ 2. Validate score range (anti-cheat)
    if (wpm > 250 || wpm < 1 || accuracy > 100 || accuracy < 0) {
      return res.status(400).json({ error: "Invalid score detected" });
    }

    // ✅ 3. Always store every valid result (no duplicates blocked)
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

    // ✅ Fetch all records for the season/device
    const scores = await Score.find(query).sort({ wpm: -1, accuracy: -1 });
    res.json(scores);
  } catch (err) {
    console.error("❌ Leaderboard fetch error:", err);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

// ✅ Legacy route for old clients
router.get("/leaderboard", async (req, res) => {
  try {
    const scores = await Score.find({ season: CURRENT_SEASON }).sort({ wpm: -1, accuracy: -1 });
    res.json(scores);
  } catch (err) {
    console.error("❌ Legacy leaderboard error:", err);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

export default router;
