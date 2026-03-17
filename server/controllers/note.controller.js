import Note from "../models/Note.js";

export const sendNoteToCounselor = async (req, res) => {
  try {
    const { noteId, anonymous } = req.body;

    const note = await Note.findByIdAndUpdate(
      noteId,
      {
        sentToCounselor: true,
        anonymous: anonymous ?? false,
      },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json(note);
  } catch (error) {
    console.log("SEND NOTE ERROR:", error);
    res.status(500).json({ message: "Failed to send note" });
  }
};