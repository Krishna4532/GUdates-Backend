import express from "express";
import { auth } from "../middleware/authMiddleware.js";
import {
  getMyProfile,
  updateProfile,
  exploreUsers
} from "../controllers/userController.js";

const router = express.Router();

router.get("/me", auth, getMyProfile);
router.put("/update", auth, updateProfile);
router.get("/explore", exploreUsers);

export default router;



