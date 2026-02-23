import { useEffect, useState } from "react";
import axios from "axios";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import DashboardLayout from "../../layouts/DashboardLayout";

export default function CounselorDashboard() {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState({});
  const [monthName, setMonthName] = useState("");

  useEffect(() => {
    fetchDistribution();
  }, []);

  const fetchDistribution = async () => {
    try {
      const date = new Date();
      const month = date.getMonth();
      const year = date.getFullYear();

      const monthString = date.toLocaleString("default", {
        month: "long",
        year: "numeric"
      });

      setMonthName(monthString);

      const res = await axios.get(
        `http://localhost:5000/api/analytics/mood-distribution?month=${month}&year=${year}`
      );

      setData(res.data.distribution);

      const counts = {
        stressed: 0,
        sad: 0,
        neutral: 0,
        calm: 0,
        happy: 0
      };

      res.data.distribution.forEach(item => {
        if (item.moodScore === 1) counts.stressed = item.count;
        if (item.moodScore === 2) counts.sad = item.count;
        if (item.moodScore === 3) counts.neutral = item.count;
        if (item.moodScore === 4) counts.calm = item.count;
        if (item.moodScore === 5) counts.happy = item.count;
      });

      setSummary({
        ...counts,
        total: res.data.totalStudents,
        riskLevel: res.data.riskLevel
      });

    } catch (err) {
      console.log(err);
    }
  };

  return (
    <DashboardLayout role="counselor">
      <h1 className="text-2xl font-bold mb-2">
        Mood Distribution — {monthName}
      </h1>
      <p className="text-gray-500 mb-6">
        Emotional segmentation of all students
      </p>

      {/* Scatter Chart */}
      <div className="bg-white p-6 rounded-2xl shadow mb-8">
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart>
            <CartesianGrid />

            <XAxis
              type="number"
              dataKey="moodScore"
              name="Mood Score"
              domain={[1, 5]}
              tickCount={5}
              label={{
                value: "Mood Score (1 = Stressed, 5 = Happy)",
                position: "insideBottom",
                offset: -5
              }}
            />

            <YAxis
              type="number"
              dataKey="count"
              name="Number of Students"
              label={{
                value: "Number of Students",
                angle: -90,
                position: "insideLeft"
              }}
            />

            <Tooltip
              formatter={(value, name) => [value, "Students"]}
              labelFormatter={(label) => `Mood Score: ${label}`}
            />

            <Scatter data={data} fill="#14b8a6" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Section */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="font-semibold mb-2">Emotional Breakdown</h3>
          <p>Happy: {summary.happy}</p>
          <p>Calm: {summary.calm}</p>
          <p>Neutral: {summary.neutral}</p>
          <p>Sad: {summary.sad}</p>
          <p>Stressed: {summary.stressed}</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="font-semibold mb-2">Total Entries</h3>
          <p className="text-3xl font-bold">{summary.total}</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="font-semibold mb-2">Risk Level</h3>
          <p className="text-xl font-bold">{summary.riskLevel}</p>
        </div>
      </div>
    </DashboardLayout>
  );
}