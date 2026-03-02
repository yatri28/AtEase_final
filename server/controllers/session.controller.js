import Session from "../models/Session.js";
import Counselor from "../models/Counselor.js";

/* ===========================
   BOOK SESSION (Student)
=========================== */
export const bookSession = async (req, res) => {
  try {
    const { counselorId, sessionDate, sessionTime } = req.body;

    const session = await Session.create({
      studentId: req.user.id,
      counselorId,
      sessionDate,
      sessionTime,
      status: "Pending",
    });

    res.status(201).json({ message: "Session booked", session });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===========================
   GET STUDENT SESSIONS
=========================== */
export const getStudentSessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      studentId: req.user.id,
    })
      .populate("counselorId", "name specialization")
      .sort({ createdAt: -1 });

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ===========================
   GET COUNSELOR SESSIONS
=========================== */
export const getCounselorSessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      counselorId: req.user.id,
    })
      .populate("studentId", "name email department year")
      .sort({ createdAt: -1 });

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
/* ===========================
   APPROVE SESSION
=========================== */
export const approveSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    session.status = "Approved";
    await session.save();

    res.json({ message: "Session approved" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ===========================
   CANCEL SESSION
=========================== */
export const cancelSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    session.status = "Cancelled";
    await session.save();

    res.json({ message: "Session cancelled" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};