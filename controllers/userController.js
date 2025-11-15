import User from "../models/User.js";
import Post from "../models/Post.js";

/* ---------------------------------------------------------
   1. COMPLETE PROFILE (first time setup)
----------------------------------------------------------*/
export const completeProfile = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware

    const {
      name,
      age,
      course,
      heightCm,
      interests,
      bio,
      profilePic
    } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        name,
        age,
        course,
        heightCm,
        interests,
        bio,
        profilePic,
        profileComplete: true
      },
      { new: true }
    );

    res.json({
      success: true,
      message: "Profile setup completed",
      user
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------------------------------------------------------
   2. GET LOGGED-IN USER PROFILE
----------------------------------------------------------*/
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(
      userId,
      "-password -email" // Hide sensitive info
    );

    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    res.json({
      success: true,
      user
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------------------------------------------------------
   3. UPDATE PROFILE (user can change anytime)
----------------------------------------------------------*/
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const updates = req.body;

    const user = await User.findByIdAndUpdate(userId, updates, { new: true });

    res.json({
      success: true,
      message: "Profile updated successfully",
      user
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------------------------------------------------------
   4. UPLOAD PROFILE PICTURE
----------------------------------------------------------*/
export const uploadProfilePic = async (req, res) => {
  try {
    const userId = req.user.id;
    const { image } = req.body; // Base64 or Image URL

    if (!image)
      return res.status(400).json({ success: false, message: "No image provided" });

    const user = await User.findByIdAndUpdate(
      userId,
      { profilePic: image },
      { new: true }
    );

    res.json({
      success: true,
      message: "Profile picture updated",
      profilePic: user.profilePic
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------------------------------------------------------
   5. UPLOAD POST
----------------------------------------------------------*/
export const uploadPost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { image, caption } = req.body;

    if (!image)
      return res.status(400).json({ success: false, message: "Image required" });

    const post = await Post.create({
      user: userId,
      image,
      caption
    });

    res.json({
      success: true,
      message: "Post uploaded",
      post
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------------------------------------------------------
   6. GET USER POSTS
----------------------------------------------------------*/
export const getUserPosts = async (req, res) => {
  try {
    const userId = req.user.id;

    const posts = await Post.find({ user: userId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      posts
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------------------------------------------------------
   7. GET ALL USERS (Public list — for Explore Page)
----------------------------------------------------------*/
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find(
      {},
      "name age course bio interests profilePic profileComplete"
    ).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

