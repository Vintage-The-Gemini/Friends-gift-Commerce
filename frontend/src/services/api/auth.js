// src/services/api/auth.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Helper function to handle errors
const handleError = (error, defaultMessage) => {
  if (error.response?.data?.message) {
    return error.response.data;
  }

  if (error.response?.status === 401) {
    return {
      success: false,
      message: "Your session has expired. Please login again.",
    };
  }

  if (error.response?.status === 403) {
    return {
      success: false,
      message: "You are not authorized to perform this action.",
    };
  }

  if (error.response?.status === 404) {
    return { success: false, message: "The requested resource was not found." };
  }

  if (error.response?.status >= 500) {
    return { success: false, message: "Server error. Please try again later." };
  }

  return { success: false, message: defaultMessage };
};

const authService = {
  register: async (userData) => {
    try {
      const response = await api.post("/auth/register", userData);
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
      return { ...response.data, success: true };
    } catch (error) {
      return handleError(error, "Registration failed");
    }
  },

  login: async (credentials) => {
    try {
      const response = await api.post("/auth/login", credentials);
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
      return { ...response.data, success: true };
    } catch (error) {
      return handleError(error, "Login failed");
    }
  },

  adminLogin: async (credentials) => {
    try {
      // Use the full API URL to bypass any path resolution issues
      const apiUrl =
        import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      console.log("Sending admin login request to:", `${apiUrl}/admin/login`);
      console.log("With payload:", credentials);

      const response = await axios.post(`${apiUrl}/admin/login`, credentials);
      console.log("Admin login raw response:", response);

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
      return { ...response.data, success: true };
    } catch (error) {
      console.error("Admin login service error:", error);
      return handleError(error, "Admin login failed");
    }
  },

  logout: () => {
    try {
      // Try to call the backend logout endpoint
      api.post("/auth/logout").catch((err) => {
        console.warn("Backend logout failed:", err);
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear local storage regardless of backend response
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },

  getCurrentUser: () => {
    try {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },
};

export default authService;
