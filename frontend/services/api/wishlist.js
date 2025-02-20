import api from './axios.config';

export const wishlistService = {
  addToWishlist: async (productId) => {
    try {
      const response = await api.post('/wishlist', { productId });
      return response.data;
    } catch (error) {
      console.error('Wishlist error:', error);
      throw error;
    }
  },

  removeFromWishlist: async (productId) => {
    try {
      const response = await api.delete(/wishlist/);
      return response.data;
    } catch (error) {
      console.error('Wishlist error:', error);
      throw error;
    }
  },

  getWishlist: async () => {
    try {
      const response = await api.get('/wishlist');
      return response.data;
    } catch (error) {
      console.error('Wishlist error:', error);
      throw error;
    }
  }
};
