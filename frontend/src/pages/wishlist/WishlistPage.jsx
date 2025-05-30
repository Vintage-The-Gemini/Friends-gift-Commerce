// frontend/src/pages/wishlist/WishlistPage.jsx - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, Eye, Package, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import { useWishlist } from '../../hooks/useWishlist';
import { productService } from '../../services/api/product';
import { formatCurrency } from '../../utils/currency';

const WishlistPage = () => {
  const navigate = useNavigate();
  const { 
    wishlistItems, 
    removeFromWishlist, 
    clearWishlist, 
    loading: wishlistLoading,
    refreshWishlist 
  } = useWishlist();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load product details for wishlist items
  useEffect(() => {
    loadWishlistProducts();
  }, [wishlistItems]);

  const loadWishlistProducts = async () => {
    if (wishlistItems.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch product details for each wishlist item
      const productPromises = wishlistItems.map(async (productId) => {
        try {
          const response = await productService.getProductById(productId);
          if (response.success) {
            return response.data;
          }
          return null;
        } catch (error) {
          console.error(`Error fetching product ${productId}:`, error);
          return null;
        }
      });

      const productResults = await Promise.all(productPromises);
      const validProducts = productResults.filter(product => product !== null);
      
      setProducts(validProducts);
    } catch (error) {
      console.error('Error loading wishlist products:', error);
      toast.error('Failed to load wishlist items');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      const success = await removeFromWishlist(productId);
      if (success) {
        // Remove from local products state immediately
        setProducts(prev => prev.filter(product => product._id !== productId));
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const handleClearWishlist = async () => {
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      try {
        const success = await clearWishlist();
        if (success) {
          setProducts([]);
        }
      } catch (error) {
        console.error('Error clearing wishlist:', error);
      }
    }
  };

  const handleAddToEvent = (product) => {
    navigate('/events/create', {
      state: { 
        selectedProducts: [{
          product: product,
          quantity: 1
        }]
      },
    });
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await refreshWishlist();
      await loadWishlistProducts();
      toast.success('Wishlist refreshed');
    } catch (error) {
      toast.error('Failed to refresh wishlist');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your wishlist...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Heart className="w-8 h-8 text-red-500 fill-current mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
                <p className="text-gray-600 mt-1">
                  {products.length} item{products.length !== 1 ? 's' : ''} saved for later
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                title="Refresh wishlist"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>

              {/* Clear All Button */}
              {products.length > 0 && (
                <button
                  onClick={handleClearWishlist}
                  className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>



        {/* Wishlist Content */}
        {products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <div className="inline-flex justify-center items-center w-20 h-20 rounded-full bg-red-50 mb-6">
              <Heart className="h-10 w-10 text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Your wishlist is empty
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Browse our products and add items you love to your wishlist
            </p>
            <button
              onClick={() => navigate('/products')}
              className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-200 border border-gray-100"
              >
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  {product.images?.[0]?.url ? (
                    <img
                      src={product.images[0].url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  
                  {/* Fallback placeholder */}
                  <div 
                    className="w-full h-full flex items-center justify-center"
                    style={{ display: product.images?.[0]?.url ? 'none' : 'flex' }}
                  >
                    <Package className="w-12 h-12 text-gray-400" />
                  </div>
                  
                  {/* Remove from wishlist button */}
                  <button
                    onClick={() => handleRemoveFromWishlist(product._id)}
                    disabled={wishlistLoading}
                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full text-red-500 hover:bg-white hover:text-red-600 transition-all duration-200 shadow-lg disabled:opacity-50"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {/* Wishlist indicator */}
                  <div className="absolute bottom-3 right-3">
                    <div className="bg-red-500 text-white p-1.5 rounded-full shadow-lg">
                      <Heart className="w-3 h-3 fill-current" />
                    </div>
                  </div>

                  {/* Out of stock overlay */}
                  {product.stock <= 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-medium px-3 py-1 bg-red-500 rounded-md text-sm">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
                    {product.name}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="mb-4">
                    <span className="font-bold text-indigo-600 text-xl">
                      {formatCurrency(product.price)}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToEvent(product)}
                      disabled={product.stock <= 0}
                      className="flex-1 bg-indigo-600 text-white text-sm py-2.5 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Add to Event
                    </button>

                    <button
                      onClick={() => navigate(`/products/${product._id}`)}
                      className="px-3 py-2.5 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Section */}
        {products.length > 0 && (
          <div className="mt-12 bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Wishlist Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{products.length}</div>
                <div className="text-sm text-gray-500">Items Saved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(products.reduce((total, item) => total + (item.price || 0), 0))}
                </div>
                <div className="text-sm text-gray-500">Total Value</div>
              </div>
              <div className="text-center">
                <button
                  onClick={() => navigate('/events/create', {
                    state: { 
                      selectedProducts: products.map(product => ({
                        product: product,
                        quantity: 1
                      }))
                    },
                  })}
                  disabled={products.some(p => p.stock <= 0)}
                  className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Create Event with All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;