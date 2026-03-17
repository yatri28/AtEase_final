import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";

export default function BookSession() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedCounselor, setSelectedCounselor] = useState(null);
  const [counselors, setCounselors] = useState([]);
  const [sessions, setSessions] = useState([]); 
  const [loading, setLoading] = useState(false);

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const currentDay = today.getDate();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const monthName = today.toLocaleString("default", { month: "long" });

  const times = ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"];

  /* ================= FETCH COUNSELORS ================= */
  const fetchCounselors = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/counselors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch counselors");
      setCounselors(data);
    } catch (err) {
      console.error(err.message);
      alert("Error fetching counselors: " + err.message);
    }
  };

  /* ================= FETCH STUDENT SESSIONS ================= */
  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/sessions/student", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch sessions");
      setSessions(data);
    } catch (err) {
      console.error(err.message);
      alert("Error fetching sessions: " + err.message);
    }
  };

  useEffect(() => {
    fetchCounselors();
    fetchSessions();
  }, []);

  /* ================= BOOK SESSION ================= */
  const handleBookSession = async () => {
    if (!selectedDate || !selectedTime || !selectedCounselor) {
      alert("Please select date, time and counselor");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const sessionDate = new Date(currentYear, currentMonth, selectedDate);

      const res = await fetch("http://localhost:5000/api/sessions/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          counselorId: selectedCounselor,
          sessionDate,
          sessionTime: selectedTime,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Booking failed");

      alert("Session request sent successfully!");

      // reset selection
      setSelectedDate(null);
      setSelectedTime(null);
      setSelectedCounselor(null);

      fetchSessions(); // refresh list
    } catch (err) {
      console.error(err.message);
      alert("Error booking session: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="student">
      <h1 className="text-2xl font-bold mb-1">Book a Session</h1>
      <p className="text-gray-500 mb-6">Schedule your next counselling appointment</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* DATE SECTION */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm">
          <h2 className="font-semibold mb-2">Select Date</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">{monthName} {currentYear}</p>

          <div className="grid grid-cols-7 gap-2 text-center text-sm">
            {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => (
              <span key={d} className="text-gray-500 dark:text-gray-400">{d}</span>
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isPast = day < currentDay;
              return (
                <button
                  key={day}
                  disabled={isPast}
                  onClick={() => !isPast && setSelectedDate(day)}
                  className={`py-2 rounded-lg transition
                    ${isPast ? "text-gray-400 cursor-not-allowed" : ""}
                    ${selectedDate === day ? "bg-teal-500 text-white" :
                      !isPast ? "hover:bg-teal-50 dark:hover:bg-gray-700 hover:text-black dark:hover:text-white text-gray-700 dark:text-gray-300" : ""}`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* TIME SECTION */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm">
          <h2 className="font-semibold mb-4">Select Time</h2>
          <div className="grid grid-cols-2 gap-3">
            {times.map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`py-2 rounded-lg border transition
                  ${selectedTime === time ? "bg-teal-500 border-teal-400 text-white" :
                    "hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-black dark:hover:text-white text-gray-700 dark:text-gray-300"}`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        {/* COUNSELOR SECTION */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm flex flex-col">
          <h2 className="font-semibold mb-4">Choose Counselor</h2>

          <div className="space-y-3 flex-1">
            {counselors.map((c) => (
              <div
                key={c._id}
                onClick={() => setSelectedCounselor(c._id)}
                className={`p-4 rounded-xl border cursor-pointer transition
                  ${selectedCounselor === c._id ? "bg-teal-500 border-teal-400 text-white" :
                    "hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-black dark:hover:text-white text-gray-700 dark:text-gray-300"}`}
              >
                <p className="font-medium">{c.name}</p>
                <p className="text-sm text-gray-500">{c.specialization}</p>
              </div>
            ))}
          </div>

          <button
            onClick={handleBookSession}
            disabled={loading}
            className="mt-4 bg-teal-500 text-white py-2 rounded-lg font-medium hover:bg-teal-600 transition disabled:opacity-50"
          >
            {loading ? "Booking..." : "Book Session"}
          </button>
        </div>
      </div>

      {/* ================= MY SESSIONS LIST ================= */}
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-4">My Sessions</h2>

        {sessions.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400">No sessions booked yet.</p>
        )}

        <div className="space-y-4">
          {sessions.map((s) => (
            <div key={s._id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{s.counselorId?.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(s.sessionDate).toDateString()} — {s.sessionTime}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  s.status === "Pending" ? "bg-yellow-100 text-yellow-700" :
                  s.status === "Approved" ? "bg-green-100 text-green-700" :
                  s.status === "Cancelled" ? "bg-red-100 text-red-700" :
                  "bg-gray-100 text-gray-700"
                }`}>
                  {s.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}