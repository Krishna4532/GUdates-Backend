import express from "express";
import User from "../models/User.js";
import Couple from "../models/Couple.js";

const router = express.Router();

// trending crush
router.get("/crush", async (req, res) => {
  try {
    const users = await User.find().sort({ crushPoints: -1 }).limit(20).select("name profilePic crushPoints points");
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// power couples
router.get("/couple", async (req, res) => {
  try {
    const couples = await Couple.find().sort({ points: -1 }).limit(20).populate("users", "name profilePic");
    res.json(couples);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
