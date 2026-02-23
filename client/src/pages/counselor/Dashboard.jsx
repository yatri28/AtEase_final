import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label
} from "recharts";
import DashboardLayout from "../../layouts/DashboardLayout";

export default function CounselorDashboard() {
  const [data, setData] = useState([]);
  const [overall, setOverall] = useState(0);
  const [risk, setRisk] = useState("");
  const [insight, setInsight] = useState("");
  const [monthName, setMonthName] = useState("");

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
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
        `http://localhost:5000/api/analytics/all-students?month=${month}&year=${year}`
      );

      setData(res.data.dailyData);
      setOverall(res.data.overallAverage);
      setRisk(res.data.riskLevel);
      setInsight(res.data.insight);

    } catch (err) {
      console.log(err);
    }
  };

  return (
    <DashboardLayout role="counselor">
      <h1 className="text-2xl font-bold mb-1">
        Campus Mood Overview — {monthName}
      </h1>
      <p className="text-gray-500 mb-6">
        Daily average emotional trend of all students
      </p>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-gray-500">Overall Monthly Average</p>
          <h2 className="text-3xl font-bold">{overall} / 5</h2>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-gray-500">Risk Level</p>
          <h2 className="text-xl font-bold">{risk}</h2>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-gray-500">System Insight</p>
          <p className="text-sm mt-2">{insight}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="day">
              <Label
                value="Day of Month"
                offset={-5}
                position="insideBottom"
              />
            </XAxis>

            <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]}>
              <Label
                value="Average Mood Score (1–5)"
                angle={-90}
                position="insideLeft"
              />
            </YAxis>

            <Tooltip
              formatter={(value) => [`${value} / 5`, "Average Mood"]}
              labelFormatter={(label) => `Day ${label}`}
            />

            <Line
              type="monotone"
              dataKey="averageMood"
              stroke="#14b8a6"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </DashboardLayout>
  );
}