import express from "express";
import { protect } from "../middleware/auth.js";
import Settings from "../models/Settings.js";

const router = express.Router();

/* SAVE SETTINGS */
router.post("/", protect, async (req, res) => {
  try {
    const { emailReminder, sessionReminder, anonymousNotes } = req.body;

    const settings = await Settings.findOneAndUpdate(
      { userId: req.user._id },
      {
        userId: req.user._id,

        ...(emailReminder !== undefined && { emailReminder }),
        ...(sessionReminder !== undefined && { sessionReminder }),
        ...(anonymousNotes !== undefined && { anonymousNotes }),
      },
      { returnDocument: "after", upsert: true } // ✅ better option
    );

    res.json(settings);
  } catch (error) {
    console.log("SAVE SETTINGS ERROR:", error);
    res.status(500).json({ message: "Error saving settings" });
  }
});

/* GET SETTINGS */
router.get("/", protect, async (req, res) => {
  try {
    let settings = await Settings.findOne({ userId: req.user._id });

    if (!settings) {
      settings = await Settings.create({ userId: req.user._id });
    }

    res.json(settings);
  } catch (error) {
    console.log("FETCH SETTINGS ERROR:", error);
    res.status(500).json({ message: "Error fetching settings" });
  }
});

router.put("/toggle-reminder", protect, async (req, res) => {
  let settings = await Settings.findOne({ userId: req.user._id });

  if (!settings) {
    settings = await Settings.create({ userId: req.user._id });
  }

  settings.sessionReminder = !settings.sessionReminder;
  await settings.save();

  res.json(settings);
});

router.put("/toggle-email-reminder", protect, async (req, res) => {
  let settings = await Settings.findOne({ userId: req.user._id });

  if (!settings) {
    settings = await Settings.create({ userId: req.user._id });
  }

  settings.emailReminder = !settings.emailReminder;
  await settings.save();

  res.json(settings);
});
export default router;