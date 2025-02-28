// src/middleware/RequireBusinessProfile.jsx
import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { hasBusinessProfile } from "../services/api/business";

/**
 * A middleware component that checks if a seller has a business profile
 * and redirects to the setup page if not
 */
const RequireBusinessProfile = ({ children }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    const checkBusinessProfile = async () => {
      try {
        // Only check for business profile if the user is a seller
        if (user?.role === "seller") {
          const profileExists = await hasBusinessProfile();
          setHasProfile(profileExists);
        } else {
          // If not a seller, we don't need a business profile
          setHasProfile(true);
        }
      } catch (error) {
        console.error("Error checking business profile:", error);
        // On error, assume no profile to be safe
        setHasProfile(false);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      checkBusinessProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5551FF]"></div>
      </div>
    );
  }

  // If seller without a business profile, redirect to setup
  if (user?.role === "seller" && !hasProfile) {
    return <Navigate to="/seller/setup" replace />;
  }

  // Otherwise, render the children
  return children;
};

export default RequireBusinessProfile;
