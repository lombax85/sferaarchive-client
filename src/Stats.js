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
  Cell
} from "recharts";
import axios from "axios";
import { useLocation } from "react-router-dom";

// Add this array at the top of the file, outside the component
const EXCLUDED_INACTIVE_USERS = [
  "RC Bridge",
  "jitsi-slack-bridge",
  "Matrix Bridge Beta",
  "Matrix Bridge",
  "slack-archive-bot",
  "slinky"
];

function Stats() {
  const [stats, setStats] = useState(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");
    setLoading(true);

    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      
      // Fetch user info to check if admin
      axios.get(`${API_URL}/whoami`)
        .then(response => {
          setIsAdmin(response.data.is_admin);
        })
        .catch(error => {
          console.error("Error fetching user info:", error);
        });

      axios.get(`${API_URL}/stats?days=${days}`, {})
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

  const handleDownloadUsers = () => {
    axios.get(`${API_URL}/download_users`)
      .then(response => {
        const csvContent = response.data.csv;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', response.data.filename || 'users.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch(error => {
        console.error("Error downloading users:", error);
      });
  };

  // Add this function before the return statement
  const filterInactiveUsers = (users) => {
    return users.filter(user => !EXCLUDED_INACTIVE_USERS.includes(user.real_name));
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
        {isAdmin && (
          <button
            onClick={handleDownloadUsers}
            className="ml-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Download Users
          </button>
        )}
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
            data={stats.user_activity.slice(0, 20).map((user) => ({
              ...user,
              name: user.name === "Slackbot" ? "Utente Opt-Out" : user.name,
            }))}
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

        {/* Images by Author */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Top 10 Image Posters</h2>
          <BarChart width={400} height={300} data={stats.images_by_author}>
            <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} height={60} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="image_count" fill="#8884d8" label={renderCustomizedLabel} />
          </BarChart>
        </div>

        {/* Engaging Threads */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Top 10 Engaging Threads</h2>
          <BarChart 
            width={600} 
            height={300} 
            data={stats.engaging_threads}
            onClick={(data) => {
              if (data && data.activePayload && data.activePayload[0]) {
                const thread = data.activePayload[0].payload;
                const url = `https://slack-archive.sferait.org/getlink?timestamp=${thread.thread_ts}`;
                window.open(url, '_blank');
              }
            }}
          >
            <XAxis dataKey="author" angle={-45} textAnchor="end" interval={0} height={60} />
            <YAxis />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const thread = payload[0].payload;
                  return (
                    <div className="bg-white p-2 border rounded shadow">
                      <p>Author: {thread.author}</p>
                      <p>Reply Count: {thread.reply_count}</p>
                      <p className="text-blue-500 cursor-pointer">Click to open thread</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Bar dataKey="reply_count" fill="#82ca9d" label={renderCustomizedLabel} />
          </BarChart>
        </div>

        {/* Engaging Authors */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Top 10 Engaging Authors</h2>
          <BarChart width={600} height={300} data={stats.engaging_authors.slice(0, 10)}>
            <XAxis dataKey="author" angle={-45} textAnchor="end" interval={0} height={60} />
            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="number_of_threads" fill="#8884d8" name="Number of Threads" />
            <Bar yAxisId="right" dataKey="avg_replies" fill="#82ca9d" name="Average Replies" />
          </BarChart>
        </div>

        {/* Active Users by Words */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Top 10 Active Users by Words</h2>
          <BarChart width={700} height={300} data={stats.active_users_by_words.slice(0, 10)}>
            <XAxis dataKey="author" angle={-45} textAnchor="end" interval={0} height={60} />
            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="total_words" fill="#8884d8" name="Total Words" />
            <Bar yAxisId="left" dataKey="total_messages" fill="#ffc658" name="Total Messages" />
            <Bar yAxisId="right" dataKey="avg_words_per_message" fill="#82ca9d" name="Avg Words per Message" />
          </BarChart>
        </div>
      </div>

      {/* Separator */}
      <hr className="my-8 border-t-2 border-gray-300" />

      {/* Inactive Users Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Inactive Users (120+ days)</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="px-4 py-2">Real Name</th>
                <th className="px-4 py-2">Display Name</th>
                <th className="px-4 py-2">Days Inactive</th>
              </tr>
            </thead>
            <tbody>
              {filterInactiveUsers(stats.inactive_users).map((user, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-gray-100" : ""}>
                  <td className="px-4 py-2">{user.real_name}</td>
                  <td className="px-4 py-2">{user.display_name}</td>
                  <td className="px-4 py-2">{user.days_inactive}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deleted Users Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Deleted Users</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="px-4 py-2">Real Name</th>
                <th className="px-4 py-2">Display Name</th>
                <th className="px-4 py-2">User ID</th>
              </tr>
            </thead>
            <tbody>
              {stats.deleted_users.map((user, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-gray-100" : ""}>
                  <td className="px-4 py-2">{user.real_name}</td>
                  <td className="px-4 py-2">{user.display_name}</td>
                  <td className="px-4 py-2">{user.id}</td>
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
