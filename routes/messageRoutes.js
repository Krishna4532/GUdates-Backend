import express from "express";
import Message from "../models/Message.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// history with a user
router.get("/history/:userId", protect, async (req, res) => {
  try {
    const other = req.params.userId;
    const conv = await Message.find({
      $or: [
        { from: req.user._id, to: other },
        { from: other, to: req.user._id }
      ]
    }).sort({ createdAt: 1 });
    res.json(conv);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// send message (persist)
router.post("/", protect, async (req, res) => {
  try {
    const { to, text } = req.body;
    const msg = await Message.create({ from: req.user._id, to, text });
    res.json(msg);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
