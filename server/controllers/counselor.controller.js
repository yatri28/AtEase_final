import Counselor from "../models/Counselor.js";
import User from "../models/User.js";

/* =========================
   GET ALL COUNSELORS
========================= */
export const getAllCounselors = async (req, res) => {
  try {
    // Fetch counselors and populate the linked userId
    const counselors = await Counselor.find()
      .populate("userId", "name email") // <-- important!
      .sort({ createdAt: -1 });

    res.json(counselors);
  } catch (error) {
    console.error("Error fetching counselors:", error);
    res.status(500).json({ message: "Server error" });
  }
};