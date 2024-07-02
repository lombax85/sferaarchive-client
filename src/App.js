import React, { useState } from 'react';
import { MessageSquare, Hash, Search, ChevronDown } from 'lucide-react';
import './index.css';  // o './App.css' a seconda di come l'hai chiamato

// Dati mock
const mockChannels = [
  { id: 1, name: 'generale' },
  { id: 2, name: 'random' },
  { id: 3, name: 'progetti' },
];

const mockMessages = [
  { id: 1, user: 'Alice', content: 'Ciao a tutti!', timestamp: '10:00', channelId: 1 },
  { id: 2, user: 'Bob', content: 'Ehi Alice, come va?', timestamp: '10:05', channelId: 1 },
  { id: 3, user: 'Charlie', content: 'Qualcuno ha novità sul progetto X?', timestamp: '10:10', channelId: 1 },
];

const mockThreads = [
  { id: 1, parentId: 2, user: 'Alice', content: 'Tutto bene, grazie! E tu?', timestamp: '10:07' },
  { id: 2, parentId: 2, user: 'Bob', content: 'Anche io, grazie!', timestamp: '10:08' },
];

export default function SlackClone() {

  const [selectedChannel, setSelectedChannel] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedThread, setSelectedThread] = useState(null);

  const filteredMessages = mockMessages.filter(
    (message) =>
      message.channelId === selectedChannel &&
      (message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
       message.user.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-purple-900 text-white p-4">
        <h1 className="text-2xl font-bold mb-4">Workspace</h1>
        <ul>
          {mockChannels.map((channel) => (
            <li
              key={channel.id}
              className={`flex items-center mb-2 cursor-pointer ${
                selectedChannel === channel.id ? 'bg-purple-800' : ''
              }`}
              onClick={() => setSelectedChannel(channel.id)}
            >
              <Hash className="mr-2" size={18} />
              {channel.name}
            </li>
          ))}
        </ul>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
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
            />
          </div>
        </div>

        {/* Channel header */}
        <div className="bg-white border-b p-4">
          <h2 className="text-xl font-semibold">
            #{mockChannels.find((c) => c.id === selectedChannel)?.name}
          </h2>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredMessages.map((message) => (
            <div
              key={message.id}
              className="mb-4 cursor-pointer"
              onClick={() => setSelectedThread(message.id)}
            >
              <div className="font-semibold">{message.user}</div>
              <div>{message.content}</div>
              <div className="text-xs text-gray-500">{message.timestamp}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Thread sidebar */}
      {selectedThread && (
        <div className="w-80 bg-white border-l p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Thread</h3>
            <ChevronDown
              className="cursor-pointer"
              size={20}
              onClick={() => setSelectedThread(null)}
            />
          </div>
          {mockThreads
            .filter((t) => t.parentId === selectedThread)
            .map((thread) => (
              <div key={thread.id} className="mb-4">
                <div className="font-semibold">{thread.user}</div>
                <div>{thread.content}</div>
                <div className="text-xs text-gray-500">{thread.timestamp}</div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}