// src/hooks/useAuth.js
import { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/api/auth";

// Create the authentication context
const AuthContext = createContext();

// Provider component that wraps your app and makes auth object available to any child component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to initialize auth state from localStorage on app load
  useEffect(() => {
    const initializeAuth = () => {
      try {
        // Check if user data exists in localStorage
        const storedUser = authService.getCurrentUser();
        if (storedUser) {
          setUser(storedUser);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        // Clear potentially corrupted auth data
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      if (response.success && response.user) {
        setUser(response.user);
        return response;
      }
      throw new Error(response.message || "Login failed");
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // Admin login function
  const adminLogin = async (credentials) => {
    try {
      const response = await authService.adminLogin(credentials);
      if (response.success && response.user) {
        setUser(response.user);
        return response;
      }
      throw new Error(response.message || "Admin login failed");
    } catch (error) {
      console.error("Admin login error:", error);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    try {
      authService.logout();
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      if (response.success && response.user) {
        setUser(response.user);
        return response;
      }
      throw new Error(response.message || "Registration failed");
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  // Update user data
  const updateUserData = (newUserData) => {
    if (newUserData) {
      // Update local state
      setUser(newUserData);

      // Update localStorage
      localStorage.setItem("user", JSON.stringify(newUserData));
    }
  };

  // Value object that will be passed to consumers of this context
  const value = {
    user,
    loading,
    login,
    adminLogin,
    logout,
    register,
    updateUserData,
    setUser, // Explicitly provide setUser function
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook that simplifies consumption of the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default useAuth;
