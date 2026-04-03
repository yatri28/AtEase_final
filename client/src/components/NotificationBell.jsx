import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { Bell } from "lucide-react"; // Professional bell icon

const socket = io("http://localhost:5000", { withCredentials: true });

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const audioRef = useRef(null);
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  // Unlock sound after first user interaction
  const handleUserInteraction = () => {
    audioRef.current?.play().catch(() => {});
  };

  useEffect(() => {
    window.addEventListener("click", handleUserInteraction, { once: true });
    return () => window.removeEventListener("click", handleUserInteraction);
  }, []);

  // Join socket room & listen for notifications
  useEffect(() => {
    if (!userId) return;

    socket.emit("joinRoom", userId);

    const handleNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setToast(notification.message);
      audioRef.current?.play().catch(() => {}); // Play sound
      setTimeout(() => setToast(null), 4000);
    };

    socket.on("newNotification", handleNotification);

    return () => socket.off("newNotification", handleNotification);
  }, [userId]);

  // Fetch existing notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!token) return;
      try {
        const res = await axios.get("http://localhost:5000/api/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (Array.isArray(res.data)) setNotifications(res.data);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };
    fetchNotifications();
  }, [token]);

  // Mark a notification as read
  const markAsRead = async (id) => {
    if (!token) return;
    try {
      await axios.put(
        `http://localhost:5000/api/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setOpen(false); // Close dropdown when clicked
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full hover:bg-gray-200 transition-colors duration-200 focus:outline-none"
      >
        <Bell className="w-6 h-6 text-gray-700" />
        {notifications.some((n) => !n.isRead) && (
          <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full" />
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-white shadow-xl rounded-lg overflow-hidden z-50 animate-fade-in">
          <div className="flex justify-between items-center px-4 py-2 border-b">
            <h4 className="font-semibold text-gray-800">Notifications</h4>
            {notifications.length > 0 && (
              <button
                className="text-sm text-red-500 hover:text-red-600 transition-colors"
                onClick={async () => {
                  try {
                    await axios.delete("http://localhost:5000/api/notifications/clear", {
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    setNotifications([]);
                  } catch (err) {
                    console.error(err);
                  }
                }}
              >
                Clear All
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-500 px-4 py-3">No notifications</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`px-4 py-3 border-b cursor-pointer transition-colors duration-150 rounded hover:bg-gray-100 ${
                    n.isRead ? "bg-white" : "bg-teal-50"
                  }`}
                  onClick={() => markAsRead(n._id)}
                >
                  <p className="text-sm text-gray-800">{n.message}</p>
                  <span className="text-xs text-gray-400">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 bg-teal-50 border-l-4 border-teal-500 p-3 rounded shadow-lg z-50 animate-slide-in-right">
          <p className="text-sm text-gray-800">{toast}</p>
        </div>
      )}

      <audio ref={audioRef} src="/notification-sound.wav" preload="auto" />
    </div>
  );
}