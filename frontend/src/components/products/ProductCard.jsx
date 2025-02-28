// src/components/products/ProductCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import { formatCurrency } from "../../utils/currency";

const ProductCard = ({
  product,
  onAddToEvent,
  onAddToWishlist,
  compact = false,
  className = "",
}) => {
  if (!product) return null;

  const { _id, name, price, description, images, stock } = product;

  const handleAddToEvent = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToEvent) onAddToEvent(product);
  };

  const handleAddToWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToWishlist) onAddToWishlist(_id);
  };

  // Determine if product is in stock
  const isInStock = stock > 0;

  // Determine primary image URL
  const imageUrl =
    images && images.length > 0 ? images[0].url : "/api/placeholder/400/400"; // Fallback image

  if (compact) {
    return (
      <Link
        to={`/products/${_id}`}
        className={`group flex items-center p-3 border rounded-lg hover:border-[#5551FF] transition-colors ${className}`}
      >
        <div className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="font-medium text-gray-900">{name}</h3>
          <p className="text-[#5551FF] font-semibold">
            {formatCurrency(price)}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <div
      className={`group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 ${className}`}
    >
      <Link to={`/products/${_id}`} className="block relative">
        <div className="aspect-square">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Status Badge */}
        {!isInStock && (
          <span className="absolute top-2 left-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
            Out of Stock
          </span>
        )}

        {/* Quick Actions */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleAddToWishlist}
            className="p-2 bg-white rounded-full shadow-md hover:bg-[#5551FF] hover:text-white transition-colors"
          >
            <Heart className="w-4 h-4" />
          </button>
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/products/${_id}`}>
          <h3 className="font-medium text-lg mb-1 text-gray-900">{name}</h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {description}
          </p>
        </Link>

        <div className="flex justify-between items-center">
          <span className="text-lg font-bold">{formatCurrency(price)}</span>

          <div className="flex space-x-2">
            <Link
              to={`/products/${_id}`}
              className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <Eye className="w-5 h-5" />
            </Link>

            <button
              onClick={handleAddToEvent}
              disabled={!isInStock}
              className={`px-3 py-2 rounded-lg flex items-center ${
                isInStock
                  ? "bg-[#5551FF] text-white hover:bg-[#4440FF]"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              <ShoppingBag className="w-4 h-4 mr-1" />
              <span className="text-sm">Add</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
