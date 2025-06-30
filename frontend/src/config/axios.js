// src/config/axios.js

import axios from "axios";

// Create a new Axios instance
const api = axios.create({
  baseURL:
    process.env.NODE_ENV === "development"
      ? "http://127.0.0.1:5000"
      : "https://chat-app-backend-fs2e.onrender.com",
  withCredentials: true, // ✅ IMPORTANT
  // <-- Replace with your actual backend URL
});

export default api;
