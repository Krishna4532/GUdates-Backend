// routes/chat.js
import express from "express";
import { sendMessage, getConversation, getConversationList } from "../controllers/chatController.js";
import { auth } from "../middleware/authMiddleware.js"; // adapt to your middleware name

const router = express.Router();

router.post("/send", auth, sendMessage);
router.get("/conversation/:id", auth, getConversation);
router.get("/list", auth, getConversationList);

export default router;

