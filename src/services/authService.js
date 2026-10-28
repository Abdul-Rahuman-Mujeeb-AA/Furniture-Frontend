import api from "./api";

const authService = {
  // Register a new user
  register: async (userData) => {
    const response = await api.post("/auth/register", {
      name: userData.name.trim(),
      email: userData.email.trim().toLowerCase(),
      password: userData.password,
    });

    const data = response.data;

    if (data.token) {
      localStorage.setItem("token", data.token);
    }

    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    return data;
  },

  // Login an existing user
  login: async (credentials) => {
    const response = await api.post("/auth/login", {
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
    });

    const data = response.data;

    if (data.token) {
      localStorage.setItem("token", data.token);
    }

    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    return data;
  },

  // Get the currently authenticated user's profile
  getProfile: async () => {
    const response = await api.get("/auth/profile");
    const data = response.data;

    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    return data;
  },

  // Restore the current user's profile and validate the session
  restoreSession: async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      return null;
    }

    try {
      const response = await api.get("/auth/profile");
      const data = response.data;

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        return data.user;
      }

      return null;
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        authService.logout();
      }

      throw error;
    }
  },

  // Get the locally stored user
  getStoredUser: () => {
    try {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    } catch {
      localStorage.removeItem("user");
      return null;
    }
  },

  // Check whether a token exists
  isAuthenticated: () => {
    return Boolean(localStorage.getItem("token"));
  },

  // Log out the current user
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};

export default authService;