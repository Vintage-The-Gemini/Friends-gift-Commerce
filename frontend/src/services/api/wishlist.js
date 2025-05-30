// frontend/src/services/api/wishlist.js - FIXED VERSION
import api from './axios.config';

// API endpoints
const ENDPOINTS = {
  BASE: "/wishlist",
  CHECK: (productId) => `/wishlist/check/${productId}`,
  PRODUCT: (productId) => `/wishlist/${productId}`,
  MOVE_TO_EVENT: "/wishlist/move-to-event",
};

// Helper function to handle API errors
const handleApiError = (error, defaultMessage) => {
  console.error("[Wishlist Service] Error:", error);
  
  if (error.response) {
    const enhancedError = new Error(
      error.response.data?.message || defaultMessage
    );
    enhancedError.status = error.response.status;
    enhancedError.response = error.response;
    throw enhancedError;
  }
  
  throw error.response?.data || {
    success: false,
    message: defaultMessage,
    error: error.message,
  };
};

export const wishlistService = {
  /**
   * Get user's wishlist
   * @param {Object} options - Query options (page, limit, sortBy)
   * @returns {Promise<Object>} API response
   */
  getWishlist: async (options = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (options.page) params.append('page', options.page);
      if (options.limit) params.append('limit', options.limit);
      if (options.sortBy) params.append('sortBy', options.sortBy);
      
      const queryString = params.toString();
      const url = queryString ? `${ENDPOINTS.BASE}?${queryString}` : ENDPOINTS.BASE;
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to fetch wishlist');
    }
  },

  /**
   * Add product to wishlist
   * @param {string} productId - Product ID
   * @param {Object} options - Additional options (notes, priority)
   * @returns {Promise<Object>} API response
   */
  addToWishlist: async (productId, options = {}) => {
    try {
      if (!productId) {
        throw new Error('Product ID is required');
      }

      const requestData = {
        productId,
        ...options
      };

      const response = await api.post(ENDPOINTS.BASE, requestData);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to add product to wishlist');
    }
  },

  /**
   * Remove product from wishlist
   * @param {string} productId - Product ID
   * @returns {Promise<Object>} API response
   */
  removeFromWishlist: async (productId) => {
    try {
      if (!productId) {
        throw new Error('Product ID is required');
      }

      const response = await api.delete(ENDPOINTS.PRODUCT(productId));
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to remove product from wishlist');
    }
  },

  /**
   * Update wishlist item
   * @param {string} productId - Product ID
   * @param {Object} updates - Updates to apply (notes, priority)
   * @returns {Promise<Object>} API response
   */
  updateWishlistItem: async (productId, updates) => {
    try {
      if (!productId) {
        throw new Error('Product ID is required');
      }

      const response = await api.put(ENDPOINTS.PRODUCT(productId), updates);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to update wishlist item');
    }
  },

  /**
   * Check if product is in wishlist
   * @param {string} productId - Product ID
   * @returns {Promise<Object>} API response
   */
  checkWishlistStatus: async (productId) => {
    try {
      if (!productId) {
        throw new Error('Product ID is required');
      }

      const response = await api.get(ENDPOINTS.CHECK(productId));
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to check wishlist status');
    }
  },

  /**
   * Clear entire wishlist
   * @returns {Promise<Object>} API response
   */
  clearWishlist: async () => {
    try {
      const response = await api.delete(ENDPOINTS.BASE);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to clear wishlist');
    }
  },

  /**
   * Move wishlist items to event
   * @param {Array<string>} productIds - Array of product IDs
   * @param {string} eventId - Event ID
   * @returns {Promise<Object>} API response
   */
  moveToEvent: async (productIds, eventId) => {
    try {
      if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
        throw new Error('Product IDs array is required');
      }

      if (!eventId) {
        throw new Error('Event ID is required');
      }

      const response = await api.post(ENDPOINTS.MOVE_TO_EVENT, {
        productIds,
        eventId
      });
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to move items to event');
    }
  }
};

export default wishlistService;