import React, { useState, useEffect } from 'react';
import { API_URL } from './config';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

function Stats() {
  const [stats, setStats] = useState(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // setLoading(true);
    // fetch(`${API_URL}/stats?days=${days}`)
    //   .then(response => response.json())
    //   .then(data => {
    //     setStats(data);
    //     setLoading(false);
    //   })
    //   .catch(error => {
    //     console.error('Error fetching stats:', error);
    //     setLoading(false);
    //   });


    setLoading(false);
    setStats({
        
      "active_hours": [
        {
          "hour": 12,
          "message_count": 471
        },
        {
          "hour": 13,
          "message_count": 334
        },
        {
          "hour": 14,
          "message_count": 329
        },
        {
          "hour": 11,
          "message_count": 327
        },
        {
          "hour": 9,
          "message_count": 272
        },
        {
          "hour": 7,
          "message_count": 270
        },
        {
          "hour": 8,
          "message_count": 250
        },
        {
          "hour": 15,
          "message_count": 230
        },
        {
          "hour": 10,
          "message_count": 205
        },
        {
          "hour": 6,
          "message_count": 153
        },
        {
          "hour": 17,
          "message_count": 143
        },
        {
          "hour": 20,
          "message_count": 129
        },
        {
          "hour": 16,
          "message_count": 118
        },
        {
          "hour": 21,
          "message_count": 108
        },
        {
          "hour": 18,
          "message_count": 103
        },
        {
          "hour": 19,
          "message_count": 95
        },
        {
          "hour": 22,
          "message_count": 60
        },
        {
          "hour": 5,
          "message_count": 46
        },
        {
          "hour": 4,
          "message_count": 16
        },
        {
          "hour": 0,
          "message_count": 13
        },
        {
          "hour": 23,
          "message_count": 12
        },
        {
          "hour": 1,
          "message_count": 1
        }
      ],
      "channel_trends": [
        {
          "name": "random",
          "thread_count": 42,
          "total_posts": 648
        },
        {
          "name": "craigslist",
          "thread_count": 49,
          "total_posts": 369
        },
        {
          "name": "rants",
          "thread_count": 55,
          "total_posts": 322
        },
        {
          "name": "trash",
          "thread_count": 55,
          "total_posts": 308
        },
        {
          "name": "networking",
          "thread_count": 12,
          "total_posts": 220
        },
        {
          "name": "outages",
          "thread_count": 10,
          "total_posts": 217
        },
        {
          "name": "tmp-crowdstrike-disaster",
          "thread_count": 184,
          "total_posts": 204
        },
        {
          "name": "wallstreet",
          "thread_count": 20,
          "total_posts": 176
        },
        {
          "name": "general",
          "thread_count": 19,
          "total_posts": 164
        },
        {
          "name": "security",
          "thread_count": 26,
          "total_posts": 137
        },
        {
          "name": "politics",
          "thread_count": 21,
          "total_posts": 134
        },
        {
          "name": "meta",
          "thread_count": 10,
          "total_posts": 132
        },
        {
          "name": "praise",
          "thread_count": 14,
          "total_posts": 117
        },
        {
          "name": "memes",
          "thread_count": 50,
          "total_posts": 98
        },
        {
          "name": "entertainment",
          "thread_count": 12,
          "total_posts": 95
        },
        {
          "name": "diy",
          "thread_count": 7,
          "total_posts": 72
        },
        {
          "name": "ai",
          "thread_count": 13,
          "total_posts": 49
        },
        {
          "name": "development",
          "thread_count": 7,
          "total_posts": 44
        },
        {
          "name": "jobs",
          "thread_count": 8,
          "total_posts": 40
        },
        {
          "name": "zanzara-republic",
          "thread_count": 7,
          "total_posts": 28
        },
        {
          "name": "sport",
          "thread_count": 7,
          "total_posts": 21
        },
        {
          "name": "gaming",
          "thread_count": 7,
          "total_posts": 18
        },
        {
          "name": "executive",
          "thread_count": 1,
          "total_posts": 18
        },
        {
          "name": "archive-bot",
          "thread_count": 11,
          "total_posts": 14
        },
        {
          "name": "parenting",
          "thread_count": 5,
          "total_posts": 14
        },
        {
          "name": "health",
          "thread_count": 4,
          "total_posts": 9
        },
        {
          "name": "home-utilities",
          "thread_count": 1,
          "total_posts": 6
        },
        {
          "name": "iot",
          "thread_count": 2,
          "total_posts": 5
        },
        {
          "name": "wars",
          "thread_count": 3,
          "total_posts": 4
        },
        {
          "name": "censorship",
          "thread_count": 1,
          "total_posts": 2
        }
      ],
      "emoji_usage": [
        {
          "emoji": "rolling_on_the_floor_laughing",
          "usage_count": 51
        },
        {
          "emoji": "joy",
          "usage_count": 41
        },
        {
          "emoji": "eyes",
          "usage_count": 30
        },
        {
          "emoji": "smile",
          "usage_count": 28
        },
        {
          "emoji": "trollface",
          "usage_count": 24
        },
        {
          "emoji": "slightly_smiling_face",
          "usage_count": 16
        },
        {
          "emoji": "stuck_out_tongue",
          "usage_count": 14
        },
        {
          "emoji": "sweat_smile",
          "usage_count": 13
        },
        {
          "emoji": "heart",
          "usage_count": 13
        },
        {
          "emoji": " <https",
          "usage_count": 9
        }
      ],
      "top_channels": [
        {
          "message_count": 648,
          "name": "random"
        },
        {
          "message_count": 369,
          "name": "craigslist"
        },
        {
          "message_count": 322,
          "name": "rants"
        },
        {
          "message_count": 308,
          "name": "trash"
        },
        {
          "message_count": 220,
          "name": "networking"
        }
      ],
      "user_activity": [
        {
          "name": "Slackbot",
          "post_count": 408
        },
        {
          "name": "falconelucifero",
          "post_count": 335
        },
        {
          "name": "gabry89",
          "post_count": 304
        },
        {
          "name": "Piero Mamberti",
          "post_count": 220
        },
        {
          "name": "branzo",
          "post_count": 161
        },
        {
          "name": "Andrea Lazzarotto",
          "post_count": 153
        },
        {
          "name": "Alfonso",
          "post_count": 145
        },
        {
          "name": "grg",
          "post_count": 140
        },
        {
          "name": "rfc1459",
          "post_count": 127
        },
        {
          "name": "Francesco Tucci",
          "post_count": 122
        },
        {
          "name": "00akero",
          "post_count": 116
        },
        {
          "name": "andrea barbon",
          "post_count": 106
        },
        {
          "name": "HappyCactus (Federico Fuga)",
          "post_count": 103
        },
        {
          "name": "smarzola",
          "post_count": 90
        },
        {
          "name": "ale",
          "post_count": 90
        },
        {
          "name": "lombax85",
          "post_count": 76
        },
        {
          "name": "fp",
          "post_count": 75
        },
        {
          "name": "andreaganduglia",
          "post_count": 72
        },
        {
          "name": "Gian Maria Ricci",
          "post_count": 60
        },
        {
          "name": "Germano",
          "post_count": 59
        },
        {
          "name": "Pe46dro",
          "post_count": 54
        },
        {
          "name": "Gioxx",
          "post_count": 53
        },
        {
          "name": "Rei Ayanami",
          "post_count": 51
        },
        {
          "name": "cristiano mariani",
          "post_count": 49
        },
        {
          "name": "Ema Cymru",
          "post_count": 44
        },
        {
          "name": "frizzemole",
          "post_count": 44
        },
        {
          "name": "Emiliano",
          "post_count": 38
        },
        {
          "name": "Riccardo Trivellato",
          "post_count": 34
        },
        {
          "name": "thekoma",
          "post_count": 27
        },
        {
          "name": "doclm",
          "post_count": 26
        },
        {
          "name": "ebobferraris",
          "post_count": 23
        },
        {
          "name": "Marlon",
          "post_count": 22
        },
        {
          "name": "Giuliano Pisoni",
          "post_count": 18
        },
        {
          "name": "Manuel",
          "post_count": 18
        },
        {
          "name": "Andrea Margiovanni",
          "post_count": 18
        },
        {
          "name": "cantorjf",
          "post_count": 16
        },
        {
          "name": "kresposs",
          "post_count": 16
        },
        {
          "name": "barsa_net",
          "post_count": 16
        },
        {
          "name": "taks",
          "post_count": 14
        },
        {
          "name": "the_maxtor",
          "post_count": 14
        },
        {
          "name": "SharpEdge",
          "post_count": 13
        },
        {
          "name": "Davide Fogliarini",
          "post_count": 11
        },
        {
          "name": "liviovarriale",
          "post_count": 9
        },
        {
          "name": "ZioMarco",
          "post_count": 8
        },
        {
          "name": "bebosudo (Alberto Chiusole)",
          "post_count": 8
        },
        {
          "name": "Dren Maisey",
          "post_count": 8
        },
        {
          "name": "Lobst3r (TWF1cm8gTS4g)",
          "post_count": 7
        },
        {
          "name": "Maramazza",
          "post_count": 7
        },
        {
          "name": "Andrea G.",
          "post_count": 7
        },
        {
          "name": "Clodo ᯅ",
          "post_count": 6
        },
        {
          "name": "okch",
          "post_count": 5
        },
        {
          "name": "nomc2",
          "post_count": 5
        },
        {
          "name": "Riccardo",
          "post_count": 5
        },
        {
          "name": "HostFat",
          "post_count": 4
        },
        {
          "name": "mocolini",
          "post_count": 4
        },
        {
          "name": "x3ddario",
          "post_count": 4
        },
        {
          "name": "fnzv",
          "post_count": 3
        },
        {
          "name": "bn",
          "post_count": 3
        },
        {
          "name": "Andrea Breda",
          "post_count": 2
        },
        {
          "name": "RAW MAIN",
          "post_count": 2
        },
        {
          "name": "pistacchio00",
          "post_count": 2
        },
        {
          "name": "ivan Lunardi",
          "post_count": 1
        },
        {
          "name": "Luca Cipriani",
          "post_count": 1
        },
        {
          "name": "Micky",
          "post_count": 1
        },
        {
          "name": "Tasslehoff",
          "post_count": 1
        },
        {
          "name": "pinperepette",
          "post_count": 1
        }
      ]
    }
  );
  }, [days]);

  const handleDaysChange = (event) => {
    setDays(parseInt(event.target.value));
  };

  if (loading) return <div>Loading...</div>;
  if (!stats) return <div>Error loading stats</div>;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const renderCustomizedLabel = (props) => {
    const { x, y, width, value } = props;
    const radius = 10;

    return (
      <g>
        <text x={x + width / 2} y={y - radius} fill="#000000" textAnchor="middle" dominantBaseline="middle">
          {value}
        </text>
      </g>
    );
  };

  // Sort active_hours data by hour
  const sortedActiveHours = [...stats.active_hours].sort((a, b) => a.hour - b.hour);


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Community Statistics</h1>
      
      <div className="mb-4">
        <label htmlFor="days" className="mr-2">Select time period:</label>
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

      <p className="text-lg font-semibold mb-4">Showing stats for the last {days} days</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Top 5 Active Channels */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Top 5 Active Channels</h2>
          <BarChart width={400} height={300} data={stats.top_channels}>
            <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} height={60} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="message_count" fill="#8884d8" label={renderCustomizedLabel} />
          </BarChart>
        </div>

        {/* User Activity */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Top 10 Active Users</h2>
          <BarChart width={400} height={300} data={stats.user_activity.slice(0, 10)}>
            <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} height={60} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="post_count" fill="#82ca9d" label={renderCustomizedLabel} />
          </BarChart>
        </div>

        {/* Active Hours */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Activity by Hour</h2>
          <BarChart width={400} height={300} data={sortedActiveHours}>
            <XAxis dataKey="hour" interval={0} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="message_count" fill="#ffc658" label={renderCustomizedLabel} />
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
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
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
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : ''}>
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