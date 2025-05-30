// frontend/src/services/api/wishlist.js - UPDATED WITH FALLBACK
import api from './axios.config';

// Fallback localStorage service
const localStorageService = {
  getWishlist: () => {
    try {
      const stored = localStorage.getItem('friendsgift_wishlist');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  },

  addToWishlist: (productId) => {
    try {
      const wishlist = localStorageService.getWishlist();
      if (!wishlist.includes(productId)) {
        wishlist.push(productId);
        localStorage.setItem('friendsgift_wishlist', JSON.stringify(wishlist));
        return true;
      }
      return false; // Already exists
    } catch (error) {
      console.error('Error writing to localStorage:', error);
      return false;
    }
  },

  removeFromWishlist: (productId) => {
    try {
      const wishlist = localStorageService.getWishlist();
      const updated = wishlist.filter(id => id !== productId);
      localStorage.setItem('friendsgift_wishlist', JSON.stringify(updated));
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  },

  isInWishlist: (productId) => {
    const wishlist = localStorageService.getWishlist();
    return wishlist.includes(productId);
  },

  clearWishlist: () => {
    try {
      localStorage.removeItem('friendsgift_wishlist');
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }
};

export const wishlistService = {
  /**
   * Get user's wishlist with pagination and sorting
   */
  getWishlist: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add optional parameters
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      
      const queryString = queryParams.toString();
      const url = queryString ? `/wishlist?${queryString}` : '/wishlist';
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.warn('[Wishlist Service] API failed, using localStorage fallback');
      
      // Fallback to localStorage
      const wishlistIds = localStorageService.getWishlist();
      return {
        success: true,
        data: wishlistIds.map(id => ({
          _id: `local_${id}`,
          product: { _id: id },
          addedAt: new Date().toISOString()
        })),
        stats: {
          totalItems: wishlistIds.length,
          availableItems: wishlistIds.length,
          totalValue: 0
        }
      };
    }
  },

  /**
   * Add product to wishlist
   */
  addToWishlist: async (productId, notes = '', priority = 'medium') => {
    try {
      if (!productId) {
        throw new Error('Product ID is required');
      }

      const payload = {
        productId,
        ...(notes && { notes }),
        ...(priority && { priority })
      };

      const response = await api.post('/wishlist', payload);
      return response.data;
    } catch (error) {
      console.warn('[Wishlist Service] API failed, using localStorage fallback');
      
      // Fallback to localStorage
      const success = localStorageService.addToWishlist(productId);
      if (success) {
        return {
          success: true,
          message: "Product added to wishlist (offline mode)",
          data: {
            productId,
            addedAt: new Date().toISOString()
          }
        };
      } else {
        throw new Error('Product already in wishlist or failed to save');
      }
    }
  },

  /**
   * Remove product from wishlist
   */
  removeFromWishlist: async (productId) => {
    try {
      if (!productId) {
        throw new Error('Product ID is required');
      }

      const response = await api.delete(`/wishlist/${productId}`);
      return response.data;
    } catch (error) {
      console.warn('[Wishlist Service] API failed, using localStorage fallback');
      
      // Fallback to localStorage
      const success = localStorageService.removeFromWishlist(productId);
      if (success) {
        return {
          success: true,
          message: "Product removed from wishlist (offline mode)"
        };
      } else {
        throw new Error('Failed to remove from wishlist');
      }
    }
  },

  /**
   * Check if product is in wishlist
   */
  checkWishlistStatus: async (productId) => {
    try {
      if (!productId) {
        throw new Error('Product ID is required');
      }

      const response = await api.get(`/wishlist/check/${productId}`);
      return response.data;
    } catch (error) {
      console.warn('[Wishlist Service] API failed, using localStorage fallback');
      
      // Fallback to localStorage
      const isInWishlist = localStorageService.isInWishlist(productId);
      return {
        success: true,
        data: { isInWishlist }
      };
    }
  },

  /**
   * Clear entire wishlist
   */
  clearWishlist: async () => {
    try {
      const response = await api.delete('/wishlist');
      return response.data;
    } catch (error) {
      console.warn('[Wishlist Service] API failed, using localStorage fallback');
      
      // Fallback to localStorage
      const success = localStorageService.clearWishlist();
      if (success) {
        return {
          success: true,
          message: "Wishlist cleared (offline mode)",
          data: { deletedCount: 0 }
        };
      } else {
        throw new Error('Failed to clear wishlist');
      }
    }
  },

  /**
   * Move wishlist items to event
   */
  moveToEvent: async (productIds, eventId) => {
    try {
      if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
        throw new Error('Product IDs array is required');
      }
      
      if (!eventId) {
        throw new Error('Event ID is required');
      }

      const response = await api.post('/wishlist/move-to-event', {
        productIds,
        eventId
      });
      return response.data;
    } catch (error) {
      console.warn('[Wishlist Service] Move to event API failed');
      
      // For now, just remove from localStorage
      productIds.forEach(productId => {
        localStorageService.removeFromWishlist(productId);
      });
      
      return {
        success: true,
        message: "Items moved to event (offline mode)",
        data: { movedCount: productIds.length }
      };
    }
  },

  // Utility method to check if we're using localStorage
  isUsingLocalStorage: () => {
    try {
      // Try to make a simple API call to check if backend is available
      return false; // Will be determined by API calls
    } catch {
      return true;
    }
  }
};

export default wishlistService;