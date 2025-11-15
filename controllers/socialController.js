import User from "../models/User.js";
import Match from "../models/Match.js";
import Notification from "../models/Notification.js";
import Post from "../models/Post.js";
import Message from "../models/Message.js";
import Story from "../models/Story.js";
import Report from "../models/Report.js";

/* 1) Send crush */
export const sendCrush = async (req, res) => {
  try {
    const fromId = req.user.id;
    const toId = req.params.id;

    if (fromId === toId) return res.status(400).json({ success:false, message:"Cannot crush yourself" });

    const to = await User.findById(toId);
    if (!to) return res.status(404).json({ success:false, message:"User not found" });

    // Prevent duplicate: store sentCrushes as array? simplest: check Notification existence.
    const existing = await Notification.findOne({ user: toId, "payload.from": fromId, type: "crush" });
    if (existing) return res.json({ success:false, message:"Already sent crush" });

    // Add points: 1 like = 2 pts as rule? For crush let's add 1 crushPoint
    to.crushPoints = (to.crushPoints || 0) + 1;
    await to.save();

    // Create notification for the recipient
    await Notification.create({ user: toId, type: "crush", payload: { from: fromId }, read:false });

    // Check reciprocal crush -> match
    const reciprocal = await Notification.findOne({ user: fromId, "payload.from": toId, type: "crush" });
    if (reciprocal) {
      // create Match if doesn't exist
      const exists = await Match.findOne({ users: { $all: [fromId, toId] } });
      if (!exists) {
        const match = await Match.create({ users: [fromId, toId] });
        // notify both
        await Notification.create({ user: fromId, type: "match", payload: { with: toId } });
        await Notification.create({ user: toId, type: "match", payload: { with: fromId } });
      }
      return res.json({ success:true, message:"It's a match!" });
    }

    res.json({ success:true, message:"Crush sent" });
  } catch (err) {
    res.status(500).json({ success:false, message: err.message });
  }
};

/* 2) Get notifications */
export const getNotifications = async (req, res) => {
  const userId = req.user.id;
  const notifs = await Notification.find({ user: userId }).sort({ createdAt:-1 }).limit(50);
  res.json({ success:true, notifications: notifs });
};

/* 3) Mark notification read */
export const markRead = async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { read:true });
  res.json({ success:true });
};

/* 4) Send message (store in DB; optionally emit via socket) */
export const sendMessage = async (req, res) => {
  try {
    const sender = req.user.id;
    const { to, text, image } = req.body;
    if (!to || (!text && !image)) return res.status(400).json({ success:false, message:"Nothing to send" });

    const msg = await Message.create({ sender, receiver: to, text, image });
    // Create notification for receiver
    await Notification.create({ user: to, type: "message", payload: { from: sender, messageId: msg._id } });

    // If using socket.io: emit here (server side socket)
    // io.to(to).emit("message", msg);

    res.json({ success:true, message: msg });
  } catch (err) {
    res.status(500).json({ success:false, message:err.message });
  }
};

/* 5) Get conversation with user */
export const getConversation = async (req, res) => {
  const me = req.user.id;
  const other = req.params.id;
  const msgs = await Message.find({ $or: [{ sender: me, receiver: other }, { sender: other, receiver: me }] }).sort({ createdAt:1 });
  res.json({ success:true, messages: msgs });
};

/* 6) Upload Story */
export const uploadStory = async (req, res) => {
  try {
    const user = req.user.id;
    const { image } = req.body; // base64 or cloud URL
    if (!image) return res.status(400).json({ success:false });
    const expiresAt = new Date(Date.now() + 24*60*60*1000);
    const st = await Story.create({ user, image, expiresAt });
    res.json({ success:true, story: st });
  } catch (err) { res.status(500).json({ success:false, message: err.message }); }
};

/* 7) Get Stories (not expired) */
export const getStories = async (req, res) => {
  const now = new Date();
  const stories = await Story.find({ expiresAt: { $gt: now } }).populate("user", "name profilePic");
  res.json({ success:true, stories });
};

/* 8) Report user */
export const reportUser = async (req, res) => {
  try {
    const reporter = req.user.id;
    const { reportedId, reason, details } = req.body;
    await Report.create({ reporter, reported: reportedId, reason, details });
    res.json({ success:true, message:"Reported" });
  } catch (err) { res.status(500).json({ success:false, message: err.message }); }
};

/* 9) Boost/Spend points */
export const spendPoints = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { amount, type } = req.body;
    if (user.points < amount) return res.status(400).json({ success:false, message:"Not enough points" });
    user.points -= amount;
    await user.save();
    // handle buy virtual gift/boost: create record or modify target user points
    if (type === "gift") {
      const { toUserId, giftValue } = req.body;
      const target = await User.findById(toUserId);
      if (target) {
        target.points += giftValue || 0;
        await target.save();
        await Notification.create({ user: toUserId, type: "gift", payload: { from: user._id, value: giftValue } });
      }
    }
    res.json({ success:true, points: user.points });
  } catch (err) { res.status(500).json({ success:false, message: err.message }); }
};
