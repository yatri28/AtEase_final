import express from "express";
import Counselor from "../models/Counselor.js";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Get only assigned counselor for logged-in student
router.get("/", protect, async (req, res) => {
  try {
    const student = await User.findById(req.user.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Find correct counselor from User model
    const counselorUser = await User.findOne({
      role: "counselor",
      department: student.department,
      assignedYear: student.year,
    });

    if (!counselorUser) {
      return res.status(404).json({ message: "No counselor assigned" });
    }

    // Get counselor profile from Counselor collection
    const counselorProfile = await Counselor.findOne({
      userId: counselorUser._id,
    });

    if (!counselorProfile) {
      return res.status(404).json({ message: "Counselor profile not found" });
    }

    res.json([{
      _id: counselorUser._id,
      name: counselorUser.name,
      specialization: counselorProfile.specialization,
    }]);

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;