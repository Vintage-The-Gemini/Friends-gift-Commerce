// frontend/src/services/api/wishlist.js - COMPLETE FIXED VERSION
import api from './axios.config';

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
      console.error('[Wishlist Service] Get Wishlist Error:', error);
      throw error;
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
      console.error('[Wishlist Service] Add to Wishlist Error:', error);
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        const message = error.response.data?.message || 'Product already in wishlist';
        throw new Error(message);
      }
      
      if (error.response?.status === 404) {
        throw new Error('Product not found');
      }
      
      if (error.response?.status === 401) {
        throw new Error('Please sign in to add items to your wishlist');
      }
      
      throw error;
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
      console.error('[Wishlist Service] Remove from Wishlist Error:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Item not found in wishlist');
      }
      
      throw error;
    }
  },

  /**
   * Update wishlist item (notes, priority)
   */
  updateWishlistItem: async (productId, updates) => {
    try {
      if (!productId) {
        throw new Error('Product ID is required');
      }

      const response = await api.put(`/wishlist/${productId}`, updates);
      return response.data;
    } catch (error) {
      console.error('[Wishlist Service] Update Wishlist Item Error:', error);
      throw error;
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
      console.error('[Wishlist Service] Check Wishlist Status Error:', error);
      
      // If product not in wishlist, return false instead of throwing
      if (error.response?.status === 404) {
        return { success: true, data: { isInWishlist: false } };
      }
      
      throw error;
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
      console.error('[Wishlist Service] Clear Wishlist Error:', error);
      throw error;
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
      console.error('[Wishlist Service] Move to Event Error:', error);
      throw error;
    }
  },

  /**
   * Get wishlist statistics
   */
  getWishlistStats: async () => {
    try {
      const response = await api.get('/wishlist/stats');
      return response.data;
    } catch (error) {
      console.error('[Wishlist Service] Get Stats Error:', error);
      throw error;
    }
  },

  /**
   * Batch operations - Add multiple products to wishlist
   */
  addMultipleToWishlist: async (productIds) => {
    try {
      if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
        throw new Error('Product IDs array is required');
      }

      const results = [];
      
      // Process items sequentially to avoid overwhelming the server
      for (const productId of productIds) {
        try {
          const result = await this.addToWishlist(productId);
          results.push({ productId, success: true, data: result });
        } catch (error) {
          results.push({ 
            productId, 
            success: false, 
            error: error.message 
          });
        }
      }

      return {
        success: true,
        data: results,
        summary: {
          total: productIds.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length
        }
      };
    } catch (error) {
      console.error('[Wishlist Service] Batch Add Error:', error);
      throw error;
    }
  },

  /**
   * Batch operations - Remove multiple products from wishlist
   */
  removeMultipleFromWishlist: async (productIds) => {
    try {
      if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
        throw new Error('Product IDs array is required');
      }

      const results = [];
      
      for (const productId of productIds) {
        try {
          const result = await this.removeFromWishlist(productId);
          results.push({ productId, success: true, data: result });
        } catch (error) {
          results.push({ 
            productId, 
            success: false, 
            error: error.message 
          });
        }
      }

      return {
        success: true,
        data: results,
        summary: {
          total: productIds.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length
        }
      };
    } catch (error) {
      console.error('[Wishlist Service] Batch Remove Error:', error);
      throw error;
    }
  },

  /**
   * Export wishlist data
   */
  exportWishlist: async (format = 'json') => {
    try {
      const response = await api.get(`/wishlist/export?format=${format}`, {
        responseType: format === 'csv' ? 'blob' : 'json'
      });
      
      if (format === 'csv') {
        // Create download link for CSV
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `wishlist-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        return { success: true, message: 'Wishlist exported successfully' };
      }
      
      return response.data;
    } catch (error) {
      console.error('[Wishlist Service] Export Error:', error);
      throw error;
    }
  }
};

export default wishlistService;