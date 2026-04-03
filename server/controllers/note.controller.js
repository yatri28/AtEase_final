import Note from "../models/Note.js";
import Settings from "../models/Settings.js";
import User from "../models/User.js";

export const sendNoteToCounselor = async (req, res) => {
  try {
    const { noteId, anonymous } = req.body;

    const student = await User.findById(req.user.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const note = await Note.findByIdAndUpdate(
      noteId,
      { sentToCounselor: true, anonymous: anonymous ?? false },
      { returnDocument: "after" }
    );

    if (!note) return res.status(404).json({ message: "Note not found" });

    const counselor = await User.findOne({
      role: "counselor",
      department: student.department,
      assignedYear: student.year,
    });

    if (counselor) {
      const settings = await Settings.findOne({ userId: counselor._id });

      if (settings?.anonymousNotes) {
        await Notification.create({
          userId: counselor._id,
          message: "📩 New student note received",
        });
      }
    }

    res.json(note);
  } catch (error) {
    console.log("SEND NOTE ERROR:", error);
    res.status(500).json({ message: "Failed to send note" });
  }
};