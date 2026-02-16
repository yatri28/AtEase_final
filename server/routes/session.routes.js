// export default router;
import express from "express";
import { bookSession, getStudentSessions } from "../controllers/session.controller.js";

const router = express.Router();

// Middleware to verify logged-in user (make sure req.user exists)
// session.routes.js
import { protect as authMiddleware } from "../middleware/auth.js";

router.post("/book", authMiddleware, bookSession);
router.get("/my-sessions", authMiddleware, getStudentSessions);

export default router;