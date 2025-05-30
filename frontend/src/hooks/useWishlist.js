// frontend/src/hooks/useWishlist.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { wishlistService } from '../services/api/wishlist';
import { toast } from 'react-toastify';

// Create Wishlist Context
const WishlistContext = createContext();

// Wishlist Provider Component
export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Initialize wishlist when user changes
  useEffect(() => {
    if (user) {
      loadWishlist();
    } else {
      // Clear wishlist when user logs out
      setWishlistItems([]);
      setInitialized(false);
    }
  }, [user]);

  // Load wishlist from server or localStorage
  const loadWishlist = useCallback(async () => {
    if (!user) {
      // For non-authenticated users, use localStorage
      try {
        const stored = localStorage.getItem('friendsgift_wishlist');
        const wishlistIds = stored ? JSON.parse(stored) : [];
        setWishlistItems(wishlistIds);
      } catch (error) {
        console.error('Error loading wishlist from localStorage:', error);
        setWishlistItems([]);
      }
      setInitialized(true);
      return;
    }

    // For authenticated users, load from server
    try {
      setLoading(true);
      const response = await wishlistService.getWishlist({
        page: 1,
        limit: 100 // Get all items for now
      });

      if (response.success) {
        // Extract just the product IDs for easy checking
        const productIds = response.data.map(item => item.product._id);
        setWishlistItems(productIds);
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
      // Fallback to localStorage
      try {
        const stored = localStorage.getItem('friendsgift_wishlist');
        const wishlistIds = stored ? JSON.parse(stored) : [];
        setWishlistItems(wishlistIds);
      } catch (localError) {
        console.error('Error loading from localStorage:', localError);
        setWishlistItems([]);
      }
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, [user]);

  // Check if product is in wishlist
  const isInWishlist = useCallback((productId) => {
    return wishlistItems.includes(productId);
  }, [wishlistItems]);

  // Add product to wishlist
  const addToWishlist = useCallback(async (productId) => {
    if (!productId) {
      toast.error('Invalid product');
      return false;
    }

    // Optimistic update
    setWishlistItems(prev => {
      if (prev.includes(productId)) {
        return prev; // Already in wishlist
      }
      return [...prev, productId];
    });

    if (user) {
      // Save to server
      try {
        await wishlistService.addToWishlist(productId);
        toast.success('Added to wishlist', {
          position: "bottom-right",
          autoClose: 2000,
        });
        return true;
      } catch (error) {
        // Revert optimistic update
        setWishlistItems(prev => prev.filter(id => id !== productId));
        
        if (error.message.includes('already in wishlist')) {
          toast.info('Item already in wishlist');
        } else {
          toast.error(error.message || 'Failed to add to wishlist');
        }
        return false;
      }
    } else {
      // Save to localStorage for non-authenticated users
      try {
        const stored = localStorage.getItem('friendsgift_wishlist');
        const currentWishlist = stored ? JSON.parse(stored) : [];
        
        if (!currentWishlist.includes(productId)) {
          const updatedWishlist = [...currentWishlist, productId];
          localStorage.setItem('friendsgift_wishlist', JSON.stringify(updatedWishlist));
          toast.success('Added to wishlist', {
            position: "bottom-right",
            autoClose: 2000,
          });
        } else {
          toast.info('Item already in wishlist');
        }
        return true;
      } catch (error) {
        // Revert optimistic update
        setWishlistItems(prev => prev.filter(id => id !== productId));
        toast.error('Failed to add to wishlist');
        return false;
      }
    }
  }, [user]);

  // Remove product from wishlist
  const removeFromWishlist = useCallback(async (productId) => {
    if (!productId) {
      toast.error('Invalid product');
      return false;
    }

    // Optimistic update
    setWishlistItems(prev => prev.filter(id => id !== productId));

    if (user) {
      // Remove from server
      try {
        await wishlistService.removeFromWishlist(productId);
        toast.success('Removed from wishlist', {
          position: "bottom-right",
          autoClose: 2000,
        });
        return true;
      } catch (error) {
        // Revert optimistic update
        setWishlistItems(prev => [...prev, productId]);
        toast.error(error.message || 'Failed to remove from wishlist');
        return false;
      }
    } else {
      // Remove from localStorage
      try {
        const stored = localStorage.getItem('friendsgift_wishlist');
        const currentWishlist = stored ? JSON.parse(stored) : [];
        const updatedWishlist = currentWishlist.filter(id => id !== productId);
        localStorage.setItem('friendsgift_wishlist', JSON.stringify(updatedWishlist));
        toast.success('Removed from wishlist', {
          position: "bottom-right",
          autoClose: 2000,
        });
        return true;
      } catch (error) {
        // Revert optimistic update
        setWishlistItems(prev => [...prev, productId]);
        toast.error('Failed to remove from wishlist');
        return false;
      }
    }
  }, [user]);

  // Toggle wishlist status
  const toggleWishlist = useCallback(async (productId) => {
    if (isInWishlist(productId)) {
      return await removeFromWishlist(productId);
    } else {
      return await addToWishlist(productId);
    }
  }, [isInWishlist, addToWishlist, removeFromWishlist]);

  // Clear entire wishlist
  const clearWishlist = useCallback(async () => {
    const previousItems = [...wishlistItems];
    
    // Optimistic update
    setWishlistItems([]);

    if (user) {
      // Clear from server
      try {
        await wishlistService.clearWishlist();
        toast.success('Wishlist cleared', {
          position: "bottom-right",
          autoClose: 2000,
        });
        return true;
      } catch (error) {
        // Revert optimistic update
        setWishlistItems(previousItems);
        toast.error(error.message || 'Failed to clear wishlist');
        return false;
      }
    } else {
      // Clear from localStorage
      try {
        localStorage.removeItem('friendsgift_wishlist');
        toast.success('Wishlist cleared', {
          position: "bottom-right",
          autoClose: 2000,
        });
        return true;
      } catch (error) {
        // Revert optimistic update
        setWishlistItems(previousItems);
        toast.error('Failed to clear wishlist');
        return false;
      }
    }
  }, [user, wishlistItems]);

  // Get wishlist count
  const getWishlistCount = useCallback(() => {
    return wishlistItems.length;
  }, [wishlistItems]);

  // Refresh wishlist from server
  const refreshWishlist = useCallback(async () => {
    await loadWishlist();
  }, [loadWishlist]);

  const contextValue = {
    // State
    wishlistItems,
    loading,
    initialized,
    
    // Methods
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
    refreshWishlist,
    
    // Utils
    getWishlistCount,
  };

  return (
    <WishlistContext.Provider value={contextValue}>
      {children}
    </WishlistContext.Provider>
  );
};

// Custom hook to use wishlist context
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  
  return context;
};

// Helper hook for wishlist state without context requirement
export const useWishlistState = () => {
  const [localWishlist, setLocalWishlist] = useState([]);
  
  useEffect(() => {
    // Load from localStorage on mount
    try {
      const stored = localStorage.getItem('friendsgift_wishlist');
      const wishlistIds = stored ? JSON.parse(stored) : [];
      setLocalWishlist(wishlistIds);
    } catch (error) {
      console.error('Error loading wishlist from localStorage:', error);
    }
  }, []);

  const isInLocalWishlist = useCallback((productId) => {
    return localWishlist.includes(productId);
  }, [localWishlist]);

  const toggleLocalWishlist = useCallback((productId) => {
    try {
      const stored = localStorage.getItem('friendsgift_wishlist');
      const currentWishlist = stored ? JSON.parse(stored) : [];
      
      let updatedWishlist;
      if (currentWishlist.includes(productId)) {
        updatedWishlist = currentWishlist.filter(id => id !== productId);
        toast.success('Removed from wishlist');
      } else {
        updatedWishlist = [...currentWishlist, productId];
        toast.success('Added to wishlist');
      }
      
      localStorage.setItem('friendsgift_wishlist', JSON.stringify(updatedWishlist));
      setLocalWishlist(updatedWishlist);
      
      return !currentWishlist.includes(productId);
    } catch (error) {
      toast.error('Failed to update wishlist');
      return false;
    }
  }, []);

  return {
    wishlistItems: localWishlist,
    isInWishlist: isInLocalWishlist,
    toggleWishlist: toggleLocalWishlist,
    count: localWishlist.length,
  };
};

export default useWishlist;