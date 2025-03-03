// src/components/products/CompactProductCard.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Gift, Eye } from "lucide-react";
import { formatCurrency } from "../../utils/currency";
import { productService } from "../../services/api/product";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";

const CompactProductCard = ({ product, onAddToEvent }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(
    product?.inWishlist || false
  );
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  if (!product) return null;

  const { _id, name, price, images, stock } = product;
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

  return (
    <div className="group bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-300">
      <Link to={`/products/${_id}`} className="block relative">
        <div className="aspect-square overflow-hidden">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Wishlist Action */}
        <button
          onClick={handleToggleWishlist}
          disabled={isWishlistLoading}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-colors"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`w-3 h-3 ${
              isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
            } transition-colors`}
          />
        </button>
      </Link>

      <div className="p-3">
        <Link to={`/products/${_id}`}>
          <h3 className="font-medium text-sm text-gray-900 group-hover:text-indigo-700 transition-colors mb-1 truncate">
            {name}
          </h3>
        </Link>

        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-indigo-700">
            {formatCurrency(price)}
          </span>

          <div className="flex gap-1">
            <Link
              to={`/products/${_id}`}
              className="p-1.5 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
              aria-label="View details"
            >
              <Eye className="w-3 h-3" />
            </Link>

            <button
              onClick={handleAddToEvent}
              disabled={!isInStock}
              className={`p-1.5 rounded-full flex items-center ${
                isInStock
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              } transition-colors`}
              aria-label={isInStock ? "Add to event" : "Out of stock"}
            >
              <Gift className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompactProductCard;
