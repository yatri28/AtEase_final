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
year: { type: Number },          // for students
assignedYear: { type: Number }   // for counselors
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);