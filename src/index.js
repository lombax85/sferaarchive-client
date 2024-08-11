import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Routes, Link, useLocation } from 'react-router-dom';
import './index.css';
import App from './App';
import Digest from './Digest';
import Stats from './Stats';

// Componente per il menu di navigazione
const Navigation = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");

  return (
    <nav className="bg-purple-700 p-4">
      <ul className="flex space-x-4">
        <li>
          <Link to={`/?token=${token}`} className="text-white hover:text-purple-200">Home</Link>
        </li>
        <li>
          <Link to={`/digest?token=${token}`} className="text-white hover:text-purple-200">Digest</Link>
        </li>
        <li>
          <Link to={`/stats?token=${token}`} className="text-white hover:text-purple-200">Stats</Link>
        </li>
      </ul>
    </nav>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/digest" element={<Digest />} />
        <Route path="/stats" element={<Stats />} />
      </Routes>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);