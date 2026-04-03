import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
   studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    counselorId: { type: mongoose.Schema.Types.ObjectId, ref: "Counselor", required: true },
    counselorName: { type: String, default: "" },
    specialization: { type: String, default: "" },
    sessionDate: { type: Date, required: true },
    sessionTime: { type: String, required: true },
    status: { type: String, enum: ["Pending", "Approved", "Cancelled"], default: "Pending" },
    approved: { type: Boolean, default: false },
    reminder24hSent: { type: Boolean, default: false },
    reminder1hSent: { type: Boolean, default: false },
    counselorName: String,
    specialization: String,
  },
  { timestamps: true }
);

export default mongoose.model("Session", sessionSchema);