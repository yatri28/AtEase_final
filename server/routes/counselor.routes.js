import express from "express";
import Counselor from "../models/Counselor.js";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

/*
========================================
GET ASSIGNED COUNSELORS FOR A STUDENT
========================================
*/
router.get("/", protect, async (req, res) => {
  try {
    // Get logged in student
    const student = await User.findById(req.user.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Find counselors with same department + assignedYear
    const counselorUsers = await User.find({
      role: "counselor",
      department: student.department,
      assignedYear: student.year,
    });

    if (counselorUsers.length === 0) {
      return res.status(404).json({ message: "No counselor assigned" });
    }

    const counselors = [];

    // Fetch counselor profiles
    for (const user of counselorUsers) {
      const profile = await Counselor.findOne({
        userId: user._id,
      });

      counselors.push({
        _id: user._id,
        name: user.name,
        specialization: profile?.specialization || "General Counseling",
      });
    }

    res.json(counselors);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;