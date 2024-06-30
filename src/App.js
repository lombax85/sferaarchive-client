import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";
import ChannelList from "./ChannelList";
import MessageList from "./MessageList";
import SearchBar from "./SearchBar";
import Thread from "./Thread";
import { useLocation } from "react-router-dom";

function App() {
  const API_URL = "https://slack-archive.sferait.org";

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

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");
    if (token) {
      setAccessToken(token);
    } else {
      window.location.href = API_URL + "/login";
    }
  }, [location]);

  useEffect(() => {
    // fetch the channels
    axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    axios
      .get(API_URL + "/channels")
      .then((response) => setChannels(response.data))
      .catch((error) => console.error("Error fetching channels:", error));

    axios
      .get(API_URL + "/whoami")
      .then((response) => { 
        setUser(response.data.user_id)
        setUserName(response.data.username)
        setOptedOut(response.data.opted_out) 
      })
      .catch((error) => console.error("Error fetching whoami:", error));
  }, [accessToken]);

  useEffect(() => {
    if (selectedChannel) {
      axios
        .get(`${API_URL}/messages/${selectedChannel}?offset=${offset}`)
        .then((response) =>
          setMessages((prevMessages) => [...prevMessages, ...response.data])
        )
        .catch((error) => console.error("Error fetching messages:", error));
    }
  }, [selectedChannel, offset]);

  useEffect(() => {
    if (selectedThread) {
      axios
        .get(`${API_URL}/thread/${selectedThread}`)
        .then((response) => setThreadMessages(response.data))
        .catch((error) =>
          console.error("Error fetching thread messages:", error)
        );
    }
  }, [selectedThread]);

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

  const handleThreadSelect = (messageId) => {
    setSelectedThread(messageId);
  };

  return (
    <div className="App">
      <div className="header">
        Ciao, al momento Opt Out è in beta. I post non vengono eliminati realmente dal db, ma vengono nascosti tramite softdelete.
        Lo proviamo per un po' per vedere come si comporta il sistema. Più avanti elimineremo fisicamente i post <br /><br />
        Tu sei: {user} - {username} &nbsp; <br />

        Hai fatto OptOut?: {optedOut ? "Sì" : "No"}
        <br /><br />

        <button onClick={
          () => {
            // show a confirmation dialog
            if (window.confirm("Questa azione rimuoverà tutti i tuoi post (inizialmente solo in softdelete)?")) {
              axios.get(API_URL + "/optout")
              .then((response) => setOptedOut(true))
              .catch((error) => console.error("Error opting out:", error));
            }
          }
        }>Opt Out</button>

        <button onClick={
          () => {
            // show a confirmation dialog
            if (window.confirm("Torni dei nostri?")) {
              axios.get(API_URL + "/optin")
              .then((response) => setOptedOut(true))
              .catch((error) => console.error("Error opting in:", error));
            }
          }
        }>Opt In</button>

      </div>
      <div className="main-content">
        <ChannelList channels={channels} onSelect={handleChannelSelect} />
        <div className="message-container" onScroll={handleScroll}>
          <SearchBar setMessages={setMessages} />
          <MessageList
            messages={messages}
            onThreadSelect={handleThreadSelect}
          />
        </div>
        {selectedThread && (
          <div className="thread-container">
            <Thread messages={threadMessages} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
