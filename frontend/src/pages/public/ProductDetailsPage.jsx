// src/pages/public/ProductDetailsPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Heart,
  Gift,
  ChevronRight,
  ChevronLeft,
  Share2,
  Check,
  AlertCircle,
} from "lucide-react";
import { productService } from "../../services/api/product";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";
import { formatCurrency } from "../../utils/currency";
import CompactProductCard from "../../components/products/CompactProductCard";

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await productService.getProductById(id);

      if (response.success) {
        // Map sellingPrice to price if needed
        const productData = response.data;
        if (productData.sellingPrice && !productData.price) {
          productData.price = productData.sellingPrice;
        }

        // Map stock quantity if needed
        if (
          productData.quantity !== undefined &&
          productData.stock === undefined
        ) {
          productData.stock = productData.quantity;
        }

        setProduct(productData);
        setIsWishlisted(productData.inWishlist || false);

        // Fetch related products from the same category
        if (productData.category?._id) {
          fetchRelatedProducts(productData.category._id, productData._id);
        } else if (typeof productData.category === "string") {
          // If category is just a string ID or slug
          fetchRelatedProducts(productData.category, productData._id);
        }
      } else {
        throw new Error(response.message || "Failed to fetch product details");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      setError("Failed to load product details");
      toast.error("Failed to load product details");
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (categoryId, currentProductId) => {
    try {
      const response = await productService.getProductsByCategory(categoryId);

      if (response.success) {
        // Filter out the current product and limit to 6 related products
        const filtered = response.data
          .filter((item) => item._id !== currentProductId)
          .slice(0, 6);

        setRelatedProducts(filtered);
      }
    } catch (error) {
      console.error("Error fetching related products:", error);
    }
  };

  const handleAddToEvent = () => {
    if (!user) {
      toast.info("Please sign in to add products to your event");
      navigate("/auth/signin");
      return;
    }

    navigate("/events/create", {
      state: { selectedProduct: product },
    });
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      toast.info("Please sign in to save products to your wishlist");
      navigate("/auth/signin");
      return;
    }

    try {
      const response = await productService.toggleWishlist(id);

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
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } else {
        // Fallback for browsers that don't support the Web Share API
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Product link copied to clipboard!");
      }
    } catch (error) {
      console.error("Share failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 text-red-600 p-6 rounded-lg text-center max-w-2xl mx-auto">
          <AlertCircle className="mx-auto h-12 w-12 mb-4" />
          <h2 className="text-xl font-medium mb-2">Product Not Found</h2>
          <p className="mb-6">
            {error || "The requested product could not be found."}
          </p>
          <Link
            to="/products"
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumbs */}
        <div className="mb-4 flex items-center text-sm text-gray-500">
          <Link to="/" className="hover:text-indigo-600">
            Home
          </Link>
          <ChevronRight className="w-4 h-4 mx-1" />
          <Link to="/products" className="hover:text-indigo-600">
            Products
          </Link>
          {product.category && (
            <>
              <ChevronRight className="w-4 h-4 mx-1" />
              <Link
                to={`/products?category=${product.category._id}`}
                className="hover:text-indigo-600"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-4 h-4 mx-1" />
          <span className="text-gray-700 truncate">{product.name}</span>
        </div>

        {/* Product Details Section */}
        <div className="bg-white rounded-lg shadow-sm mb-8 overflow-hidden">
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 p-6">
            {/* Product Images - Simplified and Neater */}
            <div className="flex flex-col">
              <div className="mb-4 rounded-lg overflow-hidden border border-gray-100">
                <img
                  src={
                    product.images?.[selectedImage]?.url ||
                    "/api/placeholder/600/600"
                  }
                  alt={product.name}
                  className="w-full h-auto object-contain aspect-square"
                />
              </div>

              {/* Thumbnail Gallery */}
              {product.images?.length > 1 && (
                <div className="flex flex-wrap gap-2 justify-center">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-16 h-16 rounded-md overflow-hidden border-2 ${
                        selectedImage === index
                          ? "border-indigo-600"
                          : "border-transparent"
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={`${product.name} - View ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h1>

                {/* Price and Stock Status */}
                <div className="flex flex-col mb-6">
                  <div className="flex items-center">
                    <span className="text-3xl font-bold text-indigo-700">
                      {formatCurrency(product.price || product.sellingPrice)}
                    </span>

                    {product.marketPrice &&
                      product.marketPrice >
                        (product.price || product.sellingPrice) && (
                        <span className="ml-3 text-lg text-gray-500 line-through">
                          {formatCurrency(product.marketPrice)}
                        </span>
                      )}

                    {product.marketPrice &&
                      product.marketPrice >
                        (product.price || product.sellingPrice) && (
                        <span className="ml-2 text-sm text-green-600 font-medium">
                          {Math.round(
                            ((product.marketPrice -
                              (product.price || product.sellingPrice)) /
                              product.marketPrice) *
                              100
                          )}
                          % off
                        </span>
                      )}
                  </div>

                  <div className="flex items-center mt-2">
                    {/* Stock status */}
                    {product.stock > 0 || product.quantity > 0 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Check className="w-3 h-3 mr-1" />
                        In Stock ({product.stock || product.quantity} available)
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Out of Stock
                      </span>
                    )}

                    {product.brand && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {product.brand}
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="prose prose-sm max-w-none mb-6 text-gray-600">
                  <p>{product.description}</p>
                </div>

                {/* Product Details Section */}
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-2">
                    Product Details
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <ul className="space-y-2 text-sm">
                      {product.brand && (
                        <li className="flex">
                          <span className="text-gray-500 w-32 flex-shrink-0 font-medium">
                            Brand:
                          </span>
                          <span className="text-gray-900">{product.brand}</span>
                        </li>
                      )}

                      {product.category && (
                        <li className="flex">
                          <span className="text-gray-500 w-32 flex-shrink-0 font-medium">
                            Category:
                          </span>
                          <span className="text-gray-900 capitalize">
                            {typeof product.category === "object"
                              ? product.category.name
                              : product.category}
                          </span>
                        </li>
                      )}

                      {product.quantity > 0 && (
                        <li className="flex">
                          <span className="text-gray-500 w-32 flex-shrink-0 font-medium">
                            Availability:
                          </span>
                          <span className="text-gray-900">
                            {product.quantity} in stock
                          </span>
                        </li>
                      )}

                      {product.minimumPurchase && (
                        <li className="flex">
                          <span className="text-gray-500 w-32 flex-shrink-0 font-medium">
                            Min. Purchase:
                          </span>
                          <span className="text-gray-900">
                            {product.minimumPurchase} unit(s)
                          </span>
                        </li>
                      )}

                      {product.marketPrice && (
                        <li className="flex">
                          <span className="text-gray-500 w-32 flex-shrink-0 font-medium">
                            Market Price:
                          </span>
                          <span className="text-gray-900 line-through">
                            {formatCurrency(product.marketPrice)}
                          </span>
                        </li>
                      )}

                      {product.colors && product.colors.length > 0 && (
                        <li className="flex">
                          <span className="text-gray-500 w-32 flex-shrink-0 font-medium">
                            Colors:
                          </span>
                          <div className="flex gap-1">
                            {product.colors.map((color, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100"
                              >
                                {color}
                              </span>
                            ))}
                          </div>
                        </li>
                      )}

                      {product.sizes && product.sizes.length > 0 && (
                        <li className="flex">
                          <span className="text-gray-500 w-32 flex-shrink-0 font-medium">
                            Sizes:
                          </span>
                          <div className="flex gap-1">
                            {product.sizes.map((size, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100"
                              >
                                {size}
                              </span>
                            ))}
                          </div>
                        </li>
                      )}

                      {/* Display other characteristics if available */}
                      {product.characteristics &&
                        Object.entries(product.characteristics).map(
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
              </div>

              {/* Action Buttons */}
              <div className="mt-auto pt-6 border-t border-gray-100">
                <div className="flex gap-4">
                  <button
                    onClick={handleAddToEvent}
                    disabled={product.stock <= 0}
                    className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg ${
                      product.stock > 0
                        ? "bg-indigo-600 text-white hover:bg-indigo-700"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    <Gift className="w-5 h-5 mr-2" />
                    Add to Event
                  </button>

                  <button
                    onClick={handleToggleWishlist}
                    className={`px-6 py-3 rounded-lg border ${
                      isWishlisted
                        ? "bg-red-50 text-red-600 border-red-200"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        isWishlisted ? "fill-red-500" : ""
                      }`}
                    />
                  </button>

                  <button
                    onClick={handleShare}
                    className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Related Products
              </h2>
              <Link
                to={`/products?category=${product.category?._id}`}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
              >
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {relatedProducts.map((relatedProduct) => (
                <CompactProductCard
                  key={relatedProduct._id}
                  product={relatedProduct}
                  onAddToEvent={handleAddToEvent}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetailsPage;
