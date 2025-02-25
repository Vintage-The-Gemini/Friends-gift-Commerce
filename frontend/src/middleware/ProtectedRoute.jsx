// src/middleware/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth/signin" />;
  }

  // If we're checking event creation paths, allow both buyers and sellers
  if (
    allowedRoles.includes("buyer") &&
    window.location.pathname.includes("/events/create") &&
    user.role === "seller"
  ) {
    // Allow sellers to create events
    return children;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect based on role if unauthorized
    switch (user.role) {
      case "admin":
        return <Navigate to="/admin/dashboard" />;
      case "seller":
        return <Navigate to="/seller/dashboard" />;
      default:
        return <Navigate to="/buyer/dashboard" />;
    }
  }

  return children;
};

export default ProtectedRoute;
