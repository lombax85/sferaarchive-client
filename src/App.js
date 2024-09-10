import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import {
  Hash,
  Search,
  ChevronDown,
  Link as LinkIcon,
  Calendar,
  User,
  Menu,
  Info,
  MessageSquare,
  ArrowUpDown,
  ArrowUp,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { marked } from "marked";
import parse from "html-react-parser";
import "./App.css";
import emojiDatasource from "https://cdn.jsdelivr.net/npm/emoji-datasource@15.1.2/+esm";
import { API_URL } from "./config";
import Chatbot from "./components/Chatbot";

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [useEmbeddingSearch, setUseEmbeddingSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDateTimeSupported, setIsDateTimeSupported] = useState(true);
  const [aiOptedOut, setAiOptedOut] = useState(false);
  const [isSearchBarExpanded, setIsSearchBarExpanded] = useState(false);
  const [avatars, setAvatars] = useState({});
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [chatbotPosition, setChatbotPosition] = useState({ x: 0, y: 0 });
  const [chatbotSize, setChatbotSize] = useState({ width: 300, height: 400 });
  const chatbotButtonRef = useRef(null);
  const [chatMessages, setChatMessages] = useState([
    {
      user_name: "AI",
      message: "Come posso aiutarti?",
      timestamp: Date.now() / 1000,
    },
  ]);
  const [chatContext, setChatContext] = useState([]);
  const [hasSearchResults, setHasSearchResults] = useState(false);
  const [isChatbotMinimized, setIsChatbotMinimized] = useState(false);
  const isMobile = window.innerWidth <= 768;
  const [channelSearchQuery, setChannelSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("date");
  const [tooltipVisible, setTooltipVisible] = useState(false); // Stato per la visibilità del tooltip

  useEffect(() => {
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    // Set to false for iOS and Safari, true for others
    setIsDateTimeSupported(!(isIOS || isSafari));
  }, []);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");
    if (token) {
      setAccessToken(token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
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
        .then((response) => {
          let avatars = {};
          response.data.forEach((user) => {
            avatars[user.name] = user.avatar;
          });
          setAvatars(avatars);
          setUserlist(response.data);
        })
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
          setAiOptedOut(response.data.opted_out_ai);
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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleSearchBar = () => {
    setIsSearchBarExpanded(!isSearchBarExpanded);
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

  const handleAiOptOutToggle = () => {
    axios
      .get(API_URL + "/optout_ai")
      .then((response) => {
        setAiOptedOut(response.data.opted_out_ai);
      })
      .catch((error) => console.error("Error toggling AI opt-out:", error));
  };

  const handleSearch = () => {
    setIsLoading(true);
    const searchParams = new URLSearchParams({
      query: searchQuery,
      user_name: searchUserName,
      channel_name: searchChannelName,
      start_time: searchStartTime,
      end_time: searchEndTime,
    });

    const searchEndpoint = useEmbeddingSearch ? "searchEmbeddings" : "searchV2";

    axios
      .get(`${API_URL}/${searchEndpoint}?${searchParams.toString()}`)
      .then((response) => {
        setMessages(response.data);
        setSelectedChannel(null);
        setIsLoading(false);
        setHasSearchResults(response.data.length > 0);
      })
      .catch((error) => {
        console.error("Error searching messages:", error);
        setIsLoading(false);
        setHasSearchResults(false);
      });
  };

  const formatDateTimeForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toISOString().slice(0, 16);
  };

  const handleDateTimeChange = (setter) => (e) => {
    const { value } = e.target;
    setter(value);
  };

  const isValidDateTime = (dateTimeString) => {
    const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
    if (!regex.test(dateTimeString)) return false;
    const date = new Date(dateTimeString);
    return !isNaN(date.getTime());
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const toggleAccordion = () => {
    setIsAccordionOpen(!isAccordionOpen);
  };

  const toggleChatbot = () => {
    if (!isChatbotOpen) {
      if (chatbotPosition.x === 0 && chatbotPosition.y === 0) {
        // Se è la prima apertura o non è stata impostata una posizione precedente
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const chatbotWidth = 600;
        const chatbotHeight = 500;
        const margin = 20;

        const x = windowWidth - chatbotWidth - margin;
        const y = windowHeight - chatbotHeight - margin;

        setChatbotPosition({ x, y });
      }
      // Altrimenti, usa la posizione salvata nello state
    }
    setIsChatbotOpen(!isChatbotOpen);
  };

  const handleChatbotResize = (e, direction, ref, delta, position) => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let newWidth = ref ? parseInt(ref.style.width) : chatbotSize.width;
    let newHeight = ref ? parseInt(ref.style.height) : chatbotSize.height;
    let newX = position.x;
    let newY = position.y;

    // Assicurati che il chatbot non esca dalla finestra
    if (newX < 0) newX = 0;
    if (newY < 0) newY = 0;
    if (newX + newWidth > windowWidth) newX = windowWidth - newWidth;
    if (newY + newHeight > windowHeight) newY = windowHeight - newHeight;

    const newPosition = { x: newX, y: newY };
    setChatbotSize({ width: newWidth, height: newHeight });
    setChatbotPosition(newPosition);
  };

  const Tooltip = ({ content, children }) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
      <div className="relative inline-block">
        <div
          onMouseEnter={() => setIsVisible(true)}
          onMouseLeave={() => setIsVisible(false)}
        >
          {children}
        </div>
        {isVisible && (
          <div className="absolute z-10 w-64 p-2 text-sm bg-gray-800 text-white rounded shadow-lg right-0 top-full mt-2">
            {content}
          </div>
        )}
      </div>
    );
  };

  const Spinner = () => (
    <div className="fixed top-0 left-0 right-0 bottom-0 w-full h-screen z-50 overflow-hidden bg-gray-700 opacity-75 flex flex-col items-center justify-center">
      <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
      <h2 className="text-center text-white text-xl font-semibold">
        Loading...
      </h2>
      <p className="w-1/3 text-center text-white">
        This may take a few seconds, please don't close this page.
      </p>
    </div>
  );

  const handleChatMessage = async (inputMessage) => {
    const newMessage = {
      user_name: "User",
      message: inputMessage,
      timestamp: Date.now() / 1000,
    };
    setChatMessages((prevMessages) => [...prevMessages, newMessage]);

    try {
      const response = await axios.post(`${API_URL}/chat`, {
        message: inputMessage,
        context: chatContext,
        conversation: [...chatMessages, newMessage],
      });

      if (response.data.status === "success") {
        setChatMessages((prevMessages) => [
          ...prevMessages,
          response.data.conversation[response.data.conversation.length - 1],
        ]);
      } else {
        console.error("Error from chat API:", response.data.error);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Aggiungi questa nuova funzione per resettare le conversazioni
  const resetChatConversation = () => {
    setChatMessages([
      {
        user_name: "AI",
        message: "Come posso aiutarti?",
        timestamp: Date.now() / 1000,
      },
    ]);
    setChatContext([]);
  };

  const handleChatWithThread = () => {
    // Convert thread messages to the context format
    const threadContext = threadMessages.map((msg) => ({
      user_name: msg.user_name,
      message: msg.message,
    }));

    setChatContext(threadContext);
    setChatMessages([
      {
        user_name: "AI",
        message:
          "Fai pure le tue domande rispetto alla conversazione precedente",
        timestamp: Date.now() / 1000,
      },
    ]);

    if (!isChatbotOpen) {
      toggleChatbot();
    }
  };

  const handleChatWithSearchResults = () => {
    // Convert search results to the context format
    const searchResultsContext = messages.map((msg) => ({
      user_name: msg.user_name,
      message: msg.message,
    }));

    setChatContext(searchResultsContext);
    setChatMessages([
      {
        user_name: "AI",
        message:
          "Posso aiutarti con i risultati della ricerca. Cosa vorresti sapere?",
        timestamp: Date.now() / 1000,
      },
    ]);

    if (!isChatbotOpen) {
      toggleChatbot();
    }
  };

  const toggleChatbotMinimize = () => {
    setIsChatbotMinimized(!isChatbotMinimized);
  };

  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === "date" ? "alphabetical" : "date"));
  };

  const filteredChannels = useMemo(() => {
    return channels
      .filter((channel) =>
        channel.name.toLowerCase().includes(channelSearchQuery.toLowerCase())
      )
      .sort((a, b) => {
        if (sortOrder === "date") {
          return b.last_message_timestamp - a.last_message_timestamp; // Ordinamento decrescente
        } else {
          return a.name.localeCompare(b.name); // Ordinamento alfabetico
        }
      });
  }, [channels, channelSearchQuery, sortOrder]);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {isLoading && <Spinner />}
      {/* User info bar */}
      <div className="bg-purple-700 text-white p-2">
        <div className="flex justify-between items-center">
          <button
            onClick={toggleAccordion}
            className="bg-purple-800 hover:bg-purple-600 text-white font-bold py-1 px-2 rounded flex items-center text-sm"
          >
            Opzioni Avanzate
            <ChevronDown
              className={`ml-1 transform ${
                isAccordionOpen ? "rotate-180" : ""
              }`}
              size={16}
            />
          </button>
          <div className="flex items-center space-x-2">
            <button
              ref={chatbotButtonRef}
              onClick={toggleChatbot}
              className="bg-purple-800 hover:bg-purple-600 text-white font-bold py-1 px-2 rounded flex items-center text-sm"
            >
              Assistant
              <MessageSquare className="ml-1" size={16} />
            </button>
            <button
              onClick={toggleSidebar}
              className="lg:hidden bg-purple-800 p-1 rounded"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
        {isAccordionOpen && (
          <div className="mt-2 p-2 bg-purple-800 rounded text-sm">
            <div className="flex items-center space-x-4">
              <div>
                <span className="font-semibold">{username}</span> (ID: {user})
              </div>
              <div>Opt-out: {optedOut ? "Sì" : "No"}</div>
              <div>AI Opt-out: {aiOptedOut ? "Sì" : "No"}</div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleOptOut}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
              >
                Opt Out from archive (WARNING)
              </button>
              <button
                onClick={handleAiOptOutToggle}
                className="bg-yellow-600 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
              >
                {aiOptedOut ? "AI Opt-in" : "AI Opt-out"}
              </button>
            </div>
            <p className="text-xs mt-1 text-purple-200">
              Attenzione: l'opt out rimuoverà tutti i tuoi post permanentemente.
              L'opt-out AI è reversibile.
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
          className={`${
            isSidebarOpen ? "block" : "hidden"
          } lg:block w-64 bg-purple-900 text-white p-4 overflow-y-auto`}
        >
          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">Canali</h1>
              <div className="relative">
                <button
                  onClick={toggleSortOrder}
                  className="flex items-center"
                  onMouseEnter={() => setTooltipVisible(true)}
                  onMouseLeave={() => setTooltipVisible(false)}
                >
                  <ArrowUpDown size={20} className="text-white" />
                </button>
                {tooltipVisible && (
                  <div className="absolute right-0 top-full mt-1 z-10">
                    <span className="bg-gray-800 text-white text-xs p-1 rounded whitespace-nowrap">
                      Ordinamento: {sortOrder === "date" ? "Data ultimo post" : "Alfabetico"}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <input
              type="text"
              placeholder="Cerca canali..."
              className="w-full px-3 py-2 bg-purple-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
              value={channelSearchQuery}
              onChange={(e) => setChannelSearchQuery(e.target.value)}
            />
          </div>
          <ul>
            {filteredChannels.map((channel) => (
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
          {/* Search bar toggle */}
          <div className="bg-white border-b p-2 flex justify-between items-center">
            <button
              onClick={toggleSearchBar}
              className="bg-purple-600 text-white px-4 py-2 rounded-md flex items-center"
            >
              <Search className="mr-2" size={20} />
              {isSearchBarExpanded ? "Nascondi ricerca" : "Mostra ricerca"}
            </button>
            {!isSearchBarExpanded && (
              <div className="text-sm text-gray-500">
                {searchQuery && `Ricerca: "${searchQuery}"`}
              </div>
            )}
          </div>

          {/* Search bar */}
          {isSearchBarExpanded && (
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
                  <div className="relative">
                    <Tooltip
                      content={
                        <div>
                          <p className="font-bold mb-1">
                            Istruzioni di ricerca:
                          </p>
                          <ul className="list-disc pl-4">
                            <li>
                              Usa le virgolette ("") per cercare una frase
                              esatta
                            </li>
                            <li>
                              Altrimenti, verranno cercate tutte le parole in
                              qualsiasi ordine
                            </li>
                          </ul>
                        </div>
                      }
                    >
                      <Info
                        className="text-gray-500 ml-2 cursor-help"
                        size={20}
                      />
                    </Tooltip>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
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

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <div className="flex items-center bg-gray-100 rounded-md p-2 flex-1">
                    <Calendar className="text-gray-500 mr-2" size={20} />
                    {isDateTimeSupported ? (
                      <input
                        type="datetime-local"
                        className="bg-transparent outline-none flex-1"
                        value={formatDateTimeForInput(searchStartTime)}
                        onChange={handleDateTimeChange(setSearchStartTime)}
                      />
                    ) : (
                      <input
                        type="text"
                        placeholder="Data inizio (YYYY-MM-DDTHH:mm)"
                        className="bg-transparent outline-none flex-1"
                        value={formatDateTimeForInput(searchStartTime)}
                        onChange={handleDateTimeChange(setSearchStartTime)}
                        pattern="\d{4}-\d{2}-\d{2}T\d{2}:\d{2}"
                      />
                    )}
                  </div>
                  <div className="flex items-center bg-gray-100 rounded-md p-2 flex-1">
                    <Calendar className="text-gray-500 mr-2" size={20} />
                    {isDateTimeSupported ? (
                      <input
                        type="datetime-local"
                        className="bg-transparent outline-none flex-1"
                        value={formatDateTimeForInput(searchEndTime)}
                        onChange={handleDateTimeChange(setSearchEndTime)}
                      />
                    ) : (
                      <input
                        type="text"
                        placeholder="Data fine (YYYY-MM-DDTHH:mm)"
                        className="bg-transparent outline-none flex-1"
                        value={formatDateTimeForInput(searchEndTime)}
                        onChange={handleDateTimeChange(setSearchEndTime)}
                        pattern="\d{4}-\d{2}-\d{2}T\d{2}:\d{2}"
                      />
                    )}
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="embeddingSearch"
                    checked={useEmbeddingSearch}
                    onChange={(e) => setUseEmbeddingSearch(e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="embeddingSearch">Use Embedding Search</label>
                </div>
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleSearch}
                    className="bg-purple-600 text-white px-4 py-2 rounded-md"
                  >
                    Cerca
                  </button>
                  {hasSearchResults && (
                    <button
                      onClick={handleChatWithSearchResults}
                      className="bg-purple-600 text-white px-4 py-2 rounded-md flex items-center"
                    >
                      Chat with search results
                      <MessageSquare className="ml-2" size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

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
                  {avatars[message.user_name] ? (
                    <img
                      src={avatars[message.user_name]}
                      alt={`${message.user_name}'s avatar`}
                      className="w-8 h-8 rounded-full transition-transform duration-200 ease-in-out hover:scale-125"
                    />
                  ) : (
                    <User className="w-8 h-8 text-gray-400 bg-gray-200 rounded-full p-1 transition-transform duration-200 ease-in-out hover:scale-125" />
                  )}
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
                        {message.thread_count - 1}{" "}
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
          <div className="w-full lg:w-1/3 bg-white border-l p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Thread</h3>
              <div className="flex items-center">
                <button
                  onClick={handleChatWithThread}
                  className="bg-purple-600 text-white px-2 py-1 rounded-md flex items-center mr-2 text-sm"
                >
                  Chat with thread
                  <MessageSquare className="ml-1" size={16} />
                </button>
                <ChevronDown
                  className="cursor-pointer"
                  size={20}
                  onClick={() => setSelectedThread(null)}
                />
              </div>
            </div>
            {threadMessages.map((thread) => (
              <div
                key={thread.timestamp + "_thread"}
                className="mb-4 flex items-start"
              >
                <div className="flex-shrink-0 mr-3">
                  {avatars[thread.user_name] ? (
                    <img
                      src={avatars[thread.user_name]}
                      alt={`${thread.user_name}'s avatar`}
                      className="w-8 h-8 rounded-full transition-transform duration-200 ease-in-out hover:scale-125"
                    />
                  ) : (
                    <User className="w-8 h-8 text-gray-400 bg-gray-200 rounded-full p-1 transition-transform duration-200 ease-in-out hover:scale-125" />
                  )}
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

      {isChatbotOpen && (
        <Chatbot
          position={chatbotPosition}
          size={chatbotSize}
          onResize={handleChatbotResize}
          onClose={() => setIsChatbotOpen(false)}
          messages={chatMessages}
          onSendMessage={handleChatMessage}
          onResetConversation={resetChatConversation}
          context={chatContext}
          isMobile={isMobile}
          isMinimized={isChatbotMinimized}
          onToggleMinimize={toggleChatbotMinimize}
        />
      )}
    </div>
  );
}

export default App;
