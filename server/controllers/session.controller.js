import Session from "../models/Session.js";

// Book a session
export const bookSession = async (req, res) => {
  try {
    const { counselorId, sessionDate, sessionTime } = req.body;
    const studentId = req.user.id; // from auth middleware

    // Create session
    const session = await Session.create({
      studentId,
      counselorId,
      sessionDate,
      sessionTime,
    });

    res.status(201).json({ message: "Session booked", session });
  } catch (err) {
    console.error("Error booking session:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get student sessions
export const getStudentSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ studentId: req.user.id })
      .populate("counselorId", "name") // match model field
      .sort({ sessionDate: 1 });

    res.json(sessions);
  } catch (err) {
    console.error("Error fetching sessions:", err);
    res.status(500).json({ message: "Server error" });
  }
};