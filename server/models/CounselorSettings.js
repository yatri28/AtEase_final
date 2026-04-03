import mongoose from "mongoose";

const counselorSettingsSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    sessionNotifications: {
      newSessionScheduled: { type: Boolean, default: true }, // Notify when a student books
      sessionReminders: { type: Boolean, default: true },    // Reminders before own sessions
    },

    studentActivity: {
      studentMessages: { type: Boolean, default: true },   // Notify on messages
      emailNotifications: { type: Boolean, default: false }, // Email notifications
    },

    doNotDisturb: {
      enabled: { type: Boolean, default: false },
      start: { type: String, default: "22:00" }, // FIXED
      end: { type: String, default: "07:00" },   // FIXED
    },
  },
  { timestamps: true }
);

const CounselorSettings = mongoose.model("CounselorSettings", counselorSettingsSchema);
export default CounselorSettings;