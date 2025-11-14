import Leaderboard from "../models/Leaderboard.js";

export const getLeaderboard = async (req, res) => {
  try {
    const list = await Leaderboard.find().sort({ score: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addScore = async (req, res) => {
  try {
    const { username, score } = req.body;
    const entry = new Leaderboard({ username, score });
    await entry.save();
    res.json({ message: "Score added", entry });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
