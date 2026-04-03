import Settings from "../models/Settings.js";

export const saveSettings = async (req, res) => {
  try {
    const userId = req.user._id; // ✅ FIXED

    const settings = await Settings.findOneAndUpdate(
      { userId },
      {
        userId,        // ✅ IMPORTANT (ensure it is saved)
        ...req.body,
      },
      { returnDocument: "after", upsert: true } // ✅ FIXED
    );

    res.json(settings);
  } catch (error) {
    console.log("SAVE SETTINGS ERROR:", error);
    res.status(500).json({ message: "Failed to save settings" });
  }
};

export const getSettings = async (req, res) => {
  try {
    const userId = req.user._id; // ✅ FIXED

    const settings = await Settings.findOne({ userId });

    res.json(settings);
  } catch (error) {
    console.log("GET SETTINGS ERROR:", error);
    res.status(500).json({ message: "Failed to load settings" });
  }
};