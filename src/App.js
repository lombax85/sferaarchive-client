import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Hash,
  Search,
  ChevronDown,
  Link as LinkIcon,
  Calendar,
  User,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { marked } from "marked";
import parse from "html-react-parser";
import "./App.css";
import emojiDatasource from "https://cdn.jsdelivr.net/npm/emoji-datasource@15.1.2/+esm";

const API_URL = "https://slack-archive.sferait.org";

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchUserName, setSearchUserName] = useState("");
  const [searchChannelName, setSearchChannelName] = useState("");
  const [searchStartTime, setSearchStartTime] = useState("");
  const [searchEndTime, setSearchEndTime] = useState("");
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [offset, setOffset] = useState(0);
  const [selectedThread, setSelectedThread] = useState(null);
  const [threadMessages, setThreadMessages] = useState([]);
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [username, setUserName] = useState(null);
  const [optedOut, setOptedOut] = useState(false);
  const location = useLocation();
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [emoji, setEmoji] = useState([]);
  const [emojiDatasourceMap, setEmojiDatasourceMap] = useState({});
  const [userlist, setUserlist] = useState([]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");
    if (token) {
      setAccessToken(token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      window.location.href = API_URL + "/login";
    }
  }, [location]);

  useEffect(() => {
    if (accessToken) {
      axios
        .get(API_URL + "/channels")
        .then((response) => setChannels(response.data))
        .catch((error) => console.error("Error fetching channels:", error));

      axios
        .get(API_URL + "/users")
        .then((response) => setUserlist(response.data))
        .catch((error) => console.error("Error fetching users:", error));

      axios
        .get(API_URL + "/emoji")
        .then((response) => setEmoji(response.data.emoji))
        .catch((error) => console.error("Error fetching emoji:", error));

      // Create a map of emoji shortnames to unicode characters
      const emojiMap = emojiDatasource.reduce((acc, emoji) => {
        if (emoji.short_name) {
          acc[emoji.short_name] = emoji.unified;
        }
        return acc;
      }, {});
      setEmojiDatasourceMap(emojiMap);

      axios
        .get(API_URL + "/whoami")
        .then((response) => {
          setUser(response.data.user_id);
          setUserName(response.data.username);
          setOptedOut(response.data.opted_out);
        })
        .catch((error) => console.error("Error fetching whoami:", error));
    }
  }, [accessToken]);

  useEffect(() => {
    if (selectedChannel) {
      fetchMessages();
    }
  }, [selectedChannel, offset]);

  const replaceTags = (message) => {
    let emojiKeys = Object.keys(emoji);
    let emojiValues = Object.values(emoji);

    // Replace emoji using custom emoji from slack
    for (let i = 0; i < emojiKeys.length; i++) {
      if (message.message.includes(":" + emojiKeys[i] + ":")) {
        const emojiImgTag = `<img src='${emojiValues[i]}' alt='${emojiKeys[i]}' class='emoji' />`;
        const regex = new RegExp(":" + emojiKeys[i] + ":", "g");
        message.message = message.message.replace(regex, emojiImgTag);
      }
    }

    // Replace emoji using emoji-datasource
    Object.keys(emojiDatasourceMap).forEach((shortName) => {
      const regex = new RegExp(`:${shortName}:`, "g");
      const unicodeEmoji = String.fromCodePoint(
        parseInt(emojiDatasourceMap[shortName], 16)
      );
      message.message = message.message.replace(regex, unicodeEmoji);
    });

    // replace user id with username
    userlist.forEach((user) => {
      const toReplace = `<@${user.id}>`;
      if (message.message.includes(toReplace)) {
        const regex = new RegExp(toReplace, "g");
        message.message = message.message.replace(
          regex,
          `<b>@${user.name}</b>`
        );
      }
    });

    return message;
  };

  const fetchMessages = () => {
    axios
      .get(`${API_URL}/messages/${selectedChannel}?offset=${offset}`)
      .then((response) => {
        return setMessages((prevMessages) => [
          ...prevMessages,
          ...response.data.map((message) => replaceTags(message)),
        ]);
      })
      .catch((error) => console.error("Error fetching messages:", error));
  };

  const handleChannelSelect = (channelId) => {
    setSelectedChannel(channelId);
    setMessages([]);
    setOffset(0);
  };

  const handleScroll = (e) => {
    if (e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight) {
      setOffset((prevOffset) => prevOffset + 20);
    }
  };

  const handleThreadSelect = (threadTs) => {
    if (threadTs) {
      setSelectedThread(threadTs);
      axios
        .get(`${API_URL}/thread/${threadTs}`)
        .then((response) => {
          setThreadMessages(
            response.data.map((message) => replaceTags(message))
          );
        })
        .catch((error) =>
          console.error("Error fetching thread messages:", error)
        );
    }
  };

  const handleOptOut = () => {
    if (
      window.confirm(
        "Questa azione rimuoverà tutti i tuoi post per sempre e non sarà più possibile recuperarli (da questa interfaccia, non da Slack). Inoltre non potrai più consultare gli archivi. Sei sicuro?"
      )
    ) {
      axios
        .get(API_URL + "/optout")
        .then(() => setOptedOut(true))
        .catch((error) => console.error("Error opting out:", error));
    }
  };

  const handleSearch = () => {
    const searchParams = new URLSearchParams({
      query: searchQuery,
      user_name: searchUserName,
      channel_name: searchChannelName,
      start_time: searchStartTime,
      end_time: searchEndTime,
    });

    axios
      .get(`${API_URL}/searchV2?${searchParams.toString()}`)
      .then((response) => {
        setMessages(response.data);
        setSelectedChannel(null); // Clear selected channel when searching
      })
      .catch((error) => console.error("Error searching messages:", error));
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const toggleAccordion = () => {
    setIsAccordionOpen(!isAccordionOpen);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* User info bar */}
      <div className="bg-purple-700 text-white p-4">
        <div>
          Utente: {username} (ID: {user})
        </div>
        <div>
          Opt-out:{" "}
          {optedOut
            ? "Hai effettuato Opt-out. Da questo momento non puoi più consultare gli archivi."
            : "No"}
        </div>
        <div className="mt-2">
          <button
            onClick={toggleAccordion}
            className="bg-purple-900 hover:bg-purple-800 text-white font-bold py-2 px-4 rounded flex items-center"
          >
            Opzioni Avanzate
            <ChevronDown
              className={`ml-2 transform ${
                isAccordionOpen ? "rotate-180" : ""
              }`}
              size={20}
            />
          </button>
          {isAccordionOpen && (
            <div className="mt-2 p-4 bg-purple-800 rounded">
              <button
                onClick={handleOptOut}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Opt Out
              </button>
              <p className="text-sm mt-2 text-purple-200">
                Attenzione: questa azione rimuoverà tutti i tuoi post per sempre
                e non sarà più possibile recuperarli (da questa interfaccia, non
                da Slack). Inoltre non potrai più consultare gli archivi.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-purple-900 text-white p-4 overflow-y-auto">
          <h1 className="text-2xl font-bold mb-4">Canali</h1>
          <ul>
            {channels.map((channel) => (
              <li
                key={channel.id}
                className={`flex items-center mb-2 cursor-pointer ${
                  selectedChannel === channel.id ? "bg-purple-800" : ""
                }`}
                onClick={() => handleChannelSelect(channel.id)}
              >
                <Hash className="mr-2" size={18} />
                {channel.name}
              </li>
            ))}
          </ul>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search bar */}
          <div className="bg-white border-b p-4">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center bg-gray-100 rounded-md p-2">
                <Search className="text-gray-500 mr-2" size={20} />
                <input
                  type="text"
                  placeholder="Cerca messaggi..."
                  className="bg-transparent outline-none flex-1"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex space-x-2">
                <div className="flex items-center bg-gray-100 rounded-md p-2 flex-1">
                  <User className="text-gray-500 mr-2" size={20} />
                  <input
                    type="text"
                    placeholder="Nome utente..."
                    className="bg-transparent outline-none flex-1"
                    value={searchUserName}
                    onChange={(e) => setSearchUserName(e.target.value)}
                  />
                </div>
                <div className="flex items-center bg-gray-100 rounded-md p-2 flex-1">
                  <Hash className="text-gray-500 mr-2" size={20} />
                  <input
                    type="text"
                    placeholder="Nome canale..."
                    className="bg-transparent outline-none flex-1"
                    value={searchChannelName}
                    onChange={(e) => setSearchChannelName(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <div className="flex items-center bg-gray-100 rounded-md p-2 flex-1">
                  <Calendar className="text-gray-500 mr-2" size={20} />
                  <input
                    type="datetime-local"
                    placeholder="Data inizio..."
                    className="bg-transparent outline-none flex-1"
                    value={searchStartTime}
                    onChange={(e) => setSearchStartTime(e.target.value)}
                  />
                </div>
                <div className="flex items-center bg-gray-100 rounded-md p-2 flex-1">
                  <Calendar className="text-gray-500 mr-2" size={20} />
                  <input
                    type="datetime-local"
                    placeholder="Data fine..."
                    className="bg-transparent outline-none flex-1"
                    value={searchEndTime}
                    onChange={(e) => setSearchEndTime(e.target.value)}
                  />
                </div>
              </div>
              <button
                onClick={handleSearch}
                className="bg-purple-600 text-white px-4 py-2 rounded-md"
              >
                Cerca
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4" onScroll={handleScroll}>
            {messages.map((message) => (
              <div
                key={message.timestamp}
                className="mb-4 cursor-pointer hover:bg-gray-100 p-2 rounded flex items-start"
                onClick={() =>
                  handleThreadSelect(message.thread_ts || message.timestamp)
                }
              >
                <div className="flex-shrink-0 mr-3">
                  <User className="w-8 h-8 text-gray-400 bg-gray-200 rounded-full p-1" />
                </div>
                <div className="flex-grow">
                  <div className="font-semibold">{message.user_name}</div>
                  <div className="whitespace-pre-wrap parsed-content">
                    {parse(marked(message.message))}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 flex items-center">
                    <span>{formatTimestamp(message.timestamp)}</span>
                    {message.thread_count > 0 && (
                      <span className="ml-2 bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                        {message.thread_count}{" "}
                        {message.thread_count === 1 ? "risposta" : "risposte"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Thread sidebar */}
        {selectedThread && (
          <div className="w-1/3 bg-white border-l p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Thread</h3>
              <ChevronDown
                className="cursor-pointer"
                size={20}
                onClick={() => setSelectedThread(null)}
              />
            </div>
            {threadMessages.map((thread) => (
              <div key={thread.timestamp + "_thread"} className="mb-4 flex items-start">
                <div className="flex-shrink-0 mr-3">
                  <User className="w-8 h-8 text-gray-400 bg-gray-200 rounded-full p-1" />
                </div>
                <div className="flex-grow">
                  <div className="font-semibold">{thread.user_name}</div>
                  <div className="whitespace-pre-wrap parsed-content">
                    {parse(marked(thread.message))}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatTimestamp(thread.timestamp)}
                  </div>
                  {thread.permalink && (
                    <a
                      href={thread.permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-500 hover:underline text-xs mt-1"
                    >
                      <LinkIcon size={12} className="mr-1" />
                      Permalink
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
