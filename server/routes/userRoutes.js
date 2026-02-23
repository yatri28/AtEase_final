import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getMyProfile,
  updateProfile
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/me", protect, getMyProfile);
router.put("/update", protect, updateProfile);

export default router;