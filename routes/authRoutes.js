import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

const genToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, course, age, heightCm, interests } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Missing fields" });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already registered" });
    const user = await User.create({ name, email, password, course, age, heightCm, interests });
    res.status(201).json({ token: genToken(user._id), user: { id: user._id, name: user.name, email: user.email }});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    const match = await user.matchPassword(password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });
    res.json({ token: genToken(user._id), user: { id: user._id, name: user.name, points: user.points }});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
