import express from "express";
import CounselorSettings from "../models/CounselorSettings.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

// Get current counselor settings
router.get("/", verifyToken, async (req, res) => {
  try {
    const settings = await CounselorSettings.findOne({ userId: req.user._id });
    res.json(settings || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update counselor settings
router.put("/", verifyToken, async (req, res) => {
  try {
    const updates = req.body;
    const settings = await CounselorSettings.findOneAndUpdate(
      { userId: req.user._id },
      updates,
      { new: true, upsert: true } // create if not exists
    );
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;