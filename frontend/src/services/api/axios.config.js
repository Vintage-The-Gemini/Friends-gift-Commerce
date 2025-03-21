// src/services/api/axios.config.js
import axios from "axios";

// Error types
const ErrorTypes = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
};

// We need to fix the double API issue by removing /api from the baseURL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor to add auth token and fix double /api prefix issue
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Remove any duplicated /api prefix in the URL to prevent the double /api/api issue
    if (config.url.startsWith("/api/")) {
      console.warn(
        `Detected double API prefix in URL: ${config.url}. Fixing...`
      );
      config.url = config.url.replace("/api/", "/");
    }

    // Log API requests in production
    if (process.env.NODE_ENV === "production") {
      console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    console.error("[Request Error]:", error);
    return Promise.reject(error);
  }
);

// Handle different error types
const errorHandlers = {
  [ErrorTypes.UNAUTHORIZED]: async (error) => {
    // Don't try to refresh, just clear tokens and redirect
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/auth/signin";
    throw error;
  },

  [ErrorTypes.FORBIDDEN]: (error) => {
    console.error("[Access Forbidden]:", error.config.url);
    throw new Error("You do not have permission to access this resource");
  },

  [ErrorTypes.NOT_FOUND]: (error) => {
    console.error("[Endpoint Not Found]:", error.config.url);
    throw new Error(`API endpoint not found. Please check your request.`);
  },

  [ErrorTypes.SERVER_ERROR]: (error) => {
    console.error("[Server Error]:", error.config.url);
    throw new Error(
      "An internal server error occurred. Please try again later."
    );
  },
};

// Response interceptor with improved error handling
api.interceptors.response.use(
  (response) => {
    // If response already has success/message structure, return as is
    if (response.data?.success !== undefined) {
      return response;
    }

    // Standardize response structure
    return {
      ...response,
      data: {
        success: true,
        data: response.data,
        message: null,
      },
    };
  },
  async (error) => {
    // Log full error details in production
    if (process.env.NODE_ENV === "production") {
      console.error("[API Error Details]:", {
        status: error.response?.status,
        url: error.config?.url,
        method: error.config?.method,
        data: error.response?.data,
        error: error.message,
      });
    }

    // Handle network errors
    if (!error.response) {
      console.error("[Network Error]:", error.message);
      throw new Error(
        "Unable to connect to the server. Please check your internet connection."
      );
    }

    // Get error handler based on status code
    const handler = errorHandlers[error.response.status];
    if (handler) {
      return handler(error);
    }

    // Default error handling
    const errorMessage = error.response.data?.message || error.message;
    console.error("[API Error]:", {
      status: error.response.status,
      message: errorMessage,
      url: error.config.url,
    });

    throw new Error(errorMessage);
  }
);

// Add request/response timing in production
if (process.env.NODE_ENV === "production") {
  api.interceptors.request.use((config) => {
    config.metadata = { startTime: new Date() };
    return config;
  });

  api.interceptors.response.use((response) => {
    const duration = new Date() - response.config.metadata.startTime;
    console.log(
      `[API] ${response.config.method.toUpperCase()} ${
        response.config.url
      } - ${duration}ms`
    );
    return response;
  });
}

export default api;
