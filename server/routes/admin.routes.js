import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getPlatformStats,
  getMoodSummary,
  getSessionTrend,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getMoodByMonth,
  getMoodDistribution,
  getSessionStats,
  getDepartmentBreakdown,
  downloadReport,
} from "../controllers/admin.controller.js";

const router = express.Router();

// ── Middleware: only allow admin role ──────────────────────────────────────
const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};

// ── Dashboard stats ────────────────────────────────────────────────────────
router.get("/stats",         protect, adminOnly, getPlatformStats);
router.get("/mood-summary",  protect, adminOnly, getMoodSummary);
router.get("/session-trend", protect, adminOnly, getSessionTrend);

// ── User CRUD ──────────────────────────────────────────────────────────────
router.get("/users",          protect, adminOnly, getAllUsers);
router.post("/users",         protect, adminOnly, createUser);
router.put("/users/:id",      protect, adminOnly, updateUser);
router.delete("/users/:id",   protect, adminOnly, deleteUser);

// ── Analytics ─────────────────────────────────────────────────────────────
router.get("/analytics/mood-by-month",        protect, adminOnly, getMoodByMonth);
router.get("/analytics/mood-distribution",    protect, adminOnly, getMoodDistribution);
router.get("/analytics/session-stats",        protect, adminOnly, getSessionStats);
router.get("/analytics/department-breakdown", protect, adminOnly, getDepartmentBreakdown);

// ── Reports (CSV download) ────────────────────────────────────────────────
router.get("/reports/:type", protect, adminOnly, downloadReport);

export default router;
