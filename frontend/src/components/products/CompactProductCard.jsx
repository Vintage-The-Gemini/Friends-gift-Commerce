// frontend/src/components/products/CompactProductCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Gift } from "lucide-react";
import { formatCurrency } from "../../utils/currency";

const CompactProductCard = ({ 
  product, 
  onAddToEvent, 
  onToggleWishlist = null,
  onProductClick = null,
  showAddToEvent = true
}) => {
  const handleAddToEvent = (e) => {
    e.stopPropagation();
    if (onAddToEvent) {
      onAddToEvent(product);
    }
  };

  const handleToggleWishlist = (e) => {
    e.stopPropagation();
    if (onToggleWishlist) {
      onToggleWishlist(product._id);
    }
  };

  const handleCardClick = () => {
    if (onProductClick) {
      onProductClick(product);
    } else {
      // Default behavior - navigate to product details
      window.location.href = `/products/${product._id}`;
    }
  };

  // Default image if none is provided
  const productImage = product.images?.length > 0 
    ? product.images[0].url 
    : "/api/placeholder/300/300";

  return (
    <div 
      className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Product Image */}
      <div className="relative">
        <img
          src={productImage}
          alt={product.name}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/api/placeholder/300/300";
          }}
        />
        
        {/* Wishlist button */}
        {onToggleWishlist && (
          <button
            onClick={handleToggleWishlist}
            className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm hover:bg-gray-100"
            aria-label="Add to wishlist"
          >
            <Heart 
              className={`w-4 h-4 text-gray-500 hover:text-red-500 ${
                product.inWishlist ? 'fill-red-500 text-red-500' : ''
              }`} 
            />
          </button>
        )}
        
        {/* Discount badge */}
        {product.discount > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            {product.discount}% OFF
          </div>
        )}
      </div>
      
      {/* Product details */}
      <div className="p-4">
        <h3 className="font-medium text-gray-900 mb-1 truncate">
          {product.name}
        </h3>
        
        {/* Price display with margin if applicable */}
        <div className="flex items-center mb-3">
          {product.basePrice ? (
            <>
              <div className="text-indigo-700 font-bold">
                {formatCurrency(product.price)}
              </div>
              <div className="ml-2 text-xs line-through text-gray-500">
                {formatCurrency(product.basePrice)}
              </div>
              <div className="ml-2 text-xs text-green-600">
                ({product.marginPercentage}% margin)
              </div>
            </>
          ) : (
            <div className="text-indigo-700 font-bold">
              {formatCurrency(product.price)}
            </div>
          )}
        </div>
        
     
        
        {/* Add to Event button */}
        {showAddToEvent && (
          <button
            onClick={handleAddToEvent}
            disabled={!product.isActive || product.stock <= 0}
            className={`w-full text-xs rounded-lg py-1.5 flex items-center justify-center transition-colors ${
              !product.isActive || product.stock <= 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
          >
            <Gift className="w-3 h-3 mr-1" />
            Add to Event
          </button>
        )}
      </div>
    </div>
  );
};

export default CompactProductCard;