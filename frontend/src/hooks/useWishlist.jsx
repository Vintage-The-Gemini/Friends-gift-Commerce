// frontend/src/hooks/useWishlist.js
import { useState, useEffect, useCallback, useContext, createContext } from 'react';
import { wishlistService } from '../services/api/wishlist';
import { useAuth } from './useAuth';
import { toast } from 'react-toastify';

// Create wishlist context
const WishlistContext = createContext();

// Wishlist provider component
export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch wishlist on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setWishlist([]);
    }
  }, [user]);

  const fetchWishlist = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await wishlistService.getWishlist();
      if (response.success) {
        setWishlist(response.data);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setError('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const isInWishlist = useCallback((productId) => {
    return wishlist.some(item => item.product._id === productId);
  }, [wishlist]);

  const addToWishlist = useCallback(async (productId, notes = '', priority = 'medium') => {
    if (!user) {
      toast.info('Please sign in to add items to your wishlist');
      return false;
    }

    try {
      setLoading(true);
      const response = await wishlistService.addToWishlist(productId, notes, priority);
      
      if (response.success) {
        setWishlist(prev => [...prev, response.data]);
        toast.success('Added to wishlist');
        return true;
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast.error(error.response?.data?.message || 'Failed to add to wishlist');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const removeFromWishlist = useCallback(async (productId) => {
    if (!user) return false;

    try {
      setLoading(true);
      const response = await wishlistService.removeFromWishlist(productId);
      
      if (response.success) {
        setWishlist(prev => prev.filter(item => item.product._id !== productId));
        toast.success('Removed from wishlist');
        return true;
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove from wishlist');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const toggleWishlist = useCallback(async (productId) => {
    if (isInWishlist(productId)) {
      return await removeFromWishlist(productId);
    } else {
      return await addToWishlist(productId);
    }
  }, [isInWishlist, addToWishlist, removeFromWishlist]);

  const clearWishlist = useCallback(async () => {
    if (!user) return false;

    try {
      setLoading(true);
      const response = await wishlistService.clearWishlist();
      
      if (response.success) {
        setWishlist([]);
        toast.success('Wishlist cleared');
        return true;
      }
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      toast.error('Failed to clear wishlist');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getWishlistCount = useCallback(() => {
    return wishlist.length;
  }, [wishlist]);

  const getWishlistValue = useCallback(() => {
    return wishlist.reduce((total, item) => total + (item.product?.price || 0), 0);
  }, [wishlist]);

  const value = {
    wishlist,
    loading,
    error,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
    fetchWishlist,
    getWishlistCount,
    getWishlistValue,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

// Hook to use wishlist
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export default useWishlist;