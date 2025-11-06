import express from "express";
import Score from "../models/score.js";

const router = express.Router();

router.post("/submit", async (req, res) => {
    try {
        const { username, wpm, accuracy } = req.body;
        const score = await Score.create({ username, wpm, accuracy });
        res.json(score);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/leaderboard", async (req, res) => {
    try {
        const scores = await Score.find().sort({ wpm: -1 }).limit(10);
        res.json(scores);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
