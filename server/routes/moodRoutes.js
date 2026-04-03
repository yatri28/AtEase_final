import express from "express";
import Mood from "../models/Mood.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

/* ================= CREATE MOOD ================= */

router.post("/add", verifyToken, async (req, res) => {
  try {
    const { moodType, remarks } = req.body;

    const mood = new Mood({
      user: req.user.id,
      moodType,
      remarks,
    });

    const savedMood = await mood.save();

    res.status(201).json(savedMood);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= UPDATE MOOD ================= */

router.put("/update/:id", verifyToken, async (req, res) => {
  try {
    const mood = await Mood.findById(req.params.id);

    if (!mood)
      return res.status(404).json({ message: "Mood not found" });

    // 🔥 Security Check
    if (mood.user.toString() !== req.user.id)
      return res.status(401).json({ message: "Not authorized" });

    mood.moodType = req.body.moodType;
    mood.remarks = req.body.remarks || mood.remarks;

    const updatedMood = await mood.save();

    res.json(updatedMood);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= DELETE MOOD ================= */

router.delete("/delete/:id", verifyToken, async (req, res) => {
  try {
    const mood = await Mood.findById(req.params.id);

    if (!mood)
      return res.status(404).json({ message: "Mood not found" });

    if (mood.user.toString() !== req.user.id)
      return res.status(401).json({ message: "Not authorized" });

    await mood.deleteOne();

    res.json({ message: "Mood deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= GET MONTHLY MOODS ================= */

router.get("/monthly", verifyToken, async (req, res) => {
  try {
    const { month, year } = req.query;

    // fallback to current if not provided
    const now = new Date();
    const selectedMonth = month ? Number(month) : now.getMonth();
    const selectedYear = year ? Number(year) : now.getFullYear();

    const start = new Date(selectedYear, selectedMonth, 1);
    const end = new Date(selectedYear, selectedMonth + 1, 1);

    const moods = await Mood.find({
      user: req.user.id,
      createdAt: { $gte: start, $lt: end },
    }).sort({ createdAt: 1 });

    res.json(moods);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
export default router;
