import express from "express";
import multer from "multer";
import Story from "../models/Story.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_"))
});
const upload = multer({ storage });

// create story
router.post("/", protect, upload.single("media"), async (req, res) => {
  try {
    const path = req.file ? `/${req.file.path}` : "";
    const story = await Story.create({ author: req.user._id, media: path, expiresAt: new Date(Date.now() + 24*3600*1000) });
    res.status(201).json(story);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// like story
router.post("/:id/like", protect, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: "Not found" });
    if (!story.likes.includes(req.user._id)) {
      story.likes.push(req.user._id); await story.save();
      await User.findByIdAndUpdate(story.author, { $inc: { points: 1, crushPoints: 1 }});
      await Notification.create({ user: story.author, text: `${req.user.name} liked your story` });
    }
    res.json({ liked: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// get active stories
router.get("/", async (req, res) => {
  try {
    const stories = await Story.find({ expiresAt: { $gt: new Date() } }).populate("author", "name profilePic");
    res.json(stories);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
