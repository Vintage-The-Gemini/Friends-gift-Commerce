// src/components/products/ProductCard.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Gift, Eye, AlertCircle } from "lucide-react";
import { formatCurrency } from "../../utils/currency";
import { productService } from "../../services/api/product";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";

const ProductCard = ({
  product,
  onAddToEvent,
  compact = false,
  className = "",
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(
    product?.inWishlist || false
  );
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  if (!product) return null;

  const { _id, name, price, description, images, stock } = product;
  const isInStock = stock > 0;

  // Get the primary image URL with fallback
  const imageUrl =
    images && images.length > 0 ? images[0].url : "/api/placeholder/400/400";

  const handleAddToEvent = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.info("Please sign in to add products to your event");
      navigate("/auth/signin");
      return;
    }

    if (onAddToEvent) {
      onAddToEvent(product);
    } else {
      navigate(`/events/create?product=${_id}`);
    }
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.info("Please sign in to save products to your wishlist");
      navigate("/auth/signin");
      return;
    }

    try {
      setIsWishlistLoading(true);
      const response = await productService.toggleWishlist(_id);

      if (response.success) {
        setIsWishlisted(!isWishlisted);
        toast.success(
          isWishlisted
            ? "Product removed from wishlist"
            : "Product added to wishlist"
        );
      }
    } catch (error) {
      toast.error("Failed to update wishlist");
      console.error("Wishlist error:", error);
    } finally {
      setIsWishlistLoading(false);
    }
  };

  // Compact version for selection lists, etc.
  if (compact) {
    return (
      <Link
        to={`/products/${_id}`}
        className={`group flex items-center p-3 border rounded-lg hover:border-indigo-500 hover:shadow-md transition-all ${className}`}
      >
        <div className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="font-medium text-gray-900">{name}</h3>
          <p className="text-indigo-600 font-semibold">
            {formatCurrency(price)}
          </p>
        </div>
      </Link>
    );
  }

  // Default card view
  return (
    <div
      className={`group bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 ${className}`}
    >
      <Link to={`/products/${_id}`} className="block relative">
        <div className="aspect-square overflow-hidden">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Status Badge */}
        {!isInStock && (
          <div className="absolute top-2 left-2 bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full flex items-center">
            <AlertCircle className="w-3 h-3 mr-1" />
            Out of Stock
          </div>
        )}

        {/* Wishlist Action */}
        <button
          onClick={handleToggleWishlist}
          disabled={isWishlistLoading}
          className="absolute top-2 right-2 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-colors"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`w-4 h-4 ${
              isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
            } transition-colors`}
          />
        </button>
      </Link>

      <div className="p-4">
        <Link to={`/products/${_id}`}>
          <h3 className="font-medium text-gray-900 group-hover:text-indigo-700 transition-colors mb-1 truncate">
            {name}
          </h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2 h-10">
            {description}
          </p>
        </Link>

        <div className="flex items-center justify-between mt-2">
          <span className="text-lg font-bold text-indigo-700">
            {formatCurrency(price)}
          </span>

          <div className="flex items-center gap-1.5">
            <Link
              to={`/products/${_id}`}
              className="p-1.5 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
              aria-label="View details"
            >
              <Eye className="w-4 h-4" />
            </Link>

            <button
              onClick={handleAddToEvent}
              disabled={!isInStock}
              className={`min-w-[80px] px-3 py-1.5 rounded-lg flex items-center justify-center ${
                isInStock
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              } transition-colors`}
              aria-label={isInStock ? "Add to event" : "Out of stock"}
            >
              <Gift className="w-3.5 h-3.5 mr-1" />
              <span className="text-xs font-medium whitespace-nowrap">Add to Event</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;