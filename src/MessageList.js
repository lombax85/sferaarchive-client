import React from 'react';

function MessageList({ messages, onThreadSelect }) {
  return (
    <div className="message-list">
      {messages.map(message => (
        <div key={message.timestamp} className="message" onClick={() => onThreadSelect(message.thread_ts ?? message.timestamp)}>
          <p><strong>{message.user_name}</strong>: {message.message}</p>
          <span>{new Date(parseFloat(message.timestamp) * 1000).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

export default MessageList;