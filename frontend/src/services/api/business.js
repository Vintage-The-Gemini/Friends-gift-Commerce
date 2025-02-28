// src/services/api/business.js
import api from "./axios.config";

/**
 * Creates a new business profile for a seller
 * @param {Object} profileData - Business profile data
 * @returns {Promise<Object>} Response with success status and data
 */
export const createBusinessProfile = async (profileData) => {
  try {
    const response = await api.post("/seller/business-profile", profileData);
    return response.data;
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    throw (
      error.response?.data || new Error("Failed to create business profile")
    );
  }
};

/**
 * Updates an existing business profile
 * @param {Object} profileData - Updated business profile data
 * @returns {Promise<Object>} Response with success status and data
 */
export const updateBusinessProfile = async (profileData) => {
  try {
    const response = await api.put("/seller/business-profile", profileData);
    return response.data;
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    throw (
      error.response?.data || new Error("Failed to update business profile")
    );
  }
};

/**
 * Gets the business profile for the current seller
 * @returns {Promise<Object>} Response with success status and profile data
 */
export const getBusinessProfile = async () => {
  try {
    const response = await api.get("/seller/business-profile");
    return response.data;
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);

    // If 404, the profile doesn't exist yet, so return null data
    if (error.response?.status === 404) {
      return {
        success: false,
        data: null,
        message: "Business profile not found",
      };
    }

    // If 400 with "already exists", the profile exists but can't be created again
    if (
      error.response?.status === 400 &&
      error.response?.data?.message?.includes("already exists")
    ) {
      return {
        success: true,
        data: { exists: true },
        message: "Business profile already exists",
      };
    }

    throw error.response?.data || new Error("Failed to fetch business profile");
  }
};

/**
 * Checks if the current seller has a business profile
 * @returns {Promise<boolean>} True if seller has a business profile
 */
export const hasBusinessProfile = async () => {
  try {
    const response = await getBusinessProfile();
    return (
      response.success &&
      (!!response.data || response.message?.includes("already exists"))
    );
  } catch (error) {
    // If error contains "already exists" message, profile exists
    if (error.message && error.message.includes("already exists")) {
      return true;
    }
    return false;
  }
};

export default {
  createBusinessProfile,
  updateBusinessProfile,
  getBusinessProfile,
  hasBusinessProfile,
};
