import Settings from "../models/Settings.js";

export const saveSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const settingsData = req.body;

    const settings = await Settings.findOneAndUpdate(
      { userId },
      { ...settingsData },
      { upsert: true, new: true }
    );

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Failed to save settings" });
  }
};

export const getSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const settings = await Settings.findOne({ userId });
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Failed to load settings" });
  }
};