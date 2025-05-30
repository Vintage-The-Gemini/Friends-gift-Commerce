// frontend/src/hooks/useWishlist.js
import { useState, useEffect, useCallback } from 'react';
import { wishlistService } from '../services/api/wishlist';
import { useAuth } from './useAuth';
import { toast } from 'react-toastify';

export const useWishlist = () => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cache for wishlist status checks
  const [statusCache, setStatusCache] = useState(new Map());

  // Fetch wishlist
  const fetchWishlist = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await wishlistService.getWishlist();
      
      if (response.success) {
        setWishlistItems(response.data);
        setWishlistCount(response.stats?.totalItems || 0);
        
        // Update status cache
        const newCache = new Map();
        response.data.forEach(item => {
          newCache.set(item.product._id, true);
        });
        setStatusCache(newCache);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching wishlist:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Check if product is in wishlist
  const isInWishlist = useCallback((productId) => {
    return statusCache.has(productId);
  }, [statusCache]);

  // Add to wishlist
  const addToWishlist = useCallback(async (productId, options = {}) => {
    if (!user) {
      toast.info('Please sign in to add items to your wishlist');
      return false;
    }

    try {
      const response = await wishlistService.addToWishlist(productId, options);
      
      if (response.success) {
        setWishlistItems(prev => [...prev, response.data]);
        setWishlistCount(prev => prev + 1);
        setStatusCache(prev => new Map(prev).set(productId, true));
        toast.success('Added to wishlist');
        return true;
      }
    } catch (err) {
      toast.error(err.message || 'Failed to add to wishlist');
      console.error('Error adding to wishlist:', err);
      return false;
    }
  }, [user]);

  // Remove from wishlist
  const removeFromWishlist = useCallback(async (productId) => {
    if (!user) return false;

    try {
      const response = await wishlistService.removeFromWishlist(productId);
      
      if (response.success) {
        setWishlistItems(prev => prev.filter(item => item.product._id !== productId));
        setWishlistCount(prev => prev - 1);
        setStatusCache(prev => {
          const newCache = new Map(prev);
          newCache.delete(productId);
          return newCache;
        });
        toast.success('Removed from wishlist');
        return true;
      }
    } catch (err) {
      toast.error(err.message || 'Failed to remove from wishlist');
      console.error('Error removing from wishlist:', err);
      return false;
    }
  }, [user]);

  // Toggle wishlist status
  const toggleWishlist = useCallback(async (productId, options = {}) => {
    const inWishlist = isInWishlist(productId);
    
    if (inWishlist) {
      return await removeFromWishlist(productId);
    } else {
      return await addToWishlist(productId, options);
    }
  }, [isInWishlist, addToWishlist, removeFromWishlist]);

  // Check wishlist status for a product (with API call)
  const checkWishlistStatus = useCallback(async (productId) => {
    if (!user) return false;
    
    // Return cached result if available
    if (statusCache.has(productId)) {
      return statusCache.get(productId);
    }

    try {
      const response = await wishlistService.checkWishlistStatus(productId);
      
      if (response.success) {
        const status = response.data.isInWishlist;
        setStatusCache(prev => new Map(prev).set(productId, status));
        return status;
      }
    } catch (err) {
      console.error('Error checking wishlist status:', err);
    }
    
    return false;
  }, [user, statusCache]);

  // Update wishlist item
  const updateWishlistItem = useCallback(async (productId, updates) => {
    if (!user) return false;

    try {
      const response = await wishlistService.updateWishlistItem(productId, updates);
      
      if (response.success) {
        setWishlistItems(prev => 
          prev.map(item => 
            item.product._id === productId ? response.data : item
          )
        );
        toast.success('Item updated');
        return true;
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update item');
      console.error('Error updating wishlist item:', err);
      return false;
    }
  }, [user]);

  // Clear wishlist
  const clearWishlist = useCallback(async () => {
    if (!user) return false;

    try {
      const response = await wishlistService.clearWishlist();
      
      if (response.success) {
        setWishlistItems([]);
        setWishlistCount(0);
        setStatusCache(new Map());
        toast.success('Wishlist cleared');
        return true;
      }
    } catch (err) {
      toast.error(err.message || 'Failed to clear wishlist');
      console.error('Error clearing wishlist:', err);
      return false;
    }
  }, [user]);

  // Initialize wishlist on user change
  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setWishlistItems([]);
      setWishlistCount(0);
      setStatusCache(new Map());
    }
  }, [user, fetchWishlist]);

  return {
    // State
    wishlistItems,
    wishlistCount,
    loading,
    error,
    
    // Actions
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    updateWishlistItem,
    clearWishlist,
    fetchWishlist,
    
    // Utilities
    isInWishlist,
    checkWishlistStatus,
  };
};