import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getBusinessProfile } from "../services/api/business";

const RequireBusinessProfile = ({ children }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    const checkBusinessProfile = async () => {
      try {
        // Only check for business profile if the user is a seller
        if (user?.role === "seller") {
          const response = await getBusinessProfile();
          console.log("Business profile check response:", response);

          // Consider profile exists if either success is true or we get a specific error
          if (
            response.success ||
            (response.message && response.message.includes("already exists"))
          ) {
            setHasProfile(true);
          } else {
            setHasProfile(false);
          }
        } else {
          // If not a seller, we don't need a business profile
          setHasProfile(true);
        }
      } catch (error) {
        console.error("Error checking business profile:", error);

        // If we get an error about profile already existing, consider it exists
        if (error.message && error.message.includes("already exists")) {
          setHasProfile(true);
        } else {
          // On other errors, assume no profile to be safe
          setHasProfile(false);
        }
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
