import express from "express";
import Notification from "../models/Notification.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

// Get all notifications for logged-in user
router.get("/", verifyToken, async (req, res) => {
  try {
    console.log("Fetching for user:", req.user._id); // 🔍 DEBUG

    const notifications = await Notification.find({
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    console.log("Notifications found:", notifications.length); // 🔍 DEBUG

    console.log("Logged-in user ID:", req.user._id.toString());

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: "Error fetching notifications" });
  }
});

// Mark notification as read
router.put("/:id/read", verifyToken, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) return res.status(404).json({ message: "Notification not found" });

    if (!req.user || !req.user._id)
      return res.status(401).json({ message: "Unauthorized" });

    if (notification.userId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Forbidden: Cannot mark others' notifications" });

   notification.isRead = true;  
    await notification.save();

    res.json(notification);
  } catch (err) {
    console.error("Error updating notification:", err);
    res.status(500).json({ message: "Server error updating notification" });
  }
});

// DELETE all notifications for logged-in user
router.delete("/clear", verifyToken, async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.user._id });
    res.json({ message: "All notifications cleared" });
  } catch (err) {
    console.error("Error clearing notifications:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;