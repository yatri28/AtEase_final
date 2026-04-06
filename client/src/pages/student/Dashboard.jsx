import { useState, useEffect, useContext, useCallback } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { SettingsContext } from "../../context/SettingsContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import NotificationBell from "../../components/NotificationBell";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function StudentDashboard() {
  const { settings } = useContext(SettingsContext);
  const navigate = useNavigate();

  const loggedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const studentId = loggedUser?._id;
  const token = localStorage.getItem("token");

  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState("");
  const [showNoteBox, setShowNoteBox] = useState(false);
  const [showAllNotes, setShowAllNotes] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [monthlyMoods, setMonthlyMoods] = useState([]);
  const [todayMoodId, setTodayMoodId] = useState(null);
  const [selectedMood, setSelectedMood] = useState(null);
  const [sessions, setSessions]         = useState([]);


  const moods = [
    { emoji: "😊", label: "Happy", value: 5 },
    { emoji: "😌", label: "Calm", value: 4 },
    { emoji: "😐", label: "Neutral", value: 3 },
    { emoji: "😢", label: "Sad", value: 2 },
    { emoji: "😰", label: "Stressed", value: 1 },
  ];

  const dayName = new Date().toLocaleDateString("en-US", { weekday: "long" });

  /* ---------------- FETCH NOTES ---------------- */
const fetchMonthlyMoods = useCallback(async () => {
  try {
    const res = await axios.get(
      `http://localhost:5000/api/moods/monthly?month=${selectedMonth}&year=${selectedYear}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const year = selectedYear;
    const month = selectedMonth;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const fullMonth = Array.from({ length: daysInMonth }, (_, i) => ({
      date: new Date(year, month, i + 1),
      mood: null,
    }));

    res.data.forEach((m) => {
      const d = new Date(m.createdAt).getDate();
      fullMonth[d - 1].mood =
        { Happy: 5, Calm: 4, Neutral: 3, Sad: 2, Stressed: 1 }[
          m.moodType
        ];
    });

    setMonthlyMoods(fullMonth);

    // Only set today's mood for current month
    const now = new Date();
    if (
      selectedMonth === now.getMonth() &&
      selectedYear === now.getFullYear()
    ) {
      const today = res.data.find(
        (m) => new Date(m.createdAt).getDate() === now.getDate()
      );

      if (today) {
        setTodayMoodId(today._id);
        setSelectedMood(today.moodType);
      }
    }
  } catch (err) {
    console.log(err);
  }
}, [token, selectedMonth, selectedYear]);


useEffect(() => {
  if (!token || !studentId) {
    navigate("/");
    return;
  }

  const fetchData = async () => {
    try {
      const [notesRes, sessionsRes] = await Promise.all([
        fetch(`http://localhost:5000/api/notes/${studentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:5000/api/sessions/student", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const notesData    = await notesRes.json();
      const sessionsData = await sessionsRes.json();

      setNotes(notesData);
      setSessions(Array.isArray(sessionsData) ? sessionsData : []);
      await fetchMonthlyMoods();
    } catch (err) {
      console.log(err);
    }
  };

  fetchData();
}, [studentId, token, navigate, fetchMonthlyMoods]);

  /* ---------------- FETCH MOODS ---------------- */

  /* ---------------- CALCULATE STREAK ---------------- */
  const calculateStreak = () => {
    if (monthlyMoods.length === 0) return 0;
    const todayIndex = new Date().getDate() - 1;
    let streak = 0;

    for (let i = todayIndex; i >= 0; i--) {
      if (monthlyMoods[i].mood !== null) {
        streak++;
      } else if (i === todayIndex) {
        // If today isn't entered yet, don't break, check yesterday
        continue;
      } else {
        break;
      }
    }
    return streak;
  };

  /* ---------------- MOOD ACTIONS ---------------- */
  const handleMoodClick = async (mood) => {
    try {
      setSelectedMood(mood.label);

      if (todayMoodId) {
        await axios.put(
          `http://localhost:5000/api/moods/update/${todayMoodId}`,
          { moodType: mood.label },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        const res = await axios.post(
          "http://localhost:5000/api/moods/add",
          { moodType: mood.label },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTodayMoodId(res.data._id);
      }

      fetchMonthlyMoods();
    } catch (err) {
      console.log(err);
    }
  };

  const deleteMood = async () => {
    try {
      await axios.delete(
        `http://localhost:5000/api/moods/delete/${todayMoodId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedMood(null);
      setTodayMoodId(null);
      fetchMonthlyMoods();
    } catch (err) {
      console.log(err);
    }
  };

  /* ---------------- NOTE SUBMIT ---------------- */
   const handleSubmitNote = async () => {
    if (!noteText.trim()) return;

    const res = await fetch("http://localhost:5000/api/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ studentId, text: noteText }),
    });

    const data = await res.json();
    setNotes((prev) => [data, ...prev]);
    setNoteText("");
    setShowNoteBox(false);
  };

  const handleEditNote = async (noteId) => {
    if (!editingText.trim()) return;

    try {
      const res = await fetch(`http://localhost:5000/api/notes/${noteId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: editingText }),
      });
      const updatedNote = await res.json();
      setNotes((prev) =>
        prev.map((note) => (note._id === noteId ? updatedNote : note))
      );
      setEditingNoteId(null);
      setEditingText("");
    } catch (err) {
      console.log(err);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await fetch(`http://localhost:5000/api/notes/${noteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes((prev) => prev.filter((note) => note._id !== noteId));
    } catch (err) {
      console.log(err);
    }
  };

const sendNoteToCounselor = async (noteId) => {
  try {
    // Send note to counselor
    await axios.post(
      "http://localhost:5000/api/notes/send-to-counselor",
      {
        noteId,
        studentId, // include this if backend needs it
        anonymous: settings?.anonymousNotes || false,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Update local state to mark as sent
    setNotes((prev) =>
      prev.map((note) =>
        note._id === noteId ? { ...note, sentToCounselor: true } : note
      )
    );

    alert("Note sent to counselor successfully");
  } catch (err) {
    console.log(err);
    alert("Failed to send note");
  }
};

  /* ================= SESSION HELPERS ================= */
  const now = new Date();

  const nextSession = sessions
    .filter((s) => s.status === "Approved" && new Date(s.sessionDate) >= now)
    .sort((a, b) => new Date(a.sessionDate) - new Date(b.sessionDate))[0];

  const nextSessionLabel = nextSession
    ? `${new Date(nextSession.sessionDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} ${nextSession.sessionTime}`
    : "Not Scheduled";

  const attendedCount = sessions.filter(
    (s) => s.status === "Approved" && new Date(s.sessionDate) < now
  ).length;

  /* ================= UI ================= */
  return (
    <DashboardLayout role="student">
      <div className="flex justify-between items-center mb-4">
  <div>
    <p className="text-teal-500 text-sm font-medium mb-1">
      ✨ You are stronger than you think.
    </p>

    <h1 className="text-2xl font-bold">
      Hello, {loggedUser?.name} 👋
    </h1>

    <p className="text-gray-500 dark:text-gray-400">
      Here’s a quick look at your wellness journey
    </p>
  </div>

    {/* 🔔 Notification Bell on right */}
    <NotificationBell userId={loggedUser._id.toString()} />
  </div>


      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Next Session" value={nextSessionLabel} icon="📅" color="bg-teal-100" />
        <StatCard title="Sessions Attended" value={attendedCount} icon="⏰" color="bg-purple-100" />
        <StatCard title="Mood Streak" value={`${calculateStreak()} Days`} icon="📈" color="bg-yellow-100" />
        <StatCard title="Notes" value={notes.length} icon="💬" color="bg-blue-100" />
      </div>

      {/* MOOD TRACKER */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm mb-6">
        <h2 className="font-semibold mb-2 ">
          How are you feeling this {dayName}?
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4 bg-white dark:bg-gray-800">
          {moods.map((mood) => (
            <button
              key={mood.label}
              onClick={() => handleMoodClick(mood)}
              className={ `bg-white dark:bg-gray-800 py-5 flex flex-col items-center gap-1 rounded-2xl ${
                selectedMood === mood.label
                  ? "bg-teal-100 ring-2 ring-teal-400"
                  : "bg-gray-50 hover:bg-teal-50"
              }`}
            >
              <span className="text-3xl">{mood.emoji}</span>
              <span className="text-sm font-medium">{mood.label}</span>
            </button>
          ))}
        </div>

        {selectedMood && (
          <button
            onClick={deleteMood}
            className="mt-4 text-sm text-red-500 underline"
          >
            Delete Today’s Mood
          </button>
        )}
      </div>
      <div className="flex gap-4 mb-4">
  <select
    value={selectedMonth}
    onChange={(e) => setSelectedMonth(Number(e.target.value))}
    className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 py-2 rounded-lg border"
  >
    {[
      "January","February","March","April","May","June",
      "July","August","September","October","November","December"
    ].map((m, i) => (
      <option key={i} value={i}>{m}</option>
    ))}
  </select>

  <select
    value={selectedYear}
    onChange={(e) => setSelectedYear(Number(e.target.value))}
    className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 py-2 rounded-lg border"
  >
    {[2023, 2024, 2025, 2026].map((y) => (
      <option key={y} value={y}>{y}</option>
    ))}
  </select>
</div>

      {/* CHART */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl text-gray-500 dark:text-gray-400 shadow-sm mb-6">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyMoods}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={(d) => d.getDate()} />
            <YAxis domain={[1, 5]} />
            <Tooltip />
            <Line dataKey="mood" stroke="#14b8a6" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* BOTTOM SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm">
          <h2 className="font-semibold mb-2">Upcoming Session</h2>
          {nextSession ? (
            <div className="mt-2 space-y-1">
              <p className="font-medium text-teal-600 dark:text-teal-400">
                {nextSession.counselorName}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                📅 {new Date(nextSession.sessionDate).toDateString()}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                🕐 {nextSession.sessionTime}
              </p>
              <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                Approved
              </span>
            </div>
          ) : (
            <>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                You don’t have any sessions scheduled.
              </p>
              <button
                onClick={() => navigate("/student/book")}
                className="mt-4 px-5 py-2 bg-teal-500 text-white rounded-lg"
              >
                Book a Session
              </button>
            </>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm">
          <h2 className="font-semibold mb-3">Quick Actions</h2>
          <div className="space-y-3">
            <ActionButton
              text="📅 Book a Session"
              onClick={() => navigate("/student/book")}
            />
            <ActionButton text="💬 Message Counselor"
             onClick={() => navigate("/student/messages")} />
            <ActionButton
              text="📝 Write a Note"
              onClick={() => setShowNoteBox(true)}
            />
          </div>
        </div>
      </div>

      {showNoteBox && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm mt-6">
          <h2 className="font-semibold mb-2">Write a Note</h2>
          <textarea
            rows="4"
            className="w-full border rounded-lg p-3 bg-white dark:bg-gray-800"
            placeholder="Write your thoughts here..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
          />
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSubmitNote}
              disabled={!noteText.trim()}
              className={`px-5 py-2 rounded-lg text-white ${
                noteText.trim()
                  ? "bg-teal-500 hover:bg-teal-600"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              Submit
            </button>
            <button
              onClick={() => setShowNoteBox(false)}
              className="px-5 py-2 border rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Notes List */}
      {notes.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm mt-6">
          <h2 className="font-semibold mb-3">📝 Your Notes</h2>
         {(showAllNotes ? notes : notes.slice(0, 2)).map((note) => (
           <div key={note._id} className="border-b py-2 flex justify-between items-center">
              {editingNoteId === note._id ? (
                <>
                  <input
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border rounded-lg p-1 w-full mr-2"
                  />
                  <button
                    onClick={() => handleEditNote(note._id)}
                    className="text-teal-500 text-sm mr-2"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingNoteId(null)}
                    className="text-red-500 text-sm"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <span>• {note.text}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingNoteId(note._id);
                        setEditingText(note.text);
                      }}
                      className="text-blue-500 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note._id)}
                      className="text-red-500 text-sm"
                    >
                      Delete
                    </button>
                      {settings?.anonymousNotes && (
                      <button
                          onClick={() => sendNoteToCounselor(note._id)}
                          disabled={note.sentToCounselor}
                          className={`text-sm px-2 py-1 rounded-md ${
                            note.sentToCounselor
                              ? "bg-gray-300 cursor-not-allowed"
                              : "border border-teal-400 text-teal-500 hover:bg-teal-50"
                          }`}
                        >
                          {note.sentToCounselor ? "Sent" : "Send to Counselor"}
                        </button>
                         )}
                  </div>
                </>
              )}
            </div>
          ))}
          {notes.length > 2 && (
            <button
              onClick={() => setShowAllNotes(!showAllNotes)}
              className="mt-3 text-teal-500 text-sm"
            >
              {showAllNotes ? "Show less" : "View all notes"}
            </button>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}


/* ---------------- COMPONENTS ---------------- */
function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm flex items-center gap-4">
      <div className={`h-12 w-12 rounded-full flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">{title}</p>
        <h2 className="font-semibold">{value}</h2>
      </div>
    </div>
  );
}

function ActionButton({ text, onClick }) {
  return (
    <button onClick={onClick} className="w-full border rounded-lg px-4 py-3 text-left">
      {text}
    </button>
  );
}