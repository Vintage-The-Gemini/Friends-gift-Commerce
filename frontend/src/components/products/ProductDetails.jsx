// frontend/src/pages/public/ProductDetailsPage.jsx - FIXED MOBILE WISHLIST
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Heart,
  Share2,
  ShoppingBag,
  ChevronLeft,
  Package,
  ArrowLeft,
  ArrowRight,
  Gift,
  Plus,
  Minus,
  Check,
} from "lucide-react";
import { productService } from "../../services/api/product";
import { useAuth } from "../../hooks/useAuth";
import { useWishlist } from "../../hooks/useWishlist";
import { toast } from "react-toastify";
import { formatCurrency } from "../../utils/currency";

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isInWishlist, toggleWishlist, loading: wishlistLoading } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productService.getProductById(id);
      
      if (response.success) {
        setProduct(response.data);
        // Fetch related products if category exists
        if (response.data.category?._id) {
          fetchRelatedProducts(response.data.category._id);
        }
      } else {
        setError("Product not found");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      setError("Failed to load product details");
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (categoryId) => {
    try {
      const response = await productService.getProductsByCategory(categoryId);
      if (response.success) {
        // Filter out current product and limit to 4 related products
        const filtered = response.data
          .filter((item) => item._id !== id)
          .slice(0, 4);
        setRelatedProducts(filtered);
      }
    } catch (error) {
      console.error("Error fetching related products:", error);
    }
  };

  // FIXED: Wishlist toggle with proper error handling
  const handleWishlistToggle = useCallback(async () => {
    if (!user) {
      toast.info("Please sign in to add items to your wishlist");
      navigate("/auth/signin", { state: { from: window.location.pathname } });
      return;
    }

    if (!product) return;

    try {
      const success = await toggleWishlist(product._id);
      if (success) {
        // Success toast is handled by the useWishlist hook
      }
    } catch (error) {
      console.error("Wishlist toggle error:", error);
      toast.error("Failed to update wishlist. Please try again.");
    }
  }, [user, product, navigate, toggleWishlist]);

  const handleAddToEvent = useCallback(() => {
    if (!user) {
      toast.info("Please sign in to add products to your event");
      navigate("/auth/signin", { state: { from: window.location.pathname } });
      return;
    }

    if (!product) return;

    navigate("/events/create", {
      state: {
        selectedProducts: [
          {
            product: product,
            quantity: quantity,
          },
        ],
      },
    });
  }, [user, product, quantity, navigate]);

  const handleShare = async () => {
    if (!product) return;
    
    const shareUrl = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: product.description,
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

  const nextImage = () => {
    if (product?.images && product.images.length > 1) {
      setSelectedImageIndex((prev) => 
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (product?.images && product.images.length > 1) {
      setSelectedImageIndex((prev) => 
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  };

  const increaseQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(prev => prev + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  // Check if product is in wishlist
  const inWishlist = product ? isInWishlist(product._id) : false;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="aspect-square bg-gray-200 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Product Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "The product you're looking for doesn't exist."}
          </p>
          <Link
            to="/products"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center mb-4 md:mb-6">
          <Link
            to="/products"
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Products
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 p-4 md:p-6 lg:p-8">
            {/* Product Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
                {product.images && product.images.length > 0 ? (
                  <>
                    <img
                      src={product.images[selectedImageIndex]?.url || "/api/placeholder/600/600"}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Image Navigation */}
                    {product.images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors touch-manipulation"
                        >
                          <ArrowLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors touch-manipulation"
                        >
                          <ArrowRight className="w-5 h-5" />
                        </button>

                        {/* Image Indicators */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                          {product.images.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setSelectedImageIndex(index)}
                              className={`w-2 h-2 rounded-full transition-colors touch-manipulation ${
                                index === selectedImageIndex
                                  ? "bg-white"
                                  : "bg-white/50"
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-24 h-24 text-gray-400" />
                  </div>
                )}

                {/* Out of Stock Overlay */}
                {product.stock <= 0 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white font-bold text-xl px-6 py-3 bg-red-500 rounded-lg">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
              {product.images && product.images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-colors touch-manipulation ${
                        index === selectedImageIndex
                          ? "border-indigo-500"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Information */}
            <div className="flex flex-col">
              <div className="flex-1">
                {/* Product Title */}
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  {product.name}
                </h1>

                {/* Price and Stock */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                  <span className="text-3xl md:text-4xl font-bold text-indigo-600">
                    {formatCurrency(product.price)}
                  </span>
                  
                  {/* Stock Status */}
                  <div className="mt-2 sm:mt-0">
                    {product.stock > 0 ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <Check className="w-4 h-4 mr-1" />
                        {product.stock} in stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                        Out of Stock
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6 md:mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Description
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Quantity Selector */}
                {product.stock > 0 && (
                  <div className="mb-6 md:mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={decreaseQuantity}
                        disabled={quantity <= 1}
                        className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-16 text-center font-medium text-lg">
                        {quantity}
                      </span>
                      <button
                        onClick={increaseQuantity}
                        disabled={quantity >= product.stock}
                        className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Maximum available: {product.stock}
                    </p>
                  </div>
                )}

                {/* Product Details */}
                {product.characteristics && Object.keys(product.characteristics).length > 0 && (
                  <div className="mb-6 md:mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Product Details
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <ul className="space-y-2 text-sm">
                        {Object.entries(product.characteristics).map(
                          ([key, value]) => (
                            <li key={key} className="flex">
                              <span className="text-gray-500 w-32 flex-shrink-0 font-medium">
                                {key}:
                              </span>
                              <span className="text-gray-900">{value}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* FIXED: Action Buttons - Mobile Optimized */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                {/* Primary Action - Add to Event */}
                <button
                  onClick={handleAddToEvent}
                  disabled={product.stock <= 0}
                  className="w-full bg-indigo-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center touch-manipulation"
                >
                  <Gift className="w-6 h-6 mr-3" />
                  Add to Event
                </button>

                {/* Secondary Actions */}
                <div className="grid grid-cols-2 gap-3">
                  {/* FIXED: Wishlist Button - Mobile Friendly */}
                  <button
                    onClick={handleWishlistToggle}
                    disabled={wishlistLoading || !user}
                    className={`py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center touch-manipulation ${
                      inWishlist
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <Heart
                      className={`w-5 h-5 mr-2 ${
                        inWishlist ? "fill-current" : ""
                      }`}
                    />
                    {wishlistLoading ? (
                      "Loading..."
                    ) : inWishlist ? (
                      "In Wishlist"
                    ) : (
                      "Add to Wishlist"
                    )}
                  </button>

                  {/* Share Button */}
                  <button
                    onClick={handleShare}
                    className="bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center touch-manipulation"
                  >
                    <Share2 className="w-5 h-5 mr-2" />
                    Share
                  </button>
                </div>

                {/* User Authentication Prompt */}
                {!user && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <p className="text-blue-800 text-sm">
                      <Link 
                        to="/auth/signin" 
                        className="font-medium underline hover:no-underline"
                      >
                        Sign in
                      </Link>
                      {" "}to add items to your wishlist and create events
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-8 md:mt-12">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                  Related Products
                </h2>
                <Link
                  to={`/products?category=${product.category?._id}`}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
                >
                  View All
                  <ChevronLeft className="w-4 h-4 ml-1 rotate-180" />
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <div
                    key={relatedProduct._id}
                    className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <Link to={`/products/${relatedProduct._id}`}>
                      <div className="aspect-square bg-gray-100 overflow-hidden">
                        <img
                          src={relatedProduct.images?.[0]?.url || "/api/placeholder/300/300"}
                          alt={relatedProduct.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-2">
                          {relatedProduct.name}
                        </h3>
                        <p className="font-bold text-indigo-600">
                          {formatCurrency(relatedProduct.price)}
                        </p>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Product Information Tabs - Mobile Friendly */}
        <div className="mt-8 md:mt-12">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="border-b border-gray-200">
              <div className="p-6 md:p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Additional Information
                </h3>
                
                {/* Product Specifications */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Product Details</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between">
                        <span className="text-gray-500">SKU:</span>
                        <span className="text-gray-900">{product._id.slice(-8).toUpperCase()}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-500">Category:</span>
                        <span className="text-gray-900">{product.category?.name || "Uncategorized"}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-500">Stock:</span>
                        <span className="text-gray-900">{product.stock} units</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-500">Seller:</span>
                        <span className="text-gray-900">
                          {product.seller?.businessName || product.seller?.name || "Friends Gift"}
                        </span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Shipping & Returns</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Free shipping on orders over KES 5,000</li>
                      <li>• Standard delivery: 2-5 business days</li>
                      <li>• Express delivery available</li>
                      <li>• 30-day return policy</li>
                      <li>• Quality guarantee</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;