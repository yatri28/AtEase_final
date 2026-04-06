import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";

export default function CounselorSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null); // tracks which session is being updated

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/sessions/counselor", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSessions(data);
    } catch (err) {
      console.error("Error fetching sessions", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, action) => {
    setUpdating(id); // show loading on this specific card

    // ✅ Optimistic update — immediately reflect the change in UI
    const newStatus = action === "approve" ? "Approved" : "Cancelled";
    setSessions((prev) =>
      prev.map((s) => (s._id === id ? { ...s, status: newStatus } : s))
    );

    try {
      await fetch(`http://localhost:5000/api/sessions/${action}/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      // ✅ Re-fetch to sync with server (in case of any side effects)
      await fetchSessions();
    } catch (err) {
      console.error("Error updating session", err);
      // Revert optimistic update on failure
      await fetchSessions();
    } finally {
      setUpdating(null);
    }
  };

  return (
    <DashboardLayout role="counselor">
      <h1 className="text-2xl font-bold mb-6">Session Requests</h1>

      {loading && <p>Loading...</p>}

      {!loading && sessions.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400">No session requests yet.</p>
      )}

      <div className="space-y-4">
        {sessions.map((s) => (
          <div
            key={s._id}
            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border"
          >
            <div className="flex justify-between">
              <div>
                <p className="font-semibold">{s.studentId?.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(s.sessionDate).toDateString()} — {s.sessionTime}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Dept: {s.studentId?.department} | Year: {s.studentId?.year}
                </p>
              </div>

              <div className="text-right">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    s.status === "Pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : s.status === "Approved"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {s.status}
                </span>

                {s.status === "Pending" && (
                  <div className="mt-2 space-x-2">
                    <button
                      onClick={() => updateStatus(s._id, "approve")}
                      disabled={updating === s._id}
                      className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white px-3 py-1 rounded transition-opacity"
                    >
                      {updating === s._id ? "..." : "Approve"}
                    </button>

                    <button
                      onClick={() => updateStatus(s._id, "cancel")}
                      disabled={updating === s._id}
                      className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-3 py-1 rounded transition-opacity"
                    >
                      {updating === s._id ? "..." : "Decline"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}