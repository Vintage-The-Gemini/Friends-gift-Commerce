// frontend/src/services/api/business.js
import api from "./axios.config";

/**
 * Create a new business profile
 * @param {Object} profileData - Business profile data
 * @returns {Promise<Object>} API response
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
 * Get current seller's business profile
 * @returns {Promise<Object>} API response
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

    throw error.response?.data || new Error("Failed to fetch business profile");
  }
};

/**
 * Update seller's business profile
 * @param {Object} profileData - Business profile data to update
 * @returns {Promise<Object>} API response
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
 * Check if business profile exists
 * @returns {Promise<boolean>} Whether the profile exists
 */
export const hasBusinessProfile = async () => {
  try {
    const response = await getBusinessProfile();
    return response.success && !!response.data;
  } catch (error) {
    return false;
  }
};
