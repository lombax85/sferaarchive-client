import React from 'react';
import { marked } from 'marked';
import parse from 'html-react-parser';

function Thread({ messages }) {
  return (
    <div className="thread">
      {messages.map(message => (
        <div key={message.timestamp} className="message">
           <p><strong>{message.user_name}</strong>:</p>
          <div>{parse(marked(message.message))}</div>
          <span>{new Date(parseFloat(message.timestamp) * 1000).toLocaleString()}</span>
          &nbsp;
          {message.permalink &&
            <a target="_blank" rel="noopener noreferrer" href={`${message.permalink}`}>Permalink</a>
          }
        </div>
      ))}
    </div>
  );
}

export default Thread;