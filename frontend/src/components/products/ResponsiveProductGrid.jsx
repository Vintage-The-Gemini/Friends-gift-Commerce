import React, { useState } from 'react';
import { Heart, ShoppingBag, Star, Search, Filter, Grid, List, ChevronRight, ChevronLeft } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

const ResponsiveProductGrid = ({ 
  products = [], 
  loading = false, 
  onAddToCart,
  onToggleWishlist,
  onProductClick
}) => {
  const [viewMode, setViewMode] = useState('grid');
  const [page, setPagination] = useState(1);
  const itemsPerPage = 12;
  const totalPages = Math.ceil(products.length / itemsPerPage);
  
  const displayedProducts = products.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handlePrevPage = () => {
    if (page > 1) {
      setPagination(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPagination(page + 1);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  if (products.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-lg shadow-sm">
        <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <Search className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No products found
        </h3>
        <p className="text-gray-500 mb-6">
          Try adjusting your search or filters to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* View Controls */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">
          Showing {displayedProducts.length} of {products.length} products
        </p>
        
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}
            aria-label="Grid view"
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}
            aria-label="List view"
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {displayedProducts.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow relative"
            >
              <div 
                className="h-40 bg-gray-100 relative overflow-hidden cursor-pointer"
                onClick={() => onProductClick && onProductClick(product)}
              >
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0].url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ShoppingBag className="h-10 w-10 text-gray-300" />
                  </div>
                )}
                
                {product.stock <= 5 && product.stock > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-amber-500 text-white text-xs text-center py-1">
                    Only {product.stock} left in stock
                  </div>
                )}
                {product.stock === 0 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-red-500 text-white text-xs text-center py-1">
                    Out of stock
                  </div>
                )}
              </div>

              <button
                onClick={() => onToggleWishlist && onToggleWishlist(product._id)}
                className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm hover:bg-gray-100"
                aria-label="Add to wishlist"
              >
                <Heart className={`w-4 h-4 ${product.inWishlist ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
              </button>

              <div className="p-3">
                <h3 
                  className="text-sm font-medium text-gray-900 mb-1 truncate cursor-pointer"
                  onClick={() => onProductClick && onProductClick(product)}
                >
                  {product.name}
                </h3>

                <div className="flex items-center mb-2">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < (product.rating || 4) ? "fill-current" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 ml-1">
                    ({product.reviews?.length || 0})
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-indigo-700 font-semibold">
                    {formatCurrency(product.price)}
                  </div>

                  <button
                    onClick={() => onAddToCart && onAddToCart(product)}
                    disabled={product.stock === 0}
                    className={`text-xs px-2 py-1 rounded flex items-center ${
                      product.stock === 0
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                    }`}
                  >
                    <ShoppingBag className="w-3 h-3 mr-1" />
                    {product.stock === 0 ? "Sold Out" : "Add"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {displayedProducts.map((product) => (
            <div
              key={product._id}
              className="flex flex-col sm:flex-row bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div 
                className="h-48 sm:h-auto sm:w-48 bg-gray-100 relative cursor-pointer"
                onClick={() => onProductClick && onProductClick(product)}
              >
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0].url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ShoppingBag className="h-10 w-10 text-gray-300" />
                  </div>
                )}
                
                {product.stock <= 5 && product.stock > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-amber-500 text-white text-xs text-center py-1">
                    Only {product.stock} left
                  </div>
                )}
                {product.stock === 0 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-red-500 text-white text-xs text-center py-1">
                    Out of stock
                  </div>
                )}
              </div>
              
              <div className="flex-1 p-4 flex flex-col">
                <div className="flex justify-between">
                  <h3 
                    className="text-lg font-medium text-gray-900 mb-1 cursor-pointer"
                    onClick={() => onProductClick && onProductClick(product)}
                  >
                    {product.name}
                  </h3>
                  
                  <button
                    onClick={() => onToggleWishlist && onToggleWishlist(product._id)}
                    className="p-1.5 bg-white rounded-full hover:bg-gray-100"
                    aria-label="Add to wishlist"
                  >
                    <Heart className={`w-4 h-4 ${product.inWishlist ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
                  </button>
                </div>
                
                <div className="flex items-center mb-2">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < (product.rating || 4) ? "fill-current" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500 ml-1">
                    ({product.reviews?.length || 0})
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 flex-grow line-clamp-2">
                  {product.description || "No description available for this product."}
                </p>
                
                <div className="flex justify-between items-center mt-auto">
                  <div className="text-indigo-700 font-bold text-lg">
                    {formatCurrency(product.price)}
                  </div>
                  
                  <button
                    onClick={() => onAddToCart && onAddToCart(product)}
                    disabled={product.stock === 0}
                    className={`px-4 py-2 rounded-lg ${
                      product.stock === 0
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                    }`}
                  >
                    <span className="flex items-center">
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      {product.stock === 0 ? "Sold Out" : "Add to Cart"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={page === 1}
              className="p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <span className="px-4 py-2 text-sm">
              Page {page} of {totalPages}
            </span>
            
            <button
              onClick={handleNextPage}
              disabled={page >= totalPages}
              className="p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponsiveProductGrid;