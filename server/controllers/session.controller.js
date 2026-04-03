import mongoose from "mongoose";
import Session from "../models/Session.js";
import Counselor from "../models/Counselor.js";
import User from "../models/User.js";
import CounselorSettings from "../models/CounselorSettings.js";
import Notification from "../models/Notification.js";
import { sendEmail } from "../utils/sendEmail.js";
import { io } from "../index.js";

/* ===========================
   BOOK SESSION
=========================== */
export const bookSession = async (req, res) => {
  try {
    const { counselorId, sessionDate, sessionTime } = req.body;
    const studentId = req.user.id;

    // ------------------------
    // Find counselor and populate userId
    let counselor = await Counselor.findById(counselorId).populate("userId");
    if (!counselor) {
      counselor = await Counselor.findOne({ userId: counselorId }).populate("userId");
    }
    if (!counselor) return res.status(404).json({ message: "Counselor not found" });

    // ------------------------
    // Find student
    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    // ------------------------
    // Create session
    const session = await Session.create({
      studentId,
      counselorId: counselor._id,
      sessionDate,
      sessionTime,
      status: "Pending",
      approved: false, // set approved false by default
      counselorName: counselor.userId?.name || counselor.name,
      specialization: counselor.specialization || "",
      reminder24hSent: false,
      reminder1hSent: false,
    });

    // ------------------------
    // Fetch counselor settings
    const counselorSettings = await CounselorSettings.findOne({ userId: counselor.userId._id });

    // ------------------------
    // Notifications to counselor if enabled
    if (counselorSettings?.sessionNotifications?.newSessionScheduled) {
      const notif = await Notification.create({
        userId: counselor.userId._id,
        message: `New session booked by ${student.name}`,
        type: "session",
      });
      io.to(`notification-${counselor.userId._id}`).emit("newNotification", notif);
    }

    // ------------------------
    // Notification to student
    const studentNotif = await Notification.create({
      userId: studentId,
      message: `Session booked successfully with ${counselor.userId?.name || counselor.name}`,
      type: "session",
    });
    io.to(`notification-${studentId}`).emit("newNotification", studentNotif);

    // ------------------------
    // Emails
    if (counselor.userId?.email) {
      await sendEmail(
        counselor.userId.email,
        "New Session Booked",
        `Hello ${counselor.userId.name},\n\n${student.name} has booked a session on ${new Date(sessionDate).toDateString()} at ${sessionTime}.`
      );
    }

    if (student.email) {
      await sendEmail(
        student.email,
        "Session Booked Successfully",
        `Hello ${student.name},\n\nYour session with ${counselor.userId?.name || counselor.name} is booked for ${new Date(sessionDate).toDateString()} at ${sessionTime}.`
      );
    }

    // ------------------------
    // Success response
    res.status(201).json({ message: "Session booked successfully", session });

  } catch (error) {
    console.error("Book session error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===========================
   APPROVE SESSION
=========================== */
export const approveSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate("studentId")
      .populate({ path: "counselorId", populate: { path: "userId" } });

    if (!session) return res.status(404).json({ message: "Session not found" });

    session.status = "Approved";
    session.approved = true; // now reminders will trigger
    await session.save();

    // ------------------------
    // Notify student about approval
    const studentMessage = `Your session with ${session.counselorId.userId?.name || session.counselorName} has been approved.`;
    const studentNotif = await Notification.create({
      userId: session.studentId._id,
      message: studentMessage,
      type: "session"
    });
    io.to(`notification-${session.studentId._id}`).emit("newNotification", studentNotif);

    // ------------------------
    // Notify counselor (optional)
    const counselorMessage = `You have approved the session with ${session.studentId.name}.`;
    const counselorNotif = await Notification.create({
      userId: session.counselorId.userId._id,
      message: counselorMessage,
      type: "session"
    });
    io.to(`notification-${session.counselorId.userId._id}`).emit("newNotification", counselorNotif);

    // ------------------------
    // Emails
    if (session.studentId.email) {
      await sendEmail(session.studentId.email, "Session Approved", studentMessage);
    }
    if (session.counselorId.userId?.email) {
      await sendEmail(session.counselorId.userId.email, "Session Approved", counselorMessage);
    }

    res.json({ message: "Session approved", session });

  } catch (error) {
    console.error("Approve session error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===========================
   CANCEL SESSION
=========================== */
export const cancelSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate("studentId")
      .populate({ path: "counselorId", populate: { path: "userId" } });

    if (!session) return res.status(404).json({ message: "Session not found" });

    session.status = "Cancelled";
    session.approved = false;
    await session.save();

    const sessionDateStr = new Date(session.sessionDate).toDateString();
    const studentMessage = `Your session with ${session.counselorId.userId?.name || session.counselorName} on ${sessionDateStr} at ${session.sessionTime} has been cancelled.`;
    const counselorMessage = `The session with ${session.studentId.name} on ${sessionDateStr} at ${session.sessionTime} has been cancelled.`;

    // Notifications
    const studentNotif = await Notification.create({
      userId: session.studentId._id,
      message: studentMessage,
      type: "session"
    });
    io.to(`notification-${session.studentId._id}`).emit("newNotification", studentNotif);

    const counselorNotif = await Notification.create({
      userId: session.counselorId.userId._id,
      message: counselorMessage,
      type: "session"
    });
    io.to(`notification-${session.counselorId.userId._id}`).emit("newNotification", counselorNotif);

    // Emails
    if (session.studentId.email) {
      await sendEmail(session.studentId.email, "Session Cancelled", studentMessage);
    }
    if (session.counselorId.userId?.email) {
      await sendEmail(session.counselorId.userId.email, "Session Cancelled", counselorMessage);
    }

    res.json({ message: "Session cancelled", session });

  } catch (error) {
    console.error("Cancel session error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===========================
   GET STUDENT SESSIONS
=========================== */
export const getStudentSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ studentId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(sessions);
  } catch (error) {
    console.error("Get student sessions error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===========================
   GET COUNSELOR SESSIONS
=========================== */
export const getCounselorSessions = async (req, res) => {
  try {
    const counselor = await Counselor.findOne({ userId: req.user.id });
    if (!counselor) return res.status(404).json({ message: "Counselor not found" });

    const sessions = await Session.find({ counselorId: counselor._id })
      .populate("studentId", "name email department year")
      .sort({ createdAt: -1 });

    res.json(sessions);
  } catch (error) {
    console.error("Get counselor sessions error:", error);
    res.status(500).json({ message: "Server error" });
  }
};