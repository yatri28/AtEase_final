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
  res.json(newMessage); // return saved message
});

// Get ALL messages of logged-in student
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
    res.status(500).json({ error: "Server error" });
  }
});

// Get conversation between student & counselor
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