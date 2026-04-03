import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["student", "counselor", "admin"],
      default: "student"
    },

    department: { type: String },
    year: { type: Number },
    assignedYear: { type: Number },

    // ✅ ADD THIS
    settings: {
      emailNotifications: { type: Boolean, default: true },
      sessionReminders: { type: Boolean, default: true },
      anonymousNotes: { type: Boolean, default: false },
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);