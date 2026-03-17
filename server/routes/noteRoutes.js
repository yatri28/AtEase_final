import express from "express";
import Note from "../models/Note.js";
import { sendNoteToCounselor } from "../controllers/note.controller.js";
import verifyToken from "../middleware/verifyToken.js";

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

router.post(
  "/send-to-counselor",
  verifyToken,
  sendNoteToCounselor
);

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

// EDIT NOTE
router.put("/:noteId", async (req, res) => {
  try {
    const { text } = req.body;
    const updatedNote = await Note.findByIdAndUpdate(
      req.params.noteId,
      { text },
      { new: true } // return updated document
    );
    if (!updatedNote) return res.status(404).json({ message: "Note not found" });
    res.json(updatedNote);
  } catch (error) {
    console.log("UPDATE NOTE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

// DELETE NOTE
router.delete("/:noteId", async (req, res) => {
  try {
    const deletedNote = await Note.findByIdAndDelete(req.params.noteId);
    if (!deletedNote) return res.status(404).json({ message: "Note not found" });
    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.log("DELETE NOTE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
