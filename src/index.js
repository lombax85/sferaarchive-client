import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './index.css';
import App from './App';
import Digest from './Digest';
import Stats from './Stats';
import { API_URL } from "./config";
import axios from "axios";
import {
  bootstrapAuth,
  buildLoginUrl,
  installAxiosUnauthorizedHandler,
} from "./auth";
import Navigation from "./Navigation";
import { AdminAccessProvider } from "./adminAccess";

const auth = bootstrapAuth();

if (!auth.token) {
  window.location.replace(buildLoginUrl(API_URL, auth.returnTo));
} else {
  axios.defaults.headers.common["Authorization"] = `Bearer ${auth.token}`;
  installAxiosUnauthorizedHandler({ axiosClient: axios, apiUrl: API_URL });

  ReactDOM.render(
    <React.StrictMode>
      <Router>
        <AdminAccessProvider>
          <Navigation />
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/digest" element={<Digest />} />
            <Route path="/stats" element={<Stats />} />
          </Routes>
        </AdminAccessProvider>
      </Router>
    </React.StrictMode>,
    document.getElementById('root')
  );
}
