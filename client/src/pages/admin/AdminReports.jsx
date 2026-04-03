import { useState } from "react";
import axios from "axios";
import DashboardLayout from "../../layouts/DashboardLayout";

const REPORT_TYPES = [
  {
    id: "users",
    title: "User Report",
    desc: "Export all users with role, department, year, and join date.",
    icon: "👥",
    color: "from-teal-500 to-cyan-500",
  },
  {
    id: "moods",
    title: "Mood Report",
    desc: "Monthly mood entries for all students with scores and dates.",
    icon: "😊",
    color: "from-violet-500 to-purple-500",
  },
  {
    id: "sessions",
    title: "Session Report",
    desc: "All counseling sessions with status, date, and participants.",
    icon: "📅",
    color: "from-orange-400 to-amber-500",
  },
  {
    id: "notes",
    title: "Anonymous Notes Report",
    desc: "All anonymous notes submitted by students (content only, no identity).",
    icon: "📝",
    color: "from-rose-400 to-pink-500",
  },
];

export default function AdminReports() {
  const [downloading, setDownloading] = useState(null);
  const [success, setSuccess] = useState("");
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    role: "all",
  });

  const token = localStorage.getItem("token");

  const downloadReport = async (type) => {
    try {
      setDownloading(type);
      const params = new URLSearchParams();
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.role !== "all") params.append("role", filters.role);

      const res = await axios.get(
        `http://localhost:5000/api/admin/reports/${type}?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `atease_${type}_report_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setSuccess(`${type.charAt(0).toUpperCase() + type.slice(1)} report downloaded!`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Download error:", err);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Reports</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Download CSV reports for platform data
          </p>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3">
            ✅ {success}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-4">
            🔍 Filter Options (applied to all reports)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                Role (for User Report)
              </label>
              <select
                value={filters.role}
                onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                <option value="all">All Roles</option>
                <option value="student">Students</option>
                <option value="counselor">Counselors</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Leave dates blank to export all records.
          </p>
        </div>

        {/* Report Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {REPORT_TYPES.map(({ id, title, desc, icon, color }) => (
            <div
              key={id}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex items-start gap-4"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-2xl shrink-0`}>
                {icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 dark:text-white">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
              </div>
              <button
                onClick={() => downloadReport(id)}
                disabled={downloading === id}
                className="shrink-0 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition disabled:opacity-60 flex items-center gap-2"
              >
                {downloading === id ? (
                  <>
                    <span className="animate-spin">⏳</span> Downloading...
                  </>
                ) : (
                  <>⬇️ Download CSV</>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Info Note */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl p-5">
          <p className="text-amber-800 dark:text-amber-300 text-sm">
            <strong>📋 Note:</strong> Reports are exported as CSV files. Anonymous notes report
            does not include student identity — only note content and timestamp.
            All reports are accessible only to admins.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
