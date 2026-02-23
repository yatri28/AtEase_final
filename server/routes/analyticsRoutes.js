import express from "express";
import Mood from "../models/Mood.js";

const router = express.Router();

/*
GET /api/analytics/mood-distribution?month=0&year=2026
*/

router.get("/mood-distribution", async (req, res) => {
  try {
    const month = parseInt(req.query.month);
    const year = parseInt(req.query.year);

    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 1);

    const result = await Mood.aggregate([
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
          _id: "$moodScore",
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const total = result.reduce((sum, item) => sum + item.count, 0);

    let stressed = result.find(r => r._id === 1)?.count || 0;
    let sad = result.find(r => r._id === 2)?.count || 0;

    let riskLevel = "Low Risk";
    if ((stressed + sad) / total > 0.4) {
      riskLevel = "High Risk";
    } else if ((stressed + sad) / total > 0.2) {
      riskLevel = "Moderate Risk";
    }

    res.json({
      distribution: result.map(item => ({
        moodScore: item._id,
        count: item.count
      })),
      totalStudents: total,
      riskLevel
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;