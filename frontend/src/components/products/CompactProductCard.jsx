// src/components/products/CompactProductCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Heart, Gift, ShoppingBag } from "lucide-react";
import { formatCurrency } from "../../utils/currency";

/**
 * CompactProductCard - A compact card component for displaying products in a grid layout
 *
 * @param {Object} props
 * @param {Object} props.product - The product object to display
 * @param {Function} props.onAddToEvent - Function to call when adding product to an event
 * @param {Function} props.onAddToWishlist - Optional function to call when adding to wishlist
 * @param {boolean} props.inWishlist - Optional flag to indicate if product is in wishlist
 */
const CompactProductCard = ({
  product,
  onAddToEvent,
  onAddToWishlist,
  inWishlist = false,
}) => {
  if (!product) return null;

  // Get primary image or fallback
  const productImage =
    product.images && product.images.length > 0
      ? product.images.find((img) => img.isPrimary)?.url ||
        product.images[0].url
      : "/api/placeholder/400/400";

  // Format price
  const price = formatCurrency(product.price);

  // Handle adding to event
  const handleAddToEvent = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToEvent) {
      onAddToEvent(product);
    }
  };

  // Handle adding to wishlist
  const handleAddToWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToWishlist) {
      onAddToWishlist(product);
    }
  };

  return (
    <Link
      to={`/products/${product._id}`}
      className="group block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={productImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Badge for stock status */}
        {product.stock <= 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
            Out of Stock
          </div>
        )}

        {/* Quick action buttons - overlay on hover */}
        <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={handleAddToEvent}
            disabled={product.stock <= 0}
            className={`p-2 rounded-full 
              ${
                product.stock > 0
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              } transition-colors`}
            title="Add to Event"
          >
            <Gift className="w-5 h-5" />
          </button>

          {onAddToWishlist && (
            <button
              onClick={handleAddToWishlist}
              className={`p-2 rounded-full ${
                inWishlist
                  ? "bg-red-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              } transition-colors`}
              title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
            >
              <Heart className={`w-5 h-5 ${inWishlist ? "fill-white" : ""}`} />
            </button>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-3">
        {/* Title - truncated for compact display */}
        <h3 className="font-medium text-gray-900 text-sm line-clamp-1 mb-1">
          {product.name}
        </h3>

        {/* Price and vendor info */}
        <div className="flex justify-between items-center">
          <span className="text-indigo-600 font-bold">{price}</span>

          {/* Show category or brand if available */}
          {(product.category?.name || product.brand) && (
            <span className="text-xs text-gray-500 truncate">
              {product.category?.name || product.brand}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default CompactProductCard;
