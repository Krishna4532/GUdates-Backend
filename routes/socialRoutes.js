import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import * as social from "../controllers/socialController.js";

const router = express.Router();

router.post("/crush/:id", authMiddleware, social.sendCrush);
router.get("/notifications", authMiddleware, social.getNotifications);
router.post("/notifications/:id/read", authMiddleware, social.markRead);
router.post("/message", authMiddleware, social.sendMessage);
router.get("/conversation/:id", authMiddleware, social.getConversation);
router.post("/story", authMiddleware, social.uploadStory);
router.get("/stories", authMiddleware, social.getStories);
router.post("/report", authMiddleware, social.reportUser);
router.post("/spend", authMiddleware, social.spendPoints);

export default router;
