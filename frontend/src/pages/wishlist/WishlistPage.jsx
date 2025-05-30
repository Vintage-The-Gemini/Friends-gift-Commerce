// frontend/src/pages/wishlist/WishlistPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, Eye, Package } from 'lucide-react';
import { toast } from 'react-toastify';

const formatCurrency = (amount) => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    return `$${amount?.toFixed(2) || '0.00'}`;
  }
};

// Mock products data
const mockProducts = {
  '1': {
    _id: '1',
    name: 'Wireless Bluetooth Headphones',
    description: 'High-quality wireless headphones with noise cancellation',
    price: 129.99,
    images: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400' }]
  },
  '2': {
    _id: '2',
    name: 'Smart Watch Series 5',
    description: 'Advanced smartwatch with health monitoring',
    price: 199.99,
    images: [{ url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400' }]
  },
  '3': {
    _id: '3',
    name: 'Premium Coffee Mug Set',
    description: 'Beautiful ceramic coffee mug set',
    price: 29.99,
    images: [{ url: 'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=400' }]
  }
};

const WishlistPage = () => {
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = () => {
    try {
      const stored = localStorage.getItem('friendsgift_wishlist');
      const wishlistIds = stored ? JSON.parse(stored) : [];
      
      // Get product details for wishlist items
      const items = wishlistIds.map(id => mockProducts[id]).filter(Boolean);
      setWishlistItems(items);
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = (productId) => {
    try {
      const stored = localStorage.getItem('friendsgift_wishlist');
      const wishlistIds = stored ? JSON.parse(stored) : [];
      const updatedIds = wishlistIds.filter(id => id !== productId);
      
      localStorage.setItem('friendsgift_wishlist', JSON.stringify(updatedIds));
      setWishlistItems(prev => prev.filter(item => item._id !== productId));
      
      toast.success('Removed from wishlist', {
        position: "bottom-right",
        autoClose: 2000,
      });
    } catch (error) {
      toast.error('Failed to remove from wishlist');
    }
  };

  const addToEvent = (product) => {
    navigate('/events/create', {
      state: { 
        selectedProducts: [{
          product: product,
          quantity: 1
        }]
      },
    });
  };

  const clearWishlist = () => {
    try {
      localStorage.removeItem('friendsgift_wishlist');
      setWishlistItems([]);
      toast.success('Wishlist cleared', {
        position: "bottom-right",
        autoClose: 2000,
      });
    } catch (error) {
      toast.error('Failed to clear wishlist');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
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
                  {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} saved for later
                </p>
              </div>
            </div>
            
            {wishlistItems.length > 0 && (
              <button
                onClick={clearWishlist}
                className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Wishlist Content */}
        {wishlistItems.length === 0 ? (
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
            {wishlistItems.map((product) => (
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
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Remove from wishlist button */}
                  <button
                    onClick={() => removeFromWishlist(product._id)}
                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full text-red-500 hover:bg-white hover:text-red-600 transition-all duration-200 shadow-lg"
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
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
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
                      onClick={() => addToEvent(product)}
                      className="flex-1 bg-indigo-600 text-white text-sm py-2.5 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center"
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
        {wishlistItems.length > 0 && (
          <div className="mt-12 bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Wishlist Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{wishlistItems.length}</div>
                <div className="text-sm text-gray-500">Items Saved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(wishlistItems.reduce((total, item) => total + item.price, 0))}
                </div>
                <div className="text-sm text-gray-500">Total Value</div>
              </div>
              <div className="text-center">
                <button
                  onClick={() => navigate('/events/create', {
                    state: { 
                      selectedProducts: wishlistItems.map(product => ({
                        product: product,
                        quantity: 1
                      }))
                    },
                  })}
                  className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
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