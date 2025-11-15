import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

/**
 * SAVE PROFILE (first-time completion)
 */
router.post("/complete-profile", protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const updated = await User.findByIdAndUpdate(
      userId,
      {
        ...req.body,
        profileComplete: true,
      },
      { new: true }
    );

    return res.json({
      success: true,
      message: "Profile saved successfully",
      user: updated,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET MY PROFILE
 */
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    return res.json({ success: true, user });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * UPDATE PROFILE (edit profile page)
 */
router.put("/update", protect, async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.user.id,
      req.body,
      { new: true }
    ).select("-password");

    return res.json({
      success: true,
      message: "Profile updated successfully",
      user: updated,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
