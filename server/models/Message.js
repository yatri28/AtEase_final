import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Counselor",
    },
    content: String,
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
