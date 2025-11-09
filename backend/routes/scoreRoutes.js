import express from "express";
import Score from "../models/score.js";
import { getCurrentSeason } from "../config/season.js";

const router = express.Router();

// ✅ POST /api/scores/submit (Server-side verified)
router.post("/submit", async (req, res) => {
  try {
    const {
      username,
      wpm,
      accuracy,
      totalChars,
      timeTaken,
      deviceType = "desktop",
    } = req.body;

    // 1️⃣ Basic validation
    if (!username || !accuracy || !totalChars || !timeTaken) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 2️⃣ Current season (weekly)
    const season = getCurrentSeason();

    // 3️⃣ Recalculate WPM server-side for fairness
    const calculatedWpm = Math.round((totalChars / 5) / (timeTaken / 60));

    // 4️⃣ Sanity checks
    if (
      calculatedWpm > 250 ||
      calculatedWpm < 1 ||
      accuracy > 100 ||
      accuracy < 0
    ) {
      return res.status(400).json({ error: "Invalid or unrealistic score" });
    }

    // 5️⃣ Prevent tampering
    if (wpm && Math.abs(calculatedWpm - wpm) > 5) {
      console.warn(
        `⚠️ Tampered score attempt by ${username}: client ${wpm}, server ${calculatedWpm}`
      );
      return res.status(400).json({ error: "Score validation failed" });
    }

    // 6️⃣ Prevent duplicate usernames within same season
    const existingUser = await Score.findOne({ username, season });
    if (existingUser) {
      return res.status(400).json({ error: "Username already taken for this season" });
    }

    // 7️⃣ Save score
    const score = new Score({
      username,
      wpm: calculatedWpm,
      accuracy,
      season,
      deviceType,
    });

    await score.save();
    res.json({
      message: "Score submitted successfully!",
      verifiedWpm: calculatedWpm,
    });
  } catch (err) {
    console.error("❌ Submit error:", err);
    res.status(500).json({ error: "Failed to submit score" });
  }
});

// ✅ GET /api/scores/season/:season — fetch leaderboard by season + optional device
router.get("/season/:season", async (req, res) => {
  try {
    const { season } = req.params;
    const { deviceType } = req.query;

    const query = { season };
    if (deviceType) query.deviceType = deviceType;

    const scores = await Score.find(query).sort({ wpm: -1, accuracy: -1 }).limit(20);
    res.json(scores);
  } catch (err) {
    console.error("❌ Leaderboard fetch error:", err);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

// ✅ NEW: GET /api/scores/seasons — list all past + current seasons
router.get("/seasons", async (req, res) => {
  try {
    const seasons = await Score.distinct("season");
    seasons.sort(); // chronological order
    res.json(seasons);
  } catch (err) {
    console.error("❌ Seasons fetch error:", err);
    res.status(500).json({ error: "Failed to fetch seasons list" });
  }
});

// ✅ Fallback (current season)
router.get("/leaderboard", async (req, res) => {
  try {
    const currentSeason = getCurrentSeason();
    const scores = await Score.find({ season: currentSeason }).sort({
      wpm: -1,
      accuracy: -1,
    });
    res.json(scores);
  } catch (err) {
    console.error("❌ Legacy leaderboard error:", err);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

export default router;
