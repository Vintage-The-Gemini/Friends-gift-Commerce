// src/components/products/CompactProductCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Heart, Gift, Eye } from "lucide-react";
import { formatCurrency } from "../../utils/currency";

/**
 * CompactProductCard - A condensed version of the product card for grid displays
 *
 * @param {Object} product - The product object containing all product details
 * @param {Function} onAddToEvent - Function to handle adding product to an event
 * @param {Function} onToggleWishlist - Optional function to handle wishlist toggle
 * @param {Boolean} inWishlist - Optional flag indicating if product is in user's wishlist
 */
const CompactProductCard = ({
  product,
  onAddToEvent,
  onToggleWishlist,
  inWishlist = false,
}) => {
  if (!product) return null;

  // Handle add to event button click
  const handleAddToEvent = (e) => {
    e.preventDefault(); // Prevent navigation to product details
    e.stopPropagation(); // Prevent event bubbling
    if (onAddToEvent) {
      onAddToEvent(product);
    }
  };

  // Handle wishlist toggle
  const handleWishlistToggle = (e) => {
    e.preventDefault(); // Prevent navigation to product details
    e.stopPropagation(); // Prevent event bubbling
    if (onToggleWishlist) {
      onToggleWishlist(product._id);
    }
  };

  return (
    <div className="group relative bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Product Image */}
      <Link to={`/products/${product._id}`} className="block">
        <div className="relative aspect-square overflow-hidden">
          <img
            src={product.images?.[0]?.url || "/api/placeholder/300/300"}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Out of stock overlay */}
          {product.stock <= 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white text-sm font-medium px-2 py-1 bg-red-500 rounded">
                Out of Stock
              </span>
            </div>
          )}

          {/* Quick action buttons */}
          <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {onToggleWishlist && (
              <button
                onClick={handleWishlistToggle}
                className={`p-1.5 rounded-full ${
                  inWishlist ? "bg-red-100" : "bg-white"
                } shadow hover:shadow-md transition-shadow`}
                aria-label={
                  inWishlist ? "Remove from wishlist" : "Add to wishlist"
                }
              >
                <Heart
                  className={`w-4 h-4 ${
                    inWishlist ? "text-red-500 fill-red-500" : "text-gray-600"
                  }`}
                />
              </button>
            )}
            <Link
              to={`/products/${product._id}`}
              className="p-1.5 rounded-full bg-white shadow hover:shadow-md transition-shadow"
              aria-label="View details"
            >
              <Eye className="w-4 h-4 text-gray-600" />
            </Link>
          </div>
        </div>
      </Link>

      {/* Product Details */}
      <div className="p-3">
        <Link to={`/products/${product._id}`} className="block">
          <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">
            {product.name}
          </h3>
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-gray-900">
              {formatCurrency(product.price)}
            </span>
            {product.marketPrice && product.marketPrice > product.price && (
              <span className="text-xs text-gray-500 line-through">
                {formatCurrency(product.marketPrice)}
              </span>
            )}
          </div>
        </Link>

        {/* Add to Event Button */}
        <button
          onClick={handleAddToEvent}
          disabled={product.stock <= 0}
          className={`w-full py-1.5 px-3 text-xs font-medium rounded flex items-center justify-center transition-colors ${
            product.stock > 0
              ? "bg-indigo-600 text-white hover:bg-indigo-700"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          <Gift className="w-3 h-3 mr-1" />
          Add to Event
        </button>
      </div>
    </div>
  );
};

export default CompactProductCard;
