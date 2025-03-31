// src/hooks/useAuth.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api/axios.config";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load user from localStorage on initial render
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Register a new user
  const register = async (userData) => {
    try {
      const response = await api.post("/auth/register", userData);

      if (response.data.success) {
        const { token, user } = response.data;

        // If user registration was successful, store token and user data
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        setUser(user);

        // If user has email but it's not verified yet, don't redirect to dashboard
        if (user.email && !user.isEmailVerified) {
          return response.data;
        }

        // Redirect based on role
        if (user.role === "seller") {
          navigate("/seller/dashboard");
        } else {
          navigate("/");
        }

        return response.data;
      }
    } catch (error) {
      console.error("Registration error:", error);
      throw error.response?.data || { message: "Registration failed" };
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      const response = await api.post("/auth/login", credentials);

      if (response.data.success) {
        const { token, user } = response.data;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        setUser(user);

        // Redirect based on role
        if (user.role === "seller") {
          navigate("/seller/dashboard");
        } else {
          navigate("/");
        }

        return response.data;
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error.response?.data || { message: "Login failed" };
    }
  };

  // Google login
  const loginWithGoogle = async (tokenId, role = "buyer") => {
    try {
      const response = await api.post("/auth/google-login", {
        tokenId,
        role,
      });

      if (response.data.success) {
        const { token, user } = response.data;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        setUser(user);

        // Redirect based on role
        if (user.role === "seller") {
          navigate("/seller/dashboard");
        } else {
          navigate("/");
        }

        return response.data;
      }
    } catch (error) {
      console.error("Google login error:", error);
      throw error.response?.data || { message: "Google login failed" };
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/auth/signin");
  };

  // Verify email
  const verifyEmail = async (token) => {
    try {
      const response = await api.get(`/auth/verify-email/${token}`);
      return response.data;
    } catch (error) {
      console.error("Email verification error:", error);
      throw error.response?.data || { message: "Email verification failed" };
    }
  };

  // Resend verification email
  const resendVerificationEmail = async (email) => {
    try {
      const response = await api.post("/auth/resend-verification", {
        email,
      });
      return response.data;
    } catch (error) {
      console.error("Resend verification email error:", error);
      throw (
        error.response?.data || {
          message: "Failed to resend verification email",
        }
      );
    }
  };

  // Request password reset
  const forgotPassword = async (email) => {
    try {
      const response = await api.post("/auth/forgot-password", {
        email,
      });
      return response.data;
    } catch (error) {
      console.error("Forgot password error:", error);
      throw (
        error.response?.data || {
          message: "Failed to process password reset request",
        }
      );
    }
  };

  // Reset password
  const resetPassword = async (token, newPassword) => {
    try {
      const response = await api.post(`/auth/reset-password/${token}`, {
        password: newPassword,
      });
      return response.data;
    } catch (error) {
      console.error("Reset password error:", error);
      throw error.response?.data || { message: "Failed to reset password" };
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      const response = await api.put("/users/profile", userData);

      if (response.data.success) {
        const updatedUser = response.data.data;
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        return response.data;
      }
    } catch (error) {
      console.error("Update profile error:", error);
      throw error.response?.data || { message: "Failed to update profile" };
    }
  };

  // Check authentication status
  const isAuthenticated = () => {
    return !!user && !!localStorage.getItem("token");
  };

  // Check if user is a specific role
  const hasRole = (roles) => {
    if (!user) return false;

    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }

    return user.role === roles;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        loginWithGoogle,
        logout,
        verifyEmail,
        resendVerificationEmail,
        forgotPassword,
        resetPassword,
        updateProfile,
        isAuthenticated,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
