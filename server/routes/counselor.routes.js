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
    const student = await User.findById(req.user.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const counselorUsers = await User.find({
      role: "counselor",
      department: student.department,
      assignedYear: student.year,
    });

    if (counselorUsers.length === 0) {
      return res.status(404).json({ message: "No counselor assigned" });
    }

    const counselors = [];

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

/*
========================================
GET COUNSELOR PROFILE
========================================
*/
router.get("/profile", protect, async (req, res) => {
  try {

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "Counselor not found" });
    }

    const counselor = await Counselor.findOne({
      userId: req.user.id,
    });

    res.json({
      name: user.name,
      email: user.email,
      department: user.department,
      assignedYear: user.assignedYear,
      specialization: counselor?.specialization || "General Counseling",
      contactNumber: counselor?.contactNumber || "",
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/*
========================================
UPDATE COUNSELOR PROFILE
========================================
*/
router.put("/profile", protect, async (req, res) => {
  try {

    const { name, specialization, contactNumber } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name },
      { returnDocument: "after" }
    );

    const counselor = await Counselor.findOneAndUpdate(
      { userId: req.user.id },
      { specialization, contactNumber },
      { returnDocument: "after" }
    );

    res.json({
      name: user.name,
      email: user.email,
      department: user.department,
      assignedYear: user.assignedYear,
      specialization: counselor?.specialization || "General Counseling",
      contactNumber: counselor?.contactNumber || "",
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;