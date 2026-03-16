import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",   
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    sentToCounselor: {
      type: Boolean,
      default: false
    },
    anonymous: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model("Note", noteSchema);
