import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend
} from "recharts";

const MOOD_COLORS = ["#34d399", "#60a5fa", "#fbbf24", "#f87171", "#f43f5e"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function AdminAnalytics() {
  const [moodByMonth, setMoodByMonth] = useState([]);
  const [moodDist, setMoodDist] = useState([]);
  const [sessionStats, setSessionStats] = useState([]);
  const [deptBreakdown, setDeptBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const token = sessionStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedYear]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [moodMonthRes, moodDistRes, sessionRes, deptRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/admin/analytics/mood-by-month?year=${selectedYear}`, { headers }),
        axios.get("http://localhost:5000/api/admin/analytics/mood-distribution", { headers }),
        axios.get(`http://localhost:5000/api/admin/analytics/session-stats?year=${selectedYear}`, { headers }),
        axios.get("http://localhost:5000/api/admin/analytics/department-breakdown", { headers }),
      ]);
      setMoodByMonth(moodMonthRes.data);
      setMoodDist(moodDistRes.data);
      setSessionStats(sessionRes.data);
      setDeptBreakdown(deptRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const moodPieData = moodDist.map((d, i) => ({
    name: d._id.charAt(0).toUpperCase() + d._id.slice(1),
    value: d.count,
    fill: MOOD_COLORS[i % MOOD_COLORS.length],
  }));

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Platform Analytics</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Insights across all students & sessions</p>
          </div>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-400"
          >
            {[2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-24 text-gray-400">Loading analytics...</div>
        ) : (
          <>
            {/* Mood Trends by Month */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">
                📈 Student Mood Entries by Month
              </h2>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={moodByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tickFormatter={(m) => MONTHS[m - 1] || m} tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip labelFormatter={(m) => MONTHS[m - 1] || m} />
                  <Line type="monotone" dataKey="count" stroke="#14b8a6" strokeWidth={2.5} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Two columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Mood Distribution Pie */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">
                  😊 Overall Mood Distribution
                </h2>
                {moodPieData.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-12">No data</p>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={moodPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {moodPieData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend iconType="circle" iconSize={10} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Session Status Breakdown */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">
                  📅 Session Status Breakdown
                </h2>
                {sessionStats.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-12">No data</p>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={sessionStats} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis dataKey="_id" type="category" tick={{ fontSize: 12 }} width={80} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#818cf8" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Department Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">
                🏛️ Students by Department
              </h2>
              {deptBreakdown.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">No data</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={deptBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}