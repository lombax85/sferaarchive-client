import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const API_URL = "https://slack-archive.sferait.org";
//const API_URL = "http://localhost:3333";

function Digest() {
  const location = useLocation();
  const [digest, setDigest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [details, setDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);


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

  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    setIsLoadingDetails(true);
    try {
      const response = await axios.post(`${API_URL}/digest_details`, { query });
      setDetails(response.data.details);
    } catch (error) {
      console.error("Error fetching digest details:", error);
      setError("Failed to fetch digest details");
    } finally {
      setIsLoadingDetails(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Digest</h1>
      {digest && (
        <div>
          <p className="text-gray-600 mb-4">Period: {digest.period}</p>
          <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none">
            <ReactMarkdown>{digest.digest}</ReactMarkdown>
          </div>
        </div>
      )}
      <form onSubmit={handleQuerySubmit} className="mt-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Fai una domanda sul digest..."
          className="w-full p-2 border rounded"
        />
        <button type="submit" className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">
          Invia domanda
        </button>
      </form>
      {isLoadingDetails && <div>Caricamento dettagli...</div>}
      {details && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Dettagli</h2>
          <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none">
            <ReactMarkdown>{details}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}

export default Digest;