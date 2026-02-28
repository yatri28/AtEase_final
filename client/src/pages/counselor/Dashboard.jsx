import { useEffect, useState } from "react";
import axios from "axios";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea
} from "recharts";
import DashboardLayout from "../../layouts/DashboardLayout";

export default function CounselorDashboard() {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState({});
  const [insights, setInsights] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [year] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  const months = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec"
  ];

  useEffect(() => {
    fetchAnalytics(selectedMonth);
  }, [selectedMonth]);

  const fetchAnalytics = async (month) => {
    try {
      setLoading(true);

      const res = await axios.get(
        `http://localhost:5000/api/analytics/student-mood-clusters?month=${month}&year=${year}`
      );

      setData(res.data.scatterData || []);
      setSummary(res.data.summary || {});
      setInsights({
        ...res.data.facultyInsights,
        totalStudents: res.data.totalStudents
      });

    } catch (err) {
      console.error("Analytics Fetch Error:", err);
      setData([]);
      setSummary({});
      setInsights({});
    } finally {
      setLoading(false);
    }
  };

  // ✅ Safe Most Common Mood Calculation
  const getMostCommonMood = () => {
    if (!summary || Object.keys(summary).length === 0) return "N/A";

    const entries = Object.entries(summary);
    if (entries.length === 0) return "N/A";

    const highest = entries.reduce((prev, current) =>
      current[1] > prev[1] ? current : prev
    );

    if (highest[1] === 0) return "N/A";

    return highest[0].charAt(0).toUpperCase() + highest[0].slice(1);
  };

  return (
    <DashboardLayout role="counselor">
      <h1 className="text-2xl font-bold mb-4">
        Student Mood Analysis — {months[selectedMonth]} {year}
      </h1>

      {/* Month Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {months.map((month, index) => (
          <button
            key={index}
            onClick={() => setSelectedMonth(index)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              selectedMonth === index
                ? "bg-blue-600 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {month}
          </button>
        ))}
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm">
        {loading ? (
          <p className="text-center text-gray-500">Loading data...</p>
        ) : data.length === 0 ? (
          <p className="text-center text-gray-500">
            No mood data available for this month.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={420}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />

              {/* X Axis: Month Only */}
              <XAxis
                type="number"
                dataKey="x"
                domain={[-4, 4]}
                tick={false}
                label={{
                  value: months[selectedMonth],
                  position: "insideBottom",
                  offset: -5
                }}
              />

              {/* Y Axis: Mood Levels */}
              <YAxis
                type="number"
                dataKey="y"
                domain={[0.5, 5.5]}
                ticks={[1,2,3,4,5]}
                tickFormatter={(value) =>
                  ({
                    1: "Stressed",
                    2: "Sad",
                    3: "Neutral",
                    4: "Calm",
                    5: "Happy"
                  }[value])
                }
              />

              <Tooltip
                formatter={(value, name, props) => {
                  const moodMap = {
                    1: "Stressed",
                    2: "Sad",
                    3: "Neutral",
                    4: "Calm",
                    5: "Happy"
                  };
                  return [`Mood: ${moodMap[props.payload.y]}`];
                }}
              />

              {/* Emotional Zones */}
              <ReferenceArea y1={0.5} y2={1.5} fill="#fecaca" fillOpacity={0.3} />
              <ReferenceArea y1={1.5} y2={2.5} fill="#fed7aa" fillOpacity={0.3} />
              <ReferenceArea y1={2.5} y2={3.5} fill="#e5e7eb" fillOpacity={0.3} />
              <ReferenceArea y1={3.5} y2={4.5} fill="#bbf7d0" fillOpacity={0.3} />
              <ReferenceArea y1={4.5} y2={5.5} fill="#86efac" fillOpacity={0.3} />

              <Scatter data={data} fill="#14b8a6" />
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Faculty Insights Section */}
      <div className="mt-8 bg-white p-6 rounded-2xl shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Faculty Insights</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">

          <InsightCard
            title="Total Students Analysed"
            value={insights.totalStudents || 0}
          />

          <InsightCard
            title="Wellbeing Index (1–5)"
            value={insights.wellbeingIndex || 0}
          />

          <InsightCard
            title="Students Needing Attention"
            value={`${insights.concernStudents || 0} (${insights.concernPercentage || 0}%)`}
          />

          <InsightCard
            title="Positive Emotional State"
            value={`${insights.positiveStudents || 0} (${insights.positivePercentage || 0}%)`}
          />

          <InsightCard
            title="Most Common Mood"
            value={getMostCommonMood()}
          />

        </div>
      </div>
    </DashboardLayout>
  );
}

function InsightCard({ title, value }) {
  return (
    <div className="p-4 rounded-xl bg-gray-50 border">
      <p className="text-gray-500">{title}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
    </div>
  );
}