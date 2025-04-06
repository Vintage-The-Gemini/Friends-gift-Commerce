// src/hooks/useAuth.js
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import authService from "../services/api/auth";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize auth state from localStorage on app startup
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const storedUser = authService.getCurrentUser();
        
        if (storedUser && authService.isAuthenticated()) {
          setUser(storedUser);
          
          // Verify token validity with the server
          try {
            const response = await authService.verifyToken();
            if (!response.success) {
              // If token is invalid, log the user out
              logout();
            }
          } catch (err) {
            console.error("Token verification error:", err);
            // If there's an error with verification, keep the user logged in
            // but log the error for debugging
          }
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
        setError("Failed to initialize authentication");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Register a new user
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.register(userData);
      
      if (response.success) {
        setUser(response.user);
        
        // If the response contains a message about email verification, show it
        if (response.message && response.message.includes("email")) {
          toast.info(response.message);
        } else {
          toast.success("Registration successful");
          
          // Redirect based on role
          if (response.user.role === "seller") {
            navigate("/seller/setup");
          } else {
            navigate("/");
          }
        }
        
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

  // Login a user
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.login(credentials);
      
      if (response.success) {
        setUser(response.user);
        
        // Get the intended destination or default based on role
        const from = location.state?.from || 
          (response.user.role === "seller" ? "/seller/dashboard" : "/");
        
        // Redirect based on role
        navigate(from, { replace: true });
        
        toast.success("Login successful");
        return response;
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (error) {
      setError(error.message || "Failed to sign in");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login with Google
  const loginWithGoogle = async (credential, role) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.googleLogin(credential, role);
      
      if (response.success) {
        setUser(response.user);
        
        // Get the intended destination or default based on role
        const from = location.state?.from || 
          (response.user.role === "seller" ? "/seller/dashboard" : "/");
        
        // Redirect based on role
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

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      
      const response = await authService.updateProfile(userData);
      
      if (response.success) {
        // Update the user state with the new info
        setUser(prev => ({ ...prev, ...response.data }));
        
        // Also update localStorage
        const storedUser = authService.getCurrentUser();
        if (storedUser) {
          localStorage.setItem("user", JSON.stringify({
            ...storedUser,
            ...response.data
          }));
        }
        
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

  // Send email verification
  const resendVerificationEmail = async (email) => {
    try {
      setLoading(true);
      const response = await authService.resendVerificationEmail(email);
      
      if (response.success) {
        toast.success("Verification email sent successfully");
        return response;
      } else {
        throw new Error(response.message || "Failed to send verification email");
      }
    } catch (error) {
      toast.error(error.message || "Failed to send verification email");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Verify email with token
  const verifyEmail = async (token) => {
    try {
      setLoading(true);
      const response = await authService.verifyEmail(token);
      
      if (response.success) {
        // If the user is logged in, update their verification status
        if (user) {
          setUser(prev => ({ ...prev, isEmailVerified: true }));
          
          // Update localStorage
          const storedUser = authService.getCurrentUser();
          if (storedUser) {
            localStorage.setItem("user", JSON.stringify({
              ...storedUser,
              isEmailVerified: true
            }));
          }
        }
        
        toast.success("Email verified successfully");
        return response;
      } else {
        throw new Error(response.message || "Email verification failed");
      }
    } catch (error) {
      toast.error(error.message || "Email verification failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Request password reset
  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      const response = await authService.forgotPassword(email);
      
      if (response.success) {
        toast.success("Password reset link sent to your email");
        return response;
      } else {
        throw new Error(response.message || "Failed to request password reset");
      }
    } catch (error) {
      toast.error(error.message || "Failed to request password reset");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Reset password with token
  const resetPassword = async (token, password) => {
    try {
      setLoading(true);
      const response = await authService.resetPassword(token, password);
      
      if (response.success) {
        toast.success("Password reset successful");
        return response;
      } else {
        throw new Error(response.message || "Failed to reset password");
      }
    } catch (error) {
      toast.error(error.message || "Failed to reset password");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Change password (for logged in users)
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      const response = await authService.changePassword(currentPassword, newPassword);
      
      if (response.success) {
        toast.success("Password changed successfully");
        return response;
      } else {
        throw new Error(response.message || "Failed to change password");
      }
    } catch (error) {
      toast.error(error.message || "Failed to change password");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Log out the user
  const logout = () => {
    authService.logout();
    setUser(null);
    navigate("/auth/signin");
    toast.info("You have been logged out");
  };

  // Admin login
  const adminLogin = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.adminLogin(credentials);
      
      if (response.success) {
        setUser(response.user);
        navigate("/admin/dashboard");
        toast.success("Admin login successful");
        return response;
      } else {
        throw new Error(response.message || "Admin login failed");
      }
    } catch (error) {
      setError(error.message || "Admin login failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Check if user has admin privileges
  const isAdmin = () => {
    return user?.role === "admin";
  };

  // Check if user has seller privileges
  const isSeller = () => {
    return user?.role === "seller";
  };

  // Check if user has buyer privileges
  const isBuyer = () => {
    return user?.role === "buyer";
  };

  // Check if email is verified (if applicable)
  const isEmailVerified = () => {
    return !user?.email || user?.isEmailVerified === true;
  };

  const contextValue = {
    user,
    loading,
    error,
    register,
    login,
    loginWithGoogle,
    logout,
    updateProfile,
    resendVerificationEmail,
    verifyEmail,
    forgotPassword,
    resetPassword,
    changePassword,
    adminLogin,
    isAdmin,
    isSeller,
    isBuyer,
    isEmailVerified,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);