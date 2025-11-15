import express from "express";
import Message from "../models/Message.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/send", protect, async (req, res) => {
  try {
    const { receiverId, message } = req.body;

    const newMsg = await Message.create({
      sender: req.user.id,
      receiver: receiverId,
      message
    });

    res.json({ success: true, newMsg });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/:userId", protect, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user.id }
      ]
    }).sort({ createdAt: 1 });

    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
