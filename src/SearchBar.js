import React, { useState } from 'react';
import axios from 'axios';

function SearchBar({ setMessages }) {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    axios.get(`/search?query=${query}`)
      .then(response => setMessages(response.data))
      .catch(error => console.error('Error searching messages:', error));
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Cerca nei messaggi..."
      />
      <button onClick={handleSearch}>Cerca</button>
    </div>
  );
}

export default SearchBar;