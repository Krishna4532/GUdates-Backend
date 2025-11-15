import express from "express";
import { registerUser, loginUser, logoutUser, getMe } from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Logout
router.post("/logout", logoutUser);

// Get logged-in user
router.get("/me", authMiddleware, getMe);

export default router;


