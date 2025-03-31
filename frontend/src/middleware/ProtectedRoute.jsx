// src/middleware/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // If not logged in, redirect to login
  if (!user) {
    // Remember where they were trying to go
    return <Navigate to="/auth/signin" state={{ from: location.pathname }} />;
  }

  // Special case: Allow sellers to create events
  if (
    allowedRoles.includes("buyer") &&
    location.pathname.includes("/events/create") &&
    user.role === "seller"
  ) {
    // Allow sellers to create events
    return children;
  }

  // Check if user has required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect based on role if unauthorized
    switch (user.role) {
      case "admin":
        return <Navigate to="/admin/dashboard" />;
      case "seller":
        return <Navigate to="/seller/dashboard" />;
      default:
        return <Navigate to="/" />;
    }
  }

  // User is authenticated and authorized
  return children;
};

export default ProtectedRoute;
