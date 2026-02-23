import express from "express";
import Message from "../models/Message.js";

const router = express.Router();

// Send message
router.post("/", async (req, res) => {
  const { senderId, receiverId, content } = req.body;

  const newMessage = new Message({
    senderId,
    receiverId,
    content,
  });

  await newMessage.save();
  res.json({ message: "Message sent" });
});

// Get messages between student and counselor
router.get("/:studentId/:counselorId", async (req, res) => {
  const { studentId, counselorId } = req.params;

  const messages = await Message.find({
    $or: [
      { senderId: studentId, receiverId: counselorId },
      { senderId: counselorId, receiverId: studentId },
    ],
  }).sort({ createdAt: 1 });

  res.json(messages);
});

export default router;
