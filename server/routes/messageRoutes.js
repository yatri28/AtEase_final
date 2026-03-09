import express from "express";
import Message from "../models/Message.js";

const router = express.Router();

// =======================
// Send Message
// =======================
router.post("/", async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;

    if (!senderId || !receiverId || !content) {
      return res.status(400).json({ error: "All fields required" });
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      content,
    });

    await newMessage.save();

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Message Save Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// =======================
// Get ALL messages of logged-in student
// =======================
router.get("/student/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: studentId },
        { receiverId: studentId }
      ],
    }).sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    console.error("Fetch Student Messages Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// =======================
// Get conversation between student & counselor
// =======================
router.get("/:studentId/:counselorId", async (req, res) => {
  try {
    const { studentId, counselorId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: studentId, receiverId: counselorId },
        { senderId: counselorId, receiverId: studentId },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error("Conversation Fetch Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;