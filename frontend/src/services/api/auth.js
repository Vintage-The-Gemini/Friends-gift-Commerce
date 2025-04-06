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

 // In auth.js or authService.js
googleLogin: async (credential, role) => {
  try {
    console.log("[AuthService] Sending Google login request:", { 
      tokenLength: credential ? credential.length : 0,
      role 
    });
    
    // Debug request
    console.log("[AuthService] API URL:", API_URL);
    console.log("[AuthService] Full endpoint:", `${API_URL}/auth/google-login`);
    
    const response = await api.post("/auth/google-login", { 
      tokenId: credential,
      role 
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
    } else if (error.request) {
      console.error("[AuthService] No response received:", error.request);
    } else {
      console.error("[AuthService] Error setting up request:", error.message);
    }
    
    return handleError(error, "Google login failed");
  }
},

  verifyToken: async () => {
    try {
      const response = await api.get("/auth/me");
      return { ...response.data, success: true };
    } catch (error) {
      // If token verification fails, clear local storage
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      return handleError(error, "Token verification failed");
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

  updateProfile: async (userData) => {
    try {
      const response = await api.put("/auth/profile", userData);
      return { ...response.data, success: true };
    } catch (error) {
      return handleError(error, "Failed to update profile");
    }
  },

  verifyEmail: async (token) => {
    try {
      const response = await api.get(`/auth/verify-email/${token}`);
      return { ...response.data, success: true };
    } catch (error) {
      return handleError(error, "Email verification failed");
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
      const response = await api.post(`/auth/reset-password/${token}`, { 
        password 
      });
      return { ...response.data, success: true };
    } catch (error) {
      return handleError(error, "Failed to reset password");
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.post("/auth/change-password", {
        currentPassword,
        newPassword,
      });
      return { ...response.data, success: true };
    } catch (error) {
      return handleError(error, "Failed to change password");
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