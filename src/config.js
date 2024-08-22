const isDevelopment = process.env.NODE_ENV === 'development';

export const API_URL = isDevelopment
  ? "http://127.0.0.1:5000"
  : "https://slack-archive.sferait.org";