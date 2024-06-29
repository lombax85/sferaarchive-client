import React from 'react';

function ChannelList({ channels, onSelect }) {
  return (
    <div className="channel-list">
      <h2>Canali</h2>
      <ul>
        {channels.map(channel => (
          <li key={channel.id} onClick={() => onSelect(channel.id)}>
            {channel.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ChannelList;