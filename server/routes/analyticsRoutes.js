import express from "express";
import Mood from "../models/Mood.js";

const router = express.Router();

/*
GET /api/analytics/all-students?month=0&year=2026
*/

router.get("/all-students", async (req, res) => {
  try {
    const month = parseInt(req.query.month);
    const year = parseInt(req.query.year);

    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 1);

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
                { case: { $eq: ["$moodType", "happy"] }, then: 5 },
                { case: { $eq: ["$moodType", "calm"] }, then: 4 },
                { case: { $eq: ["$moodType", "neutral"] }, then: 3 },
                { case: { $eq: ["$moodType", "sad"] }, then: 2 },
                { case: { $eq: ["$moodType", "stressed"] }, then: 1 }
              ],
              default: 3
            }
          }
        }
      },
      {
        $group: {
          _id: { $dayOfMonth: "$date" },
          dailyAverage: { $avg: "$moodScore" },
          totalEntries: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const overall = await Mood.aggregate([
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
                { case: { $eq: ["$moodType", "happy"] }, then: 5 },
                { case: { $eq: ["$moodType", "calm"] }, then: 4 },
                { case: { $eq: ["$moodType", "neutral"] }, then: 3 },
                { case: { $eq: ["$moodType", "sad"] }, then: 2 },
                { case: { $eq: ["$moodType", "stressed"] }, then: 1 }
              ],
              default: 3
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          overallAverage: { $avg: "$moodScore" },
          totalEntries: { $sum: 1 }
        }
      }
    ]);

    let riskLevel = "Low Risk";
    let insight = "Students are emotionally stable overall.";

    if (overall.length && overall[0].overallAverage < 3) {
      riskLevel = "High Risk";
      insight =
        "Overall mood across students is low. Counselor attention recommended.";
    }

    res.json({
      dailyData: aggregation.map(item => ({
        day: item._id,
        averageMood: Number(item.dailyAverage.toFixed(2)),
        totalEntries: item.totalEntries
      })),
      overallAverage: overall.length
        ? Number(overall[0].overallAverage.toFixed(2))
        : 0,
      totalEntries: overall.length ? overall[0].totalEntries : 0,
      riskLevel,
      insight
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;