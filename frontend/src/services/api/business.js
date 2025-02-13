// src/services/api/business.js
import api from "./axios.config";

export const createBusinessProfile = async (profileData) => {
  try {
    const response = await api.post("/seller/business-profile", profileData);
    return response.data;
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "Failed to create business profile"
    );
  }
};

export const updateBusinessProfile = async (profileData) => {
  try {
    const response = await api.put("/seller/business-profile", profileData);
    return response.data;
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "Failed to update business profile"
    );
  }
};

export const getBusinessProfile = async () => {
  try {
    const response = await api.get("/seller/business-profile");
    return response.data;
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "Failed to fetch business profile"
    );
  }
};
