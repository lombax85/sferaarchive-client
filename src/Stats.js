import React, { useState, useEffect } from "react";
import { API_URL } from "./config";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import axios from "axios";
import { useLocation } from "react-router-dom";

function Stats() {
  const [stats, setStats] = useState(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");
    setLoading(true);

    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      axios
        .get(`${API_URL}/stats?days=${days}`, {})
        .then((response) => response.data)
        .then((data) => {
          setStats(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching stats:", error);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [location, days]);

  const handleDaysChange = (event) => {
    setDays(parseInt(event.target.value));
  };

  if (loading) return <div>Loading...</div>;
  if (!stats) return <div>Error loading stats</div>;

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  const renderCustomizedLabel = (props) => {
    const { x, y, width, value } = props;
    const radius = 10;

    return (
      <g>
        <text
          x={x + width / 2}
          y={y - radius}
          fill="#000000"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {value}
        </text>
      </g>
    );
  };

  // Sort active_hours data by hour
  const sortedActiveHours = [...stats.active_hours].sort(
    (a, b) => a.hour - b.hour
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Community Statistics</h1>

      <div className="mb-4">
        <label htmlFor="days" className="mr-2">
          Select time period:
        </label>
        <select
          id="days"
          value={days}
          onChange={handleDaysChange}
          className="border rounded p-1"
        >
          <option value="7">7 days</option>
          <option value="30">30 days</option>
          <option value="90">90 days</option>
          <option value="180">180 days</option>
          <option value="365">365 days</option>
        </select>
      </div>

      <p className="text-lg font-semibold mb-4">
        Showing stats for the last {days} days
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Top 5 Active Channels */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Top 5 Active Channels</h2>
          <BarChart width={400} height={300} data={stats.top_channels}>
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              interval={0}
              height={60}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="message_count"
              fill="#8884d8"
              label={renderCustomizedLabel}
            />
          </BarChart>
        </div>

        {/* User Activity */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Top 20 Active Users</h2>
          <BarChart
            width={600}
            height={300}
            data={stats.user_activity.slice(0, 20)}
          >
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              interval={0}
              height={60}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="post_count"
              fill="#82ca9d"
              label={renderCustomizedLabel}
            />
          </BarChart>
        </div>

        {/* Emoji Usage */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Top 5 Emojis</h2>
          <PieChart width={400} height={300}>
            <Pie
              data={stats.emoji_usage.slice(0, 5)}
              dataKey="usage_count"
              nameKey="emoji"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label
            >
              {stats.emoji_usage.slice(0, 5).map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>

        {/* Active Hours */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Activity by Hour</h2>
          <BarChart width={600} height={300} data={sortedActiveHours}>
            <XAxis dataKey="hour" interval={0} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="message_count"
              fill="#ffc658"
              label={renderCustomizedLabel}
            />
          </BarChart>
        </div>
      </div>

      {/* Channel Trends */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Channel Trends</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="px-4 py-2">Channel</th>
                <th className="px-4 py-2">Thread Count</th>
                <th className="px-4 py-2">Total Posts</th>
              </tr>
            </thead>
            <tbody>
              {stats.channel_trends.map((channel, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-gray-100" : ""}
                >
                  <td className="px-4 py-2">{channel.name}</td>
                  <td className="px-4 py-2">{channel.thread_count}</td>
                  <td className="px-4 py-2">{channel.total_posts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Stats;
