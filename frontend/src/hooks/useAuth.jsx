// frontend/src/hooks/useAuth.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import authService from "../services/api/auth";

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        const storedUser = authService.getCurrentUser();
        
        if (token && storedUser) {
          // Verify token is still valid
          const response = await authService.verifyToken();
          if (response.success) {
            setUser(storedUser);
          } else {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.login(credentials);
      
      if (response.success) {
        setUser(response.user);
        
        // Redirect based on role and intended location
        const from = location.state?.from?.pathname || 
                   (response.user.role === "seller" ? "/seller/dashboard" : "/");
        navigate(from, { replace: true });
        
        toast.success("Login successful");
        return response;
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (error) {
      setError(error.message || "Login failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Google login function
  const loginWithGoogle = async (credential, role) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("[useAuth] Starting Google login with role:", role);
      
      const response = await authService.googleLogin(credential, role);
      
      if (response.success) {
        setUser(response.user);
        
        // Redirect based on role
        const from = location.state?.from?.pathname || 
                   (response.user.role === "seller" ? "/seller/dashboard" : "/");
        navigate(from, { replace: true });
        
        toast.success("Google sign-in successful");
        return response;
      } else {
        throw new Error(response.message || "Google sign-in failed");
      }
    } catch (error) {
      setError(error.message || "Google sign-in failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.register(userData);
      
      if (response.success) {
        setUser(response.user);
        
        // Redirect based on role
        const redirectPath = response.user.role === "seller" ? "/seller/dashboard" : "/";
        navigate(redirectPath, { replace: true });
        
        toast.success("Registration successful");
        return response;
      } else {
        throw new Error(response.message || "Registration failed");
      }
    } catch (error) {
      setError(error.message || "Registration failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    setUser(null);
    setError(null);
    navigate("/", { replace: true });
    toast.success("Logged out successfully");
  };

  // Update profile function
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      
      const response = await authService.updateProfile(userData);
      
      if (response.success) {
        setUser(prev => ({ ...prev, ...response.user }));
        toast.success("Profile updated successfully");
        return response;
      } else {
        throw new Error(response.message || "Failed to update profile");
      }
    } catch (error) {
      toast.error(error.message || "Failed to update profile");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    loginWithGoogle,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    isBuyer: user?.role === "buyer",
    isSeller: user?.role === "seller",
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};