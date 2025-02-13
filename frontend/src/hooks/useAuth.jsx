// src/hooks/useAuth.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (storedUser && token) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Auth check error:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      // For development/testing - remove in production
      if (
        credentials.phoneNumber === "+254700000000" &&
        credentials.password === "password123"
      ) {
        const mockUser = {
          id: "1",
          name: "Test User",
          phoneNumber: credentials.phoneNumber,
          role: credentials.role || "buyer",
        };
        const mockToken = "mock-token-123";

        localStorage.setItem("token", mockToken);
        localStorage.setItem("user", JSON.stringify(mockUser));
        setUser(mockUser);

        // Navigate based on role
        if (mockUser.role === "seller") {
          navigate("/seller/dashboard");
        } else if (mockUser.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/");
        }

        return { user: mockUser, token: mockToken };
      }

      const response = await axios.post("/api/auth/login", credentials);
      const { data } = response;

      if (data.token && data.user) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);

        // Navigate based on role
        if (data.user.role === "seller") {
          navigate("/seller/dashboard");
        } else if (data.user.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/");
        }

        return data;
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error(
          "Login failed. Please check your credentials and try again."
        );
      }
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/auth/signin");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const value = {
    user,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
