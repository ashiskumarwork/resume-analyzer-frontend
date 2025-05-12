import axios from "axios";

// For Create React App, environment variables must start with REACT_APP_
// If you were using Vite, it would be import.meta.env.VITE_API_BASE_URL
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add a request interceptor to include the auth token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Assuming 'token' is the key you use
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration or other 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid, or not authorized for some other reason
      console.error(
        "API request unauthorized (401):",
        error.response ? error.response.data : error.message
      );
      localStorage.removeItem("token"); // Remove invalid token
      // Consider redirecting to login, perhaps with a message
      // Avoid redirecting if the 401 is from the login page itself to prevent loops
      if (
        window.location.pathname !== "/login" &&
        window.location.pathname !== "/register"
      ) {
        window.location.href = "/login"; // Or use React Router's navigate for better UX
      }
    }
    return Promise.reject(error);
  }
);

export default api;
