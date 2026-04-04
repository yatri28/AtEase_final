import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["student", "counselor", "admin"],
      default: "student",
    },

    department: { type: String },
    year: { type: Number },
    assignedYear: { type: Number },

    settings: {
      emailNotifications: { type: Boolean, default: true },
      sessionReminders: { type: Boolean, default: true },
      anonymousNotes: { type: Boolean, default: false },

      // 🔥 Admin controls
      adminNotifications: {
        sessionActivity: { type: Boolean, default: true },
        messages: { type: Boolean, default: true },
        notes: { type: Boolean, default: true },
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);