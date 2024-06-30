import React from 'react';

function Thread({ messages }) {
  return (
    <div className="thread">
      {messages.map(message => (
        <div key={message.timestamp} className="message">
          <p><strong>{message.user_name}</strong>: {message.message}</p>
          <span>{new Date(parseFloat(message.timestamp) * 1000).toLocaleString()}</span>
          &nbsp;
          { message.permalink && 
            <a target="_blank" href={`${message.permalink}`}>Permalink</a>
          }
        </div>
      ))}
    </div>
  );
}

export default Thread;