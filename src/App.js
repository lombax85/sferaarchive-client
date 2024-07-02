import React, { useState, useEffect } from "react";
import axios from "axios";
import { MessageSquare, Hash, Search, ChevronDown } from 'lucide-react';
import { useLocation } from "react-router-dom";

const API_URL = "https://slack-archive.sferait.org";

function App() {
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
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

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
      axios.get(API_URL + "/channels")
        .then(response => setChannels(response.data))
        .catch(error => console.error("Error fetching channels:", error));

      axios.get(API_URL + "/whoami")
        .then(response => {
          setUser(response.data.user_id);
          setUserName(response.data.username);
          setOptedOut(response.data.opted_out);
        })
        .catch(error => console.error("Error fetching whoami:", error));
    }
  }, [accessToken]);

  useEffect(() => {
    if (selectedChannel) {
      fetchMessages();
    }
  }, [selectedChannel, offset]);

  const fetchMessages = () => {
    axios.get(`${API_URL}/messages/${selectedChannel}?offset=${offset}`)
      .then(response => setMessages(prevMessages => [...prevMessages, ...response.data]))
      .catch(error => console.error("Error fetching messages:", error));
  };

  const handleChannelSelect = (channelId) => {
    setSelectedChannel(channelId);
    setMessages([]);
    setOffset(0);
  };

  const handleScroll = (e) => {
    if (e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight) {
      setOffset(prevOffset => prevOffset + 20);
    }
  };

  const handleThreadSelect = (threadTs) => {
    if (threadTs) {
      setSelectedThread(threadTs);
      axios.get(`${API_URL}/thread/${threadTs}`)
        .then(response => 
          {
            setThreadMessages(response.data)
          })
        .catch(error => console.error("Error fetching thread messages:", error));
    }
  };

  const handleOptOut = () => {
    if (window.confirm("Questa azione rimuoverà tutti i tuoi post (inizialmente solo in softdelete)?")) {
      axios.get(API_URL + "/optout")
        .then(() => setOptedOut(true))
        .catch(error => console.error("Error opting out:", error));
    }
  };

  const handleOptIn = () => {
    if (window.confirm("Torni dei nostri?")) {
      axios.get(API_URL + "/optin")
        .then(() => setOptedOut(false))
        .catch(error => console.error("Error opting in:", error));
    }
  };

  const handleSearch = () => {
    axios.get(`${API_URL}/search?query=${searchQuery}`)
      .then(response => 
      {
        setMessages(response.data);
      }
      )
      .catch(error => console.error("Error searching messages:", error));
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* User info bar */}
      <div className="bg-purple-700 text-white p-4">
        <div>Utente: {username} (ID: {user})</div>
        <div>Opt-out: {optedOut ? "Sì" : "No"}</div>
        <button 
          onClick={optedOut ? handleOptIn : handleOptOut}
          className="bg-purple-900 hover:bg-purple-800 text-white font-bold py-2 px-4 rounded mt-2"
        >
          {optedOut ? "Opt In" : "Opt Out"}
        </button>
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
                  selectedChannel === channel.id ? 'bg-purple-800' : ''
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
            <div className="flex items-center bg-gray-100 rounded-md p-2">
              <Search className="text-gray-500 mr-2" size={20} />
              <input
                type="text"
                placeholder="Cerca messaggi..."
                className="bg-transparent outline-none flex-1"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={handleSearch}
                className="bg-purple-600 text-white px-4 py-2 rounded-md ml-2"
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
                className="mb-4 cursor-pointer hover:bg-gray-100 p-2 rounded"
                onClick={() => handleThreadSelect(message.thread_ts || message.timestamp)}
              >
                <div className="font-semibold">{message.user_name}</div>
                <div className="whitespace-pre-wrap">{message.message}</div>
                <div className="text-xs text-gray-500">{formatTimestamp(message.timestamp)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Thread sidebar */}
        {selectedThread && (
          <div className="w-80 bg-white border-l p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Thread</h3>
              <ChevronDown
                className="cursor-pointer"
                size={20}
                onClick={() => setSelectedThread(null)}
              />
            </div>
            {threadMessages.map((thread) => (
              <div key={thread.timestamp} className="mb-4">
                <div className="font-semibold">{thread.user_name}</div>
                <div className="whitespace-pre-wrap">{thread.message}</div>
                <div className="text-xs text-gray-500">{formatTimestamp(thread.timestamp)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;