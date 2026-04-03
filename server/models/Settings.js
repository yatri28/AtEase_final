import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  sessionReminder: { 
    type: Boolean, 
    default: false 
  },
  emailReminder: { 
    type: Boolean, 
    default: false 
  },
  anonymousNotes: { 
    type: Boolean, 
    default: false 
  }, 
  reminderTime: { 
    type: Number, 
    default: 60 
  } 

});

export default mongoose.model("Settings", settingsSchema);