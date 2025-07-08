// frontend/src/services/api/auth.js
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

  googleLogin: async (credential, role) => {
    try {
      console.log("[AuthService] Sending Google login request");
      console.log("[AuthService] API URL:", API_URL);
      console.log("[AuthService] Role:", role);
      
      const response = await api.post("/auth/google", {
        credential: credential,
        role: role
      });
      
      console.log("[AuthService] Google login response:", response.data);
      
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        console.log("[AuthService] Token and user saved to localStorage");
      }
      
      return { ...response.data, success: true };
    } catch (error) {
      console.error("[AuthService] Google login error:", error);
      
      if (error.response) {
        console.error("[AuthService] Response status:", error.response.status);
        console.error("[AuthService] Response data:", error.response.data);
      }
      
      return handleError(error, "Google authentication failed");
    }
  },

  verifyToken: async () => {
    try {
      const response = await api.get("/auth/me");
      return { ...response.data, success: true };
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      return handleError(error, "Token verification failed");
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return { success: true, message: "Logged out successfully" };
  },

  getCurrentUser: () => {
    try {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      return null;
    }
  },

  updateProfile: async (userData) => {
    try {
      const response = await api.put("/auth/profile", userData);
      
      if (response.data.success) {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          const updatedUser = { ...currentUser, ...response.data.user };
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }
      }
      
      return { ...response.data, success: true };
    } catch (error) {
      return handleError(error, "Profile update failed");
    }
  },

  resendVerificationEmail: async (email) => {
    try {
      const response = await api.post("/auth/resend-verification", { email });
      return { ...response.data, success: true };
    } catch (error) {
      return handleError(error, "Failed to resend verification email");
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await api.post("/auth/forgot-password", { email });
      return { ...response.data, success: true };
    } catch (error) {
      return handleError(error, "Failed to send password reset email");
    }
  },

  resetPassword: async (token, password) => {
    try {
      const response = await api.post("/auth/reset-password", { token, password });
      return { ...response.data, success: true };
    } catch (error) {
      return handleError(error, "Password reset failed");
    }
  },
};

export default authService;