import express from "express";
import Mood from "../models/Mood.js";

const router = express.Router();

router.get("/student-mood-clusters", async (req, res) => {
  try {
    const month = parseInt(req.query.month);
    const year = parseInt(req.query.year);

    if (isNaN(month) || isNaN(year)) {
      return res.status(400).json({ error: "Month and year required" });
    }

    const startDate = new Date(Date.UTC(year, month, 1));
    const endDate = new Date(Date.UTC(year, month + 1, 1));

    const aggregation = await Mood.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lt: endDate }
        }
      },
      {
        $addFields: {
          moodScore: {
            $switch: {
              branches: [
                { case: { $eq: ["$moodType", "Happy"] }, then: 5 },
                { case: { $eq: ["$moodType", "Calm"] }, then: 4 },
                { case: { $eq: ["$moodType", "Neutral"] }, then: 3 },
                { case: { $eq: ["$moodType", "Sad"] }, then: 2 },
                { case: { $eq: ["$moodType", "Stressed"] }, then: 1 }
              ],
              default: 3
            }
          }
        }
      },
      {
        $group: {
          _id: "$user",
          avgMood: { $avg: "$moodScore" }
        }
      },
      {
        $addFields: {
          dominantMood: {
            $toInt: { $add: ["$avgMood", 0.5] }
          }
        }
      },
      {
        $group: {
          _id: "$dominantMood",
          students: { $push: "$_id" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const scatterData = [];
    const summary = {
      stressed: 0,
      sad: 0,
      neutral: 0,
      calm: 0,
      happy: 0
    };

    aggregation.forEach(cluster => {
      const moodScore = cluster._id;
      const count = cluster.count;

      cluster.students.forEach(studentId => {
        scatterData.push({
          x: Math.random() * 6 - 3,
          y: moodScore,
          studentId
        });
      });

      if (moodScore === 1) summary.stressed = count;
      if (moodScore === 2) summary.sad = count;
      if (moodScore === 3) summary.neutral = count;
      if (moodScore === 4) summary.calm = count;
      if (moodScore === 5) summary.happy = count;
    });

    const totalStudents = scatterData.length;

    // ✅ PROFESSIONAL FACULTY ANALYSIS
    const wellbeingIndex =
      totalStudents === 0
        ? 0
        : (
            (summary.happy * 5 +
              summary.calm * 4 +
              summary.neutral * 3 +
              summary.sad * 2 +
              summary.stressed * 1) /
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

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;