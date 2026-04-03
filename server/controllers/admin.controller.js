import User from "../models/User.js";
import Mood from "../models/Mood.js";
import Session from "../models/Session.js";
import Note from "../models/Note.js";
import bcrypt from "bcryptjs";
import { Parser } from "json2csv";

// ─────────────────────────────────────────────────────────────────────────────
// PLATFORM STATS  (admin dashboard)
// ─────────────────────────────────────────────────────────────────────────────
export const getPlatformStats = async (req, res) => {
  try {
    const [totalStudents, totalCounselors, totalSessions, pendingSessions, moodData] =
      await Promise.all([
        User.countDocuments({ role: "student" }),
        User.countDocuments({ role: "counselor" }),
        Session.countDocuments(),
        Session.countDocuments({ status: "pending" }),
        Mood.aggregate([
          {
            $addFields: {
              moodScore: {
                $switch: {
                  branches: [
                    { case: { $eq: ["$moodType", "Happy"]   }, then: 5 },
                    { case: { $eq: ["$moodType", "Calm"]    }, then: 4 },
                    { case: { $eq: ["$moodType", "Neutral"] }, then: 3 },
                    { case: { $eq: ["$moodType", "Sad"]     }, then: 2 },
                    { case: { $eq: ["$moodType", "Stressed"]}, then: 1 },
                  ],
                  default: 3,
                },
              },
            },
          },
          { $group: { _id: null, avg: { $avg: "$moodScore" }, total: { $sum: 1 } } },
        ]),
      ]);

    const wellbeingIndex = moodData[0]?.avg?.toFixed(2) ?? null;

    // Sessions trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    res.json({
      totalStudents,
      totalCounselors,
      totalSessions,
      pendingSessions,
      wellbeingIndex,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// MOOD SUMMARY  (pie chart on admin dashboard)
// ─────────────────────────────────────────────────────────────────────────────
export const getMoodSummary = async (req, res) => {
  try {
    const data = await Mood.aggregate([
      { $group: { _id: { $toLower: "$moodType" }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// SESSION TREND  (bar chart on admin dashboard)
// ─────────────────────────────────────────────────────────────────────────────
export const getSessionTrend = async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const data = await Session.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      {
        $project: {
          _id: 0,
          month: {
            $arrayElemAt: [
              ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
              "$_id.month",
            ],
          },
          count: 1,
        },
      },
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// USER CRUD
// ─────────────────────────────────────────────────────────────────────────────
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, department, year } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already in use." });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role, department, year });
    res.status(201).json({ message: "User created", user: { ...user.toObject(), password: undefined } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { name, email, password, role, department, year } = req.body;
    const update = { name, email, role, department, year };
    if (password) update.password = await bcrypt.hash(password, 10);

    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ message: "User updated", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ message: "User deleted." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ANALYTICS
// ─────────────────────────────────────────────────────────────────────────────
export const getMoodByMonth = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const data = await Mood.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(year, 0, 1),
            $lt: new Date(year + 1, 0, 1),
          },
        },
      },
      { $group: { _id: { $month: "$date" }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, month: "$_id", count: 1 } },
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMoodDistribution = async (req, res) => {
  try {
    const data = await Mood.aggregate([
      { $group: { _id: { $toLower: "$moodType" }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getSessionStats = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const data = await Session.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(year, 0, 1),
            $lt: new Date(year + 1, 0, 1),
          },
        },
      },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getDepartmentBreakdown = async (req, res) => {
  try {
    const data = await User.aggregate([
      { $match: { role: "student", department: { $exists: true, $ne: "" } } },
      { $group: { _id: "$department", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// REPORTS (CSV download)
// ─────────────────────────────────────────────────────────────────────────────
const dateFilter = (query) => {
  const filter = {};
  if (query.startDate || query.endDate) {
    filter.createdAt = {};
    if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
    if (query.endDate)   filter.createdAt.$lte = new Date(query.endDate);
  }
  return filter;
};

export const downloadReport = async (req, res) => {
  const { type } = req.params;
  const { startDate, endDate, role } = req.query;

  try {
    let data = [];
    let fields = [];

    if (type === "users") {
      const filter = dateFilter({ startDate, endDate });
      if (role && role !== "all") filter.role = role;
      const users = await User.find(filter).select("-password").lean();
      fields = ["_id", "name", "email", "role", "department", "year", "assignedYear", "createdAt"];
      data = users;
    } else if (type === "moods") {
      const filter = {};
      if (startDate || endDate) {
        filter.date = {};
        if (startDate) filter.date.$gte = new Date(startDate);
        if (endDate)   filter.date.$lte = new Date(endDate);
      }
      const moods = await Mood.find(filter).lean();
      fields = ["_id", "user", "moodType", "note", "date"];
      data = moods;
    } else if (type === "sessions") {
      const filter = dateFilter({ startDate, endDate });
      const sessions = await Session.find(filter)
        .populate("student", "name email")
        .populate("counselor", "name email")
        .lean();
      data = sessions.map((s) => ({
        id: s._id,
        studentName: s.student?.name || "",
        studentEmail: s.student?.email || "",
        counselorName: s.counselor?.name || "",
        counselorEmail: s.counselor?.email || "",
        date: s.date,
        status: s.status,
        reason: s.reason || "",
        createdAt: s.createdAt,
      }));
      fields = ["id","studentName","studentEmail","counselorName","counselorEmail","date","status","reason","createdAt"];
    } else if (type === "notes") {
      const filter = dateFilter({ startDate, endDate });
      const notes = await Note.find(filter).lean();
      // Anonymised — no student identity
      data = notes.map((n) => ({ id: n._id, content: n.content, createdAt: n.createdAt }));
      fields = ["id", "content", "createdAt"];
    } else {
      return res.status(400).json({ message: "Invalid report type." });
    }

    const parser = new Parser({ fields });
    const csv = parser.parse(data);

    res.header("Content-Type", "text/csv");
    res.attachment(`atease_${type}_report.csv`);
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
