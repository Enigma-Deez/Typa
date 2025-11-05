import Score from "../models/Score.js";

export const submitScore = async (req, res) => {
  const { username, wpm, accuracy } = req.body;

  try {
    const newScore = await Score.create({ username, wpm, accuracy });
    res.status(201).json(newScore);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const scores = await Score.find()
      .sort({ wpm: -1, accuracy: -1 })
      .limit(20);

    res.json(scores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
