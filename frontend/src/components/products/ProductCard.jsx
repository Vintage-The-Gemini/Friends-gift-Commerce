// frontend/src/components/products/EnhancedProductCard.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  ShoppingBag,
  Star,
  Eye,
  Share2,
  Package,
  AlertCircle,
  Check,
} from "lucide-react";
import { formatCurrency } from "../../utils/currency";
import { useAuth } from "../../hooks/useAuth";
import { useWishlist } from "../../hooks/useWishlist";
import { toast } from "react-toastify";

const ProductCard = ({
  product,
  onAddToEvent,
  showAddToEvent = true,
  className = "",
  size = "default", // default, compact, large
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    isInWishlist,
    toggleWishlist,
    loading: wishlistLoading,
  } = useWishlist();
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const inWishlist = isInWishlist(product._id);

  // Handle wishlist toggle
  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.info("Please sign in to add items to your wishlist");
      navigate("/auth/signin", {
        state: { from: window.location.pathname },
      });
      return;
    }

    const success = await toggleWishlist(product._id);
    if (success) {
      // Success message is handled by the hook
    }
  };

  // Handle add to event
  const handleAddToEvent = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.info("Please sign in to add products to your event");
      navigate("/auth/signin", {
        state: { from: window.location.pathname },
      });
      return;
    }

    if (onAddToEvent) {
      onAddToEvent(product);
    } else {
      // Default behavior - navigate to create event
      navigate("/events/create", {
        state: {
          selectedProducts: [
            {
              product: product,
              quantity: 1,
            },
          ],
        },
      });
    }
  };

  // Handle share
  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const shareUrl = `${window.location.origin}/products/${product._id}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: `Check out this product: ${product.name}`,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Product link copied to clipboard!");
      }
    } catch (error) {
      console.error("Share failed:", error);
    }
  };

  // Size configurations
  const sizeConfig = {
    compact: {
      container: "max-w-xs",
      image: "h-32",
      title: "text-sm",
      price: "text-base",
      button: "text-xs px-2 py-1",
    },
    default: {
      container: "max-w-sm",
      image: "h-48",
      title: "text-base",
      price: "text-lg",
      button: "text-sm px-3 py-2",
    },
    large: {
      container: "max-w-md",
      image: "h-64",
      title: "text-lg",
      price: "text-xl",
      button: "text-base px-4 py-2",
    },
  };

  const config = sizeConfig[size];

  return (
    <div
      className={`bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100 ${config.container} ${className}`}
    >
      {/* Product Image */}
      <div className="relative group">
        <Link to={`/products/${product._id}`}>
          <div
            className={`relative ${config.image} overflow-hidden bg-gray-100`}
          >
            {!imageError ? (
              <img
                src={product.images?.[0]?.url || "/api/placeholder/400/400"}
                alt={product.name}
                className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                  imageLoading ? "opacity-0" : "opacity-100"
                }`}
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageError(true);
                  setImageLoading(false);
                }}
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
            )}

            {imageLoading && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}

            {/* Stock Status Overlay */}
            {product.stock <= 0 && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-red-500 text-white px-3 py-1 rounded-md font-medium text-sm">
                  Out of Stock
                </div>
              </div>
            )}

            {/* Low Stock Warning */}
            {product.stock > 0 && product.stock <= 5 && (
              <div className="absolute top-2 left-2">
                <div className="bg-orange-500 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Low Stock
                </div>
              </div>
            )}
          </div>
        </Link>

        {/* Floating Action Buttons */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            disabled={wishlistLoading}
            className={`p-2 rounded-full shadow-lg transition-all duration-200 ${
              inWishlist
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-white text-gray-600 hover:bg-gray-50 hover:text-red-500"
            } disabled:opacity-50`}
            title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={`w-4 h-4 ${inWishlist ? "fill-current" : ""}`} />
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-white text-gray-600 hover:bg-gray-50 hover:text-blue-500 shadow-lg transition-all duration-200"
            title="Share product"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Quick View Button */}
          <Link
            to={`/products/${product._id}`}
            className="p-2 rounded-full bg-white text-gray-600 hover:bg-gray-50 hover:text-indigo-500 shadow-lg transition-all duration-200"
            title="Quick view"
          >
            <Eye className="w-4 h-4" />
          </Link>
        </div>

        {/* Wishlist Status Indicator */}
        {inWishlist && (
          <div className="absolute bottom-2 right-2">
            <div className="bg-red-500 text-white p-1 rounded-full">
              <Heart className="w-3 h-3 fill-current" />
            </div>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Seller Info */}
        <div className="text-xs text-gray-500 mb-2">
          by{" "}
          {product.seller?.businessName ||
            product.seller?.name ||
            "Unknown Seller"}
        </div>

        {/* Product Title */}
        <Link to={`/products/${product._id}`}>
          <h3
            className={`font-medium text-gray-900 hover:text-indigo-600 transition-colors mb-2 line-clamp-2 ${config.title}`}
          >
            {product.name}
          </h3>
        </Link>

        {/* Rating (if available) */}
        {product.rating && (
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(product.rating)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500 ml-1">
              ({product.reviewCount || 0})
            </span>
          </div>
        )}

        {/* Price and Stock */}
        <div className="flex justify-between items-center mb-3">
          <span className={`font-bold text-indigo-600 ${config.price}`}>
            {formatCurrency(product.price)}
          </span>
          <span className="text-xs text-gray-500">Stock: {product.stock}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {showAddToEvent && (
            <button
              onClick={handleAddToEvent}
              disabled={product.stock <= 0}
              className={`flex-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center ${config.button}`}
            >
              <ShoppingBag className="w-4 h-4 mr-1" />
              Add to Event
            </button>
          )}

          {/* Alternative: View Details Button */}
          {!showAddToEvent && (
            <Link
              to={`/products/${product._id}`}
              className={`flex-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-center ${config.button}`}
            >
              View Details
            </Link>
          )}

          {/* Wishlist Toggle Button (Alternative Layout) */}
          <button
            onClick={handleWishlistToggle}
            disabled={wishlistLoading}
            className={`px-3 py-2 rounded-lg border transition-colors ${
              inWishlist
                ? "border-red-300 bg-red-50 text-red-600 hover:bg-red-100"
                : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:text-red-500"
            } disabled:opacity-50`}
            title={inWishlist ? "In wishlist" : "Add to wishlist"}
          >
            {inWishlist ? (
              <Check className="w-4 h-4" />
            ) : (
              <Heart className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Additional Product Info */}
        {size === "large" && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-sm text-gray-600 line-clamp-2">
              {product.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Specialized variants
export const CompactProductCard = (props) => (
  <EnhancedProductCard {...props} size="compact" />
);

export const LargeProductCard = (props) => (
  <EnhancedProductCard {...props} size="large" />
);

export default ProductCard;
