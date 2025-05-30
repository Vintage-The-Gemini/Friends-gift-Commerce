// frontend/src/pages/public/ProductDetailsPage.jsx - ENHANCED WITH WISHLIST
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Heart,
  ShoppingBag,
  Share2,
  Star,
  ChevronLeft,
  ChevronRight,
  Package,
  Truck,
  Shield,
  MessageCircle,
  AlertCircle,
  Check,
  Plus,
  Minus,
  Gift,
  ArrowLeft
} from "lucide-react";
import { productService } from "../../services/api/product";
import { useAuth } from "../../hooks/useAuth";
import { useWishlist } from "../../hooks/useWishlist";
import { formatCurrency } from "../../utils/currency";
import { toast } from "react-toastify";

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isInWishlist, toggleWishlist, loading: wishlistLoading } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const inWishlist = product ? isInWishlist(product._id) : false;

  // Fetch product details
  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await productService.getProductById(id);
      
      if (response.success) {
        setProduct(response.data);
        // Fetch related products
        if (response.data.category) {
          fetchRelatedProducts(response.data.category._id, response.data._id);
        }
      } else {
        setError("Product not found");
      }
    } catch (err) {
      console.error("Error fetching product:", err);
      setError("Failed to load product details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Fetch related products
  const fetchRelatedProducts = async (categoryId, currentProductId) => {
    try {
      const response = await productService.getAllProducts(
        { category: categoryId },
        { limit: 4 }
      );
      
      if (response.success) {
        // Filter out current product
        const filtered = response.data.filter(p => p._id !== currentProductId);
        setRelatedProducts(filtered.slice(0, 4));
      }
    } catch (err) {
      console.error("Error fetching related products:", err);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id, fetchProduct]);

  // Handle wishlist toggle
  const handleWishlistToggle = async () => {
    if (!user) {
      toast.info("Please sign in to add items to your wishlist");
      navigate("/auth/signin", { state: { from: window.location.pathname } });
      return;
    }

    await toggleWishlist(product._id);
  };

  // Handle add to event
  const handleAddToEvent = () => {
    if (!user) {
      toast.info("Please sign in to create events");
      navigate("/auth/signin", { state: { from: window.location.pathname } });
      return;
    }

    navigate("/events/create", {
      state: {
        selectedProducts: [{
          product: product,
          quantity: quantity
        }]
      }
    });
  };

  // Handle share
  const handleShare = async () => {
    const shareUrl = window.location.href;
    
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

  // Handle quantity change
  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  // Handle image navigation
  const nextImage = () => {
    if (product.images && selectedImage < product.images.length - 1) {
      setSelectedImage(selectedImage + 1);
    }
  };

  const prevImage = () => {
    if (selectedImage > 0) {
      setSelectedImage(selectedImage - 1);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-6">{error || "The product you're looking for doesn't exist."}</p>
          <Link
            to="/products"
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-indigo-600">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/products" className="hover:text-indigo-600">Products</Link>
          <ChevronRight className="w-4 h-4" />
          {product.category && (
            <>
              <span className="hover:text-indigo-600">{product.category.name}</span>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
          <span className="text-gray-900">{product.name}</span>
        </nav>

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-white rounded-lg overflow-hidden shadow-lg">
              <img
                src={product.images?.[selectedImage]?.url || "/api/placeholder/600/600"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              
              {/* Image Navigation */}
              {product.images && product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    disabled={selectedImage === 0}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    disabled={selectedImage === product.images.length - 1}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Stock Status */}
              {product.stock <= 0 && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold">
                    Out of Stock
                  </div>
                </div>
              )}

              {/* Low Stock Warning */}
              {product.stock > 0 && product.stock <= 5 && (
                <div className="absolute top-4 left-4">
                  <div className="bg-orange-500 text-white px-3 py-1 rounded-lg text-sm font-medium flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Only {product.stock} left
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
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

          {/* Product Info */}
          <div className="space-y-6">
            {/* Seller Info */}
            <div className="text-sm text-gray-600">
              Sold by <span className="font-medium text-gray-900">
                {product.seller?.businessName || product.seller?.name || "Unknown Seller"}
              </span>
            </div>

            {/* Product Title */}
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-600">
                  {product.rating} ({product.reviewCount || 0} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="space-y-2">
              <div className="text-4xl font-bold text-indigo-600">
                {formatCurrency(product.price)}
              </div>
              {product.originalPrice && product.originalPrice > product.price && (
                <div className="flex items-center space-x-2">
                  <span className="text-lg text-gray-500 line-through">
                    {formatCurrency(product.originalPrice)}
                  </span>
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </span>
                </div>
              )}
            </div>

            {/* Stock Info */}
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <Package className="w-4 h-4 mr-1 text-gray-400" />
                <span className="text-gray-600">
                  {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                </span>
              </div>
              {product.stock > 0 && product.stock <= 10 && (
                <span className="text-orange-600 font-medium">Limited quantity!</span>
              )}
            </div>

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Quantity
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-xl font-medium w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= product.stock}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="flex gap-4">
                <button
                  onClick={handleAddToEvent}
                  disabled={product.stock <= 0}
                  className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <Gift className="w-5 h-5 mr-2" />
                  Add to Event
                </button>

                <button
                  onClick={handleWishlistToggle}
                  disabled={wishlistLoading}
                  className={`px-6 py-3 rounded-lg border transition-colors font-semibold flex items-center justify-center ${
                    inWishlist
                      ? "border-red-300 bg-red-50 text-red-600 hover:bg-red-100"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  } disabled:opacity-50`}
                >
                  <Heart className={`w-5 h-5 mr-2 ${inWishlist ? "fill-current" : ""}`} />
                  {inWishlist ? "In Wishlist" : "Add to Wishlist"}
                </button>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleShare}
                  className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-semibold flex items-center justify-center"
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  Share
                </button>

                <Link
                  to="/wishlist"
                  className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-semibold flex items-center justify-center"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  View Wishlist
                </Link>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <Truck className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-700">Free shipping on orders over $50</span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-700">30-day return policy</span>
              </div>
              <div className="flex items-center space-x-3">
                <MessageCircle className="w-5 h-5 text-purple-600" />
                <span className="text-sm text-gray-700">24/7 customer support</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-700">Quality guaranteed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Description</h2>
          <div className="prose max-w-none">
            <p className={`text-gray-700 leading-relaxed ${!showFullDescription ? 'line-clamp-3' : ''}`}>
              {product.description}
            </p>
            {product.description && product.description.length > 200 && (
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="text-indigo-600 hover:text-indigo-800 font-medium mt-2"
              >
                {showFullDescription ? "Show less" : "Read more"}
              </button>
            )}
          </div>

          {/* Product Specifications */}
          {product.characteristics && Object.keys(product.characteristics).length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(product.characteristics).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="text-gray-600">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct._id}
                  to={`/products/${relatedProduct._id}`}
                  className="group"
                >
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={relatedProduct.images?.[0]?.url || "/api/placeholder/300/300"}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                        {relatedProduct.name}
                      </h3>
                      <p className="text-lg font-bold text-indigo-600 mt-2">
                        {formatCurrency(relatedProduct.price)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailsPage;