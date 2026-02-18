import axios from "axios";

// Hardcoded production API URL - no environment variable issues
const API_BASE = import.meta.env.VITE_API_URL || "https://internshipbackend-p5sn.onrender.com/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000, // 
});

let isRedirecting = false;

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't handle if already redirecting
    if (isRedirecting) {
      return Promise.reject(error);
    }

    if (error.response) {
      const { status, data } = error.response;
      const message = data?.message || "";

      if (status === 401 || status === 403) {
        // Check if it's actually a token/auth error
        const isTokenError =
          message.toLowerCase().includes("token") ||
          message.toLowerCase().includes("expired") ||
          message.toLowerCase().includes("invalid") ||
          message.toLowerCase().includes("unauthorized") ||
          message.toLowerCase().includes("no token") ||
          message.toLowerCase().includes("authentication");

        if (isTokenError) {
          console.warn("Authentication error:", message);

          // Set flag to prevent multiple redirects
          isRedirecting = true;

          // Clear all auth data
          localStorage.removeItem("token");
          localStorage.removeItem("student");
          localStorage.removeItem("mentor");
          localStorage.removeItem("admin");
          localStorage.removeItem("role");

          // Determine which login page to redirect to based on current path
          const currentPath = window.location.pathname;
          let loginPath = "/"; // default to student login

          if (currentPath.includes("/mentor") || currentPath.includes("/Mentor")) {
            loginPath = "/mentorlogin";
          } else if (currentPath.includes("/admin") || currentPath.includes("/Admin")) {
            loginPath = "/adminlogin";
          }

          // Only redirect if not already on a login page
          if (!currentPath.includes("login")) {
            // Use setTimeout to allow the error to propagate first
            setTimeout(() => {
              window.location.href = loginPath;
              isRedirecting = false;
            }, 100);
          } else {
            isRedirecting = false;
          }

          return Promise.reject(new Error("Session expired. Please login again."));
        }
      }

      // Handle server errors
      if (status >= 500) {
        console.error("Server error:", message);
      }
    } else if (error.request) {
      // Network error - no response received
      console.error("Network error - no response received");
    }

    return Promise.reject(error);
  }
);

export default api;
