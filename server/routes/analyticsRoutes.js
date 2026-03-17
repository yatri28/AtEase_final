import express from "express";
import Mood from "../models/Mood.js";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/student-mood-clusters", protect, async (req, res) => {
  try {
    const month = parseInt(req.query.month);
    const year = parseInt(req.query.year);

    if (isNaN(month) || isNaN(year)) {
      return res.status(400).json({ message: "Month and year required" });
    }

    /* =========================
       GET COUNSELOR
    ========================= */

    const counselor = await User.findById(req.user.id);

    if (!counselor || counselor.role !== "counselor") {
      return res.status(403).json({ message: "Not authorized" });
    }

    /* =========================
       FIND ASSIGNED STUDENTS
    ========================= */

    const students = await User.find({
      role: "student",
      department: counselor.department,
      year: counselor.assignedYear,
    });

    const studentIds = students.map((s) => s._id);

    if (studentIds.length === 0) {
      return res.json({
        scatterData: [],
        summary: {},
        totalStudents: 0,
        facultyInsights: {}
      });
    }

    /* =========================
       DATE RANGE
    ========================= */

    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 1);

    /* =========================
       FETCH MOODS
    ========================= */

    const moods = await Mood.find({
      user: { $in: studentIds },
      date: { $gte: startDate, $lt: endDate }
    });

    if (moods.length === 0) {
      return res.json({
        scatterData: [],
        summary: {},
        totalStudents: 0,
        facultyInsights: {}
      });
    }

    /* =========================
       MOOD SCORE MAP
    ========================= */

    const moodScore = {
      Happy: 5,
      Calm: 4,
      Neutral: 3,
      Sad: 2,
      Stressed: 1
    };

    /* =========================
       GROUP MOODS PER STUDENT
    ========================= */

    const studentMoodMap = {};

    moods.forEach((m) => {
      const score = moodScore[m.moodType] || 3;

      if (!studentMoodMap[m.user]) {
        studentMoodMap[m.user] = [];
      }

      studentMoodMap[m.user].push(score);
    });

    /* =========================
       CALCULATE AVERAGE
    ========================= */

    const scatterData = [];
    const summary = {
      stressed: 0,
      sad: 0,
      neutral: 0,
      calm: 0,
      happy: 0
    };

    Object.keys(studentMoodMap).forEach((studentId) => {
      const scores = studentMoodMap[studentId];

      const avg =
        scores.reduce((a, b) => a + b, 0) / scores.length;

      const mood = Math.round(avg);

      scatterData.push({
        x: Math.random() * 6 - 3,
        y: mood,
        studentId
      });

      if (mood === 1) summary.stressed++;
      if (mood === 2) summary.sad++;
      if (mood === 3) summary.neutral++;
      if (mood === 4) summary.calm++;
      if (mood === 5) summary.happy++;
    });

    const totalStudents = scatterData.length;

    /* =========================
       FACULTY INSIGHTS
    ========================= */

    const wellbeingIndex =
      totalStudents === 0
        ? 0
        : (
            (summary.happy * 5 +
              summary.calm * 4 +
              summary.neutral * 3 +
              summary.sad * 2 +
              summary.stressed) /
            totalStudents
          ).toFixed(2);

    const concernStudents = summary.sad + summary.stressed;

    const concernPercentage =
      totalStudents === 0
        ? 0
        : ((concernStudents / totalStudents) * 100).toFixed(1);

    const positiveStudents = summary.happy + summary.calm;

    const positivePercentage =
      totalStudents === 0
        ? 0
        : ((positiveStudents / totalStudents) * 100).toFixed(1);

    res.json({
      scatterData,
      summary,
      totalStudents,
      facultyInsights: {
        wellbeingIndex,
        concernStudents,
        concernPercentage,
        positiveStudents,
        positivePercentage
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;