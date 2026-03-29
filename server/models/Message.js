import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    // INDEPENDENT BOOKMARKS
    isBookmarkedByStudent: { 
      type: Boolean, 
      default: false 
    },
    isBookmarkedByCounselor: { 
      type: Boolean, 
      default: false 
    },
    // INDEPENDENT DELETION (Soft Delete)
    isDeletedByStudent: { 
      type: Boolean, 
      default: false 
    },
    isDeletedByCounselor: { 
      type: Boolean, 
      default: false 
    }
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);