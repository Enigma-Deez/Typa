import express from "express";
import Score from "../models/score.js";
import { CURRENT_SEASON } from "../config/season.js";

const router = express.Router();

// ✅ POST /api/scores/submit (server-side verified)
router.post("/submit", async (req, res) => {
  try {
    const {
      username,
      wpm,
      accuracy,
      totalChars,
      timeTaken,
      season = CURRENT_SEASON,
      deviceType = "desktop",
    } = req.body;

    // 1️⃣ Check for missing fields
    if (!username || !accuracy || !totalChars || !timeTaken) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 2️⃣ Recalculate WPM on the server
    const calculatedWpm = Math.round((totalChars / 5) / (timeTaken / 60));

    // 3️⃣ Reject if unrealistic or mismatched
    if (calculatedWpm > 250 || calculatedWpm < 1 || accuracy > 100 || accuracy < 0) {
      return res.status(400).json({ error: "Invalid or unrealistic score" });
    }

    if (Math.abs(calculatedWpm - (wpm || calculatedWpm)) > 5) {
      console.warn(`⚠️ Tampered score attempt by ${username}: client ${wpm}, server ${calculatedWpm}`);
      return res.status(400).json({ error: "Score validation failed" });
    }

    // 4️⃣ Save every valid result
    const score = new Score({
      username,
      wpm: calculatedWpm,
      accuracy,
      season,
      deviceType,
    });

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
