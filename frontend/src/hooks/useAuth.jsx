// frontend/src/hooks/useAuth.jsx
import {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api/axios.config";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load user from localStorage on initial render
  useEffect(() => {
    const loadUser = () => {
      try {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (token && storedUser) {
          // Only try to parse if storedUser is not null
          setUser(JSON.parse(storedUser));
          setAuthenticated(true);
        }
      } catch (error) {
        // Handle any parsing errors
        console.error("Error loading user from localStorage:", error);
        // Clear potentially corrupted data
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await api.post("/auth/register", userData);

      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        setUser(response.data.user);
        setAuthenticated(true);

        // Show message if there's one
        if (response.data.message) {
          toast.success(response.data.message);
        }

        // Redirect based on role (and whether email needs verification)
        if (response.data.user.role === "seller") {
          navigate("/seller/dashboard");
        } else {
          navigate("/");
        }

        return response.data;
      }
    } catch (error) {
      console.error("Registration error:", error);
      throw error.response?.data || { message: "Registration failed" };
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await api.post("/auth/login", credentials);

      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        setUser(response.data.user);
        setAuthenticated(true);

        // Redirect based on role
        if (response.data.user.role === "seller") {
          navigate("/seller/dashboard");
        } else if (response.data.user.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/");
        }

        return response.data;
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error.response?.data || { message: "Login failed" };
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setAuthenticated(false);
    navigate("/auth/signin");
  }, [navigate]);

  // Rest of your auth functions...

  return (
    <AuthContext.Provider
      value={{
        user,
        authenticated,
        loading,
        register,
        login,
        logout,
        // Include other auth functions here
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
