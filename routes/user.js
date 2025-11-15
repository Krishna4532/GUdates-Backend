import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  completeProfile,
  getUserProfile,
  updateProfile,
  uploadProfilePic,
  uploadPost,
  getUserPosts,
  getAllUsers
} from "../controllers/userController.js";

const router = express.Router();

router.post("/complete-profile", authMiddleware, completeProfile);

router.get("/profile", authMiddleware, getUserProfile);

router.put("/update", authMiddleware, updateProfile);

router.post("/profile-pic", authMiddleware, uploadProfilePic);

router.post("/post", authMiddleware, uploadPost);

router.get("/posts", authMiddleware, getUserPosts);

router.get("/all", authMiddleware, getAllUsers);   // ⭐ THIS RETURNS ALL USERS

export default router;


