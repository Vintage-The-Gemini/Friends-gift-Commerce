// src/pages/dashboard/seller/BusinessProfilePage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, ArrowLeft } from "lucide-react";
import { getBusinessProfile } from "../../../services/api/business";
import BusinessProfileView from "../../../components/seller/BusinessProfileView";
import { analyticsService } from "../../../services/api/analytics";
import { toast } from "react-toastify";

const BusinessProfilePage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([fetchProfile(), fetchStats()])
      .catch((err) => {
        setError("Failed to load profile data");
        console.error("Profile page error:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await getBusinessProfile();
      if (response.success) {
        setProfile(response.data);
      } else {
        throw new Error(response.message || "Failed to fetch profile");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load business profile");
      throw error;
    }
  };

  const fetchStats = async () => {
    try {
      const response = await analyticsService.getDashboardOverview();
      if (response.success) {
        setStats({
          totalProducts: response.data.totalProducts || 0,
          totalOrders: response.data.totalSales || 0,
          totalRevenue: response.data.totalRevenue || 0,
          rating: "4.5", // Placeholder - you might want to implement actual ratings
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      // We'll still show the profile even if stats fail
    }
  };

  const handleEditProfile = () => {
    navigate("/seller/settings", { state: { activeTab: "business" } });
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">Business Profile</h1>
      </div>

      {profile ? (
        <BusinessProfileView
          profile={profile}
          stats={stats}
          onEdit={handleEditProfile}
        />
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-lg">
          <p>You haven't set up your business profile yet.</p>
          <button
            onClick={() => navigate("/seller/setup")}
            className="mt-2 text-blue-600 font-medium"
          >
            Set up now →
          </button>
        </div>
      )}
    </div>
  );
};

export default BusinessProfilePage;
