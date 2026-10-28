import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token to protected API requests.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle API errors consistently.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      error.message =
        "Unable to connect to the server. Please check your internet connection and try again.";
    }

    return Promise.reject(error);
  }
);

export default api;
