import express from "express";
import multer from "multer";
import Post from "../models/Post.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import Couple from "../models/Couple.js";
import { protect } from "../middleware/authMiddleware.js";
import fs from "fs";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_"))
});
const upload = multer({ storage });

// public feed
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().populate("author", "name profilePic").sort({ createdAt: -1 }).limit(100);
    res.json(posts);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// create post
router.post("/", protect, upload.single("media"), async (req, res) => {
  try {
    const media = req.file ? `/${req.file.path}` : "";
    const { caption, isCollab, collabWith } = req.body;
    const collabArr = isCollab && collabWith ? collabWith.split(",").map(s=>s.trim()) : [];
    const post = await Post.create({
      author: req.user._id, caption: caption||"", media, isCollab: !!isCollab, collabWith: collabArr
    });
    res.status(201).json(post);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// like
router.post("/:id/like", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Not found" });
    const already = post.likes.find(id => id.toString() === req.user._id.toString());
    if (already) return res.json({ liked: false });
    post.likes.push(req.user._id); await post.save();
    await User.findByIdAndUpdate(post.author, { $inc: { points: 2, crushPoints: 2 } });
    await Notification.create({ user: post.author, text: `${req.user.name} liked your post`, link: `/posts/${post._id}` });
    res.json({ liked: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// comment
router.post("/:id/comment", protect, async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Post.findById(req.params.id);
    post.comments.push({ user: req.user._id, text }); await post.save();
    await User.findByIdAndUpdate(post.author, { $inc: { points: 5, crushPoints: 5 } });
    await Notification.create({ user: post.author, text: `${req.user.name} commented: "${text}"`, link: `/posts/${post._id}` });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// share
router.post("/:id/share", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    post.shares = (post.shares||0) + 1; await post.save();
    await User.findByIdAndUpdate(post.author, { $inc: { points: 10, crushPoints: 10 } });

    if (post.isCollab && post.collabWith && post.collabWith.length>0) {
      // simple: consider first collab partner
      const pair = [post.author.toString(), post.collabWith[0].toString()].sort();
      let couple = await Couple.findOne({ users: { $all: pair } });
      if (!couple) couple = await Couple.create({ users: pair, points: 0 });
      couple.points += 10; await couple.save();
    }

    await Notification.create({ user: post.author, text: `${req.user.name} shared your post`, link: `/posts/${post._id}` });
    res.json({ shared: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// delete post (owner)
router.delete("/:id", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Not found" });
    if (post.author.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Forbidden" });
    if (post.media) {
      const p = post.media.replace(/^\//, "");
      if (fs.existsSync(p)) fs.unlinkSync(p);
    }
    await post.remove();
    res.json({ deleted: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
