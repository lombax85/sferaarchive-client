import React, { useState, useEffect, useRef } from 'react';
import { Rnd } from 'react-rnd';
import { X, Send } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';

const Chatbot = ({ position, size, onResize, onClose }) => {
  const [messages, setMessages] = useState([
    { user_name: 'AI', message: 'How can I help you?', timestamp: Date.now() / 1000 }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [context, setContext] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const isMobile = window.innerWidth <= 768;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '') return;

    const newMessage = { user_name: 'User', message: inputMessage, timestamp: Date.now() / 1000 };
    setMessages(prevMessages => [...prevMessages, newMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/chat`, {
        message: inputMessage,
        context: context,
        conversation: [...messages, newMessage] // Include the new message in the conversation
      });

      if (response.data.status === 'success') {
        setMessages(prevMessages => [...prevMessages, response.data.conversation[response.data.conversation.length - 1]]);
      } else {
        console.error('Error from chat API:', response.data.error);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Rnd
      default={{
        x: position.x,
        y: position.y,
        width: size.width,
        height: size.height,
      }}
      minWidth={300}
      minHeight={400}
      bounds="window"
      onDragStop={(e, d) => onResize(null, null, null, null, { x: d.x, y: d.y })}
      onResize={(e, direction, ref, delta, position) =>
        onResize(e, direction, ref, delta, position)
      }
      disableDragging={isMobile}
      enableResizing={!isMobile}
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'white',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
      className={isMobile ? 'fixed inset-0 z-50' : ''}
    >
      <div className="bg-purple-700 text-white p-2 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Assistant</h3>
        <button onClick={onClose} className="text-white">
          <X size={20} />
        </button>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-4 ${msg.user_name === 'AI' ? 'text-left' : 'text-right'}`}
          >
            <div
              className={`inline-block p-2 rounded-lg ${
                msg.user_name === 'AI' ? 'bg-gray-200 text-gray-800' : 'bg-purple-600 text-white'
              }`}
            >
              {msg.message}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {new Date(msg.timestamp * 1000).toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t">
        <div className="flex items-center">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            className="bg-purple-600 text-white p-2 rounded-r-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-6 h-6 border-t-2 border-white rounded-full animate-spin"></div>
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </div>
    </Rnd>
  );
};

export default Chatbot;