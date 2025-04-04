// src/components/products/CompactProductCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Heart, Gift, Clock, Star, AlertCircle } from "lucide-react";
import { formatCurrency } from "../../utils/currency";

const CompactProductCard = ({ product, onAddToEvent, showActions = true }) => {
  if (!product) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-200">
      {/* Product Image */}
      <Link to={`/products/${product._id}`}>
        <div className="relative h-40 overflow-hidden bg-gray-100">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0].url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Gift className="h-10 w-10 text-gray-300" />
            </div>
          )}
          
          {/* Stock Status Indicator */}
          {product.stock <= 0 && (
            <div className="absolute top-0 left-0 right-0 bg-red-500 text-white text-xs font-medium text-center py-1">
              Out of Stock
            </div>
          )}
          {product.stock > 0 && product.stock <= 5 && (
            <div className="absolute top-0 left-0 right-0 bg-amber-500 text-white text-xs font-medium text-center py-1">
              Only {product.stock} left
            </div>
          )}
        </div>
      </Link>
      
      {/* Product Info */}
      <div className="p-3">
        <Link to={`/products/${product._id}`}>
          <h3 className="font-medium text-gray-900 text-sm mb-1 truncate">
            {product.name}
          </h3>
        </Link>
        
        {/* Price */}
        <div className="flex justify-between items-center mb-2">
          <div className="font-semibold text-indigo-700">
            {formatCurrency(product.price || product.sellingPrice)}
          </div>
          {product.marketPrice && product.marketPrice > (product.price || product.sellingPrice) && (
            <div className="text-xs text-gray-500 line-through">
              {formatCurrency(product.marketPrice)}
            </div>
          )}
        </div>
        
        {/* Ratings and Add to Event */}
        <div className="flex justify-between items-center">
          <div className="flex items-center text-xs">
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
            <span className="text-gray-500 ml-1">
              ({product.reviews?.length || 0})
            </span>
          </div>
          
          {showActions && (
            <button
              onClick={() => onAddToEvent && onAddToEvent(product)}
              disabled={product.stock <= 0}
              className={`text-xs px-2 py-1 rounded flex items-center ${
                product.stock <= 0
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              <Gift className="w-3 h-3 mr-1" />
              {product.stock <= 0 ? "Sold Out" : "Add to Event"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompactProductCard;