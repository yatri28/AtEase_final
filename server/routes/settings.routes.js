import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import Settings from "../models/Settings.js";

const router = express.Router();

/* SAVE SETTINGS */
router.post("/", verifyToken, async (req, res) => {
  try {
    const settings = await Settings.findOneAndUpdate(
      { userId: req.user.id },
      {
        userId: req.user.id,   // ⭐ important fix
        ...req.body,
      },
      { new: true, upsert: true }
    );

    res.json(settings);
  } catch (error) {
    console.log("SAVE SETTINGS ERROR:", error);
    res.status(500).json({ message: "Error saving settings" });
  }
});

/* GET SETTINGS */
router.get("/", verifyToken, async (req, res) => {
  try {
    const settings = await Settings.findOne({ userId: req.user.id });
    res.json(settings);
  } catch (error) {
    console.log("FETCH SETTINGS ERROR:", error);
    res.status(500).json({ message: "Error fetching settings" });
  }
});

export default router;