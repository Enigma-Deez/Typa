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

    // ✅ 1. Basic field validation
    if (!username || !accuracy || !totalChars || !timeTaken) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ✅ 2. Compute current season dynamically (daily)
    const season = getCurrentSeason();

    // ✅ 3. Recalculate WPM on server for anti-cheat protection
    const calculatedWpm = Math.round((totalChars / 5) / (timeTaken / 60));

    // ✅ 4. Validate realism
    if (
      calculatedWpm > 250 ||
      calculatedWpm < 1 ||
      accuracy > 100 ||
      accuracy < 0
    ) {
      return res.status(400).json({ error: "Invalid or unrealistic score" });
    }

    // ✅ 5. Detect tampering
    if (wpm && Math.abs(calculatedWpm - wpm) > 5) {
      console.warn(
        `⚠️ Tampered score attempt by ${username}: client ${wpm}, server ${calculatedWpm}`
      );
      return res.status(400).json({ error: "Score validation failed" });
    }

    // ✅ 6. Save every valid result
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

// ✅ GET /api/scores/seasons - list all seasons with display names and dates
router.get("/seasons", async (req, res) => {
  try {
    // Get distinct seasons from the Score collection
    const seasonsRaw = await Score.find().distinct("season");

    if (!seasonsRaw.length) return res.json([]);

    // Map seasons to an object with id, displayName, and date
    const seasons = seasonsRaw
      .sort((a, b) => b.localeCompare(a)) // latest first
      .map((s, index) => {
        const datePart = s.split("-")[0]; // YYYY-MM-DD
        return {
          id: s,
          displayName: `Season ${index + 1}`, // Optionally number them sequentially
          date: datePart
        };
      });

    res.json(seasons);
  } catch (err) {
    console.error("❌ Error fetching seasons:", err);
    res.status(500).json({ error: "Failed to fetch seasons" });
  }
});

// ✅ Legacy fallback
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
