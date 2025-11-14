import express from "express";
import Gift from "../models/Gift.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// list
router.get("/", async (req, res) => {
  try {
    const gifts = await Gift.find();
    res.json(gifts);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// buy
router.post("/buy", protect, async (req, res) => {
  try {
    const { giftId, toUserId } = req.body;
    const gift = await Gift.findById(giftId);
    if (!gift) return res.status(404).json({ message: "Gift not found" });
    const buyer = await User.findById(req.user._id);
    if (buyer.points < gift.cost) return res.status(400).json({ message: "Not enough points" });
    buyer.points -= gift.cost; await buyer.save();
    await Notification.create({ user: toUserId, text: `${buyer.name} sent you ${gift.title} ${gift.emoji}` });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
