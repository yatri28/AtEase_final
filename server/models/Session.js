import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    counselorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sessionDate: {
      type: Date,
      required: true,
    },
    sessionTime: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Cancelled", "Completed"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Session", sessionSchema);