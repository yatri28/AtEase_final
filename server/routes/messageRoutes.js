import express from "express";
import Message from "../models/Message.js";
import User from "../models/User.js";

const router = express.Router();

// =======================
// Send Message (No changes needed here)
// =======================
router.post("/", async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;
    const newMessage = new Message({ senderId, receiverId, content });
    await newMessage.save();
    const populatedMessage = await Message.findById(newMessage._id)
      .populate("senderId", "name department year")
      .populate("receiverId", "name department year");
    res.status(201).json(populatedMessage);
  } catch (error) { res.status(500).json({ error: "Server error" }); }
});

// =======================
// Counselor Inbox (Updated to filter out deleted)
// =======================
router.get("/counselor-inbox/:counselorId", async (req, res) => {
  try {
    const { counselorId } = req.params;
    const { bookmarked } = req.query;
    const counselor = await User.findById(counselorId);

    // 1. Only fetch messages NOT deleted by counselor
    let query = {
      $or: [{ receiverId: counselorId }, { senderId: counselorId }],
      isDeletedByCounselor: false 
    };

    if (bookmarked === 'true') query.isBookmarkedByCounselor = true;

    const messages = await Message.find(query)
      .populate("senderId", "name department year email")
      .populate("receiverId", "name department year email")
      .sort({ createdAt: -1 });

    const filteredMessages = messages.filter(msg => {
      const student = msg.senderId._id.toString() === counselorId ? msg.receiverId : msg.senderId;
      return (
        student && student.department === counselor.department &&
        (student.year === counselor.assignedYear || student.assignedYear === counselor.assignedYear)
      );
    });

    res.json(filteredMessages);
  } catch (error) { res.status(500).json({ error: "Server error" }); }
});

// =======================
// Toggle Bookmark (Fixed for Privacy)
// =======================
router.patch("/:id/bookmark", async (req, res) => {
  try {
    const { role } = req.query; // Expecting ?role=student or ?role=counselor
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ error: "Message not found" });

    if (role === 'student') {
      message.isBookmarkedByStudent = !message.isBookmarkedByStudent;
    } else {
      message.isBookmarkedByCounselor = !message.isBookmarkedByCounselor;
    }

    await message.save();
    res.json(message);
  } catch (error) { res.status(500).json({ error: "Server error" }); }
});

// =======================
// Soft Delete (Fixed for Privacy)
// =======================
router.delete("/:id", async (req, res) => {
  try {
    const { role } = req.query; // Expecting ?role=student or ?role=counselor
    const updateField = role === 'student' 
      ? { isDeletedByStudent: true } 
      : { isDeletedByCounselor: true };

    const updated = await Message.findByIdAndUpdate(req.params.id, updateField, { new: true });
    
    // Optional: If BOTH deleted it, you could actually remove it from DB
    if (updated.isDeletedByStudent && updated.isDeletedByCounselor) {
        await Message.findByIdAndDelete(req.params.id);
    }

    res.json({ message: "Removed from your view" });
  } catch (error) { res.status(500).json({ error: "Server error" }); }
});

// =======================
// Student Inbox (Updated with new flags)
// =======================
router.get("/student/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    const { bookmarked } = req.query;

    let query = {
      $or: [{ senderId: studentId }, { receiverId: studentId }],
      isDeletedByStudent: false // Don't show messages student "deleted"
    };

    if (bookmarked === 'true') {
      query.isBookmarkedByStudent = true;
    }

    const messages = await Message.find(query)
      .populate("senderId", "name department year email role")
      .populate("receiverId", "name department year email role")
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) { res.status(500).json({ error: "Server error" }); }
});

export default router;