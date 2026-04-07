import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import AdminNotificationBell from "../../components/AdminNotificationBell";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

const MOOD_COLORS = {
  happy: "#34d399",
  calm: "#60a5fa",
  neutral: "#fbbf24",
  sad: "#f87171",
  stressed: "#f43f5e",
};

const STAT_CARDS = [
  { key: "totalStudents", label: "Total Students", icon: "🎓", color: "from-teal-500 to-cyan-500" },
  { key: "totalCounselors", label: "Counselors", icon: "🩺", color: "from-violet-500 to-purple-500" },
  { key: "totalSessions", label: "Sessions", icon: "📅", color: "from-orange-400 to-amber-500" },
  { key: "pendingSessions", label: "Pending Sessions", icon: "⏳", color: "from-rose-400 to-pink-500" },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [moodSummary, setMoodSummary] = useState([]);
  const [sessionTrend, setSessionTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, moodRes, sessionRes] = await Promise.all([
        axios.get("http://localhost:5000/api/admin/stats", { headers }),
        axios.get("http://localhost:5000/api/admin/mood-summary", { headers }),
        axios.get("http://localhost:5000/api/admin/session-trend", { headers }),
      ]);

      setStats(statsRes.data);
      setMoodSummary(moodRes.data);
      setSessionTrend(sessionRes.data);
    } catch (err) {
      console.error("Admin dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const moodPieData = moodSummary.map((item) => ({
    name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
    value: item.count,
    fill: MOOD_COLORS[item._id] || "#94a3b8",
  }));

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
  
  {/* Left Side - Title */}
  <div>
    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
      Admin Dashboard
    </h1>
    <p className="text-gray-500 dark:text-gray-400 mt-1">
      Platform overview & analytics
    </p>
  </div>

  {/* Right Side - Notification Bell */}
  <div className="flex items-center gap-4">
    <AdminNotificationBell />
  </div>

</div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STAT_CARDS.map(({ key, label, icon, color }) => (
            <div
              key={key}
              className={`bg-gradient-to-br ${color} rounded-2xl p-5 text-white shadow-lg`}
            >
              <div className="text-3xl mb-2">{icon}</div>
              <div className="text-3xl font-bold">
                {loading ? "—" : stats[key] ?? 0}
              </div>
              <div className="text-sm mt-1 opacity-90">{label}</div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Session Trend */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">
              📊 Session Trend (Last 6 Months)
            </h2>
            {sessionTrend.length === 0 && !loading ? (
              <p className="text-gray-400 text-sm text-center py-8">No session data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={sessionTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Mood Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">
              😊 Overall Mood Distribution
            </h2>
            {moodPieData.length === 0 && !loading ? (
              <p className="text-gray-400 text-sm text-center py-8">No mood data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={moodPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {moodPieData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" iconSize={10} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Wellbeing Summary */}
        {stats.wellbeingIndex && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">
              🧠 Platform Wellbeing Summary
            </h2>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-4xl font-bold text-teal-500">{stats.wellbeingIndex}</div>
                <div className="text-sm text-gray-500 mt-1">Wellbeing Index (/ 5)</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-rose-400">{stats.concernPercentage}%</div>
                <div className="text-sm text-gray-500 mt-1">Students at Risk</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-400">{stats.positivePercentage}%</div>
                <div className="text-sm text-gray-500 mt-1">Positive Mood</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}