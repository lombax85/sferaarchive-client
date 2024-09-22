import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { API_URL } from './config';
import { ChevronDown, ChevronUp } from 'lucide-react';

function Digest() {
  const location = useLocation();
  const [digest, setDigest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [details, setDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [podcastContent, setPodcastContent] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPodcastContentExpanded, setIsPodcastContentExpanded] = useState(false);
  const [podcastAvailable, setPodcastAvailable] = useState(false);
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");

    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchDigest();
      fetchPodcastContent();
    } else {
      setError("No token provided");
      setIsLoading(false);
    }
  }, [location]);

  useEffect(() => {
    if (audioRef.current) {
      const token = axios.defaults.headers.common["Authorization"];
      
      fetch(`${API_URL}/get_podcast_audio`, {
        headers: {
          'Authorization': token
        }
      })
      .then(response => response.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        audioRef.current.src = url;
      })
      .catch(error => console.error("Error fetching audio:", error));
    }
  }, [podcastContent]);

  const fetchDigest = async () => {
    try {
      const response = await axios.post(`${API_URL}/generate_digest`, {});
      setDigest(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching digest:", error);
      setError("Failed to fetch digest");
      setIsLoading(false);
    }
  };

  const fetchPodcastContent = async () => {
    try {
      const response = await axios.get(`${API_URL}/get_podcast_content`, {});
      setPodcastContent(response.data.podcast_content);
      setPodcastAvailable(true);
    } catch (error) {
      console.error("Error fetching podcast content:", error);
      setPodcastAvailable(false);
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current.paused) {
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && progressBarRef.current) {
      const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      progressBarRef.current.style.width = `${progress}%`;
    }
  };

  const handleSeek = (e) => {
    if (audioRef.current && progressBarRef.current) {
      const bounds = e.currentTarget.getBoundingClientRect();
      const seekPosition = (e.clientX - bounds.left) / bounds.width;
      audioRef.current.currentTime = seekPosition * audioRef.current.duration;
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

  const handleGenerateAgain = () => {
    setIsLoading(true);
    axios.post(`${API_URL}/generate_digest`, { force_generate: true })
      .then(response => {
        setDigest(response.data);
        setIsLoading(false);
      })
      .catch(error => {
        setError(error);
        setIsLoading(false);
      });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Digest</h1>
      
      {podcastAvailable && podcastContent && (
        <div className="mt-8 mb-8">
          <h2 className="text-xl font-bold mb-4">Podcast Version</h2>
          <div className="bg-gray-100 p-4 rounded-lg">
            <audio 
              ref={audioRef}
              onTimeUpdate={handleTimeUpdate}
              className="w-full mb-4"
            />
            <div className="flex items-center mb-4">
              <button onClick={togglePlayPause} className="bg-blue-500 text-white px-4 py-2 rounded-full mr-4">
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              <div className="flex-grow bg-gray-300 h-2 rounded-full cursor-pointer" onClick={handleSeek}>
                <div ref={progressBarRef} className="bg-blue-500 h-full rounded-full"></div>
              </div>
            </div>
            <div 
              className="flex items-center cursor-pointer" 
              onClick={() => setIsPodcastContentExpanded(!isPodcastContentExpanded)}
            >
              <h3 className="text-lg font-semibold mr-2">Podcast Content</h3>
              {isPodcastContentExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
            {isPodcastContentExpanded && (
              <div className="prose prose-sm mt-2">
                <ReactMarkdown>{podcastContent}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      )}

      {digest && (
        <div>
          <p className="text-gray-600 mb-4">Period: {digest.period}</p>
          <div className="prose prose-sm sm:prose lg:prose-lg max-w">
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
      <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded" onClick={handleGenerateAgain}>
        Rigenera il digest
      </button>
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