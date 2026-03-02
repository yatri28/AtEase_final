import express from "express";
import { protect } from "../middleware/auth.js";

import {
  bookSession,
  getStudentSessions,
  getCounselorSessions,
  approveSession,
  cancelSession,
} from "../controllers/session.controller.js";

const router = express.Router();

/* Student */
router.post("/book", protect, bookSession);
router.get("/student", protect, getStudentSessions);

/* Counselor */
router.get("/counselor", protect, getCounselorSessions);
router.put("/approve/:id", protect, approveSession);
router.put("/cancel/:id", protect, cancelSession);

export default router;