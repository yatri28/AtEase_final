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

    year: { type: String },
    department: { type: String },
    counselor: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);