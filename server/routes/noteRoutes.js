import express from "express";
import Note from "../models/Note.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { studentId, text } = req.body;

    const newNote = await Note.create({
      studentId,
      text,
    });

    res.status(201).json(newNote);
  } catch (error) {
  console.log("SAVE NOTE ERROR:", error);
  res.status(500).json({ message: error.message });
}
});

router.get("/:studentId", async (req, res) => {
  try {
    const notes = await Note.find({
      studentId: req.params.studentId,
    }).sort({ createdAt: -1 });

    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notes" });
  }
});

export default router;
