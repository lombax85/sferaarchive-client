import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { marked } from 'marked';
import parse from 'html-react-parser';

const API_URL = "https://slack-archive.sferait.org";

function Digest() {
  const location = useLocation();
  const [digest, setDigest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");

    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchDigest();
    } else {
      setError("No token provided");
      setIsLoading(false);
    }
  }, [location]);

  const fetchDigest = async () => {
    try {
      const response = await axios.post(`${API_URL}/generate_digest`);
      setDigest(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching digest:", error);
      setError("Failed to fetch digest");
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Genero il digest...la prima generazione delle ultime 24h può richiedere qualche minuto, non abbandonare la pagina</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Digest</h1>
      {digest && (
        <div>
          <p className="text-gray-600 mb-4">Period: {digest.period}</p>
          <div className="prose max-w-none">
            {parse(marked(digest.digest))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Digest;