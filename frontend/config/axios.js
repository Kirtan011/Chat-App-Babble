// src/config/axios.js

import axios from "axios";

// Create a new Axios instance
const api = axios.create({
  baseURL:
    process.env.NODE_ENV === "development"
      ? "http://127.0.0.1:5000"
      : "https://your-backend-url.onrender.com", // <-- Replace with your actual backend URL
});

// Optional: Attach token to every request if available
api.interceptors.request.use(
  (config) => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (userInfo?.token) {
      config.headers.Authorization = `Bearer ${userInfo.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
