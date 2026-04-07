import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import axios from "axios";

export default function CounselorNotes() {
  const [notes, setNotes] = useState(null); // null = loading
  const [error, setError] = useState(null);

  const token = sessionStorage.getItem("token");

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/notes/counselor/all",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("NOTES DATA:", res.data); // 🔍 debug
        setNotes(res.data);
      } catch (err) {
        console.log("ERROR FETCHING NOTES:", err); // 🔍 debug
        setError("Failed to load notes");
        setNotes([]);
      }
    };

    fetchNotes();
  }, [token]);

  return (
    <DashboardLayout role="counselor">
      <h1 className="text-2xl font-bold mb-1">Anonymous Notes</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Notes shared by students (identity hidden if anonymous)
      </p>

      {/* Loading */}
      {notes === null && (
        <p className="text-center text-gray-500 dark:text-gray-400">
          Loading notes...
        </p>
      )}

      {/* Error */}
      {error && (
        <p className="text-center text-red-500">
          {error}
        </p>
      )}

      {/* Notes List */}
      {notes && notes.length === 0 && !error && (
        <p className="text-center text-gray-500 dark:text-gray-400">
          No notes available
        </p>
      )}

      {/* Notes */}
      {notes && notes.length > 0 && (
        <div className="space-y-4">
          {notes.map((note) => (
            <div
              key={note._id}
              className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm"
            >
              {/* Note Text */}
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                {note.text}
              </p>

              {/* Student Info */}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {note.studentName === "Anonymous"
                  ? "👤 Anonymous Student"
                  : `👤 ${note.studentName}`}
              </p>

              {/* Email (only if not anonymous) */}
              {note.studentName !== "Anonymous" && note.email && (
                <p className="text-xs text-gray-400 mt-1">
                  {note.email}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}