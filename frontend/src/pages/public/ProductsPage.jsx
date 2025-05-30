// frontend/src/pages/public/ProductsPage.jsx - OPTIMIZED WITH FAST LOADING
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  Filter,
  X,
  ChevronDown,
  ShoppingBag,
  Heart,
  Grid,
  List,
  Star,
  AlertCircle,
  Eye,
  Share2,
  Package,
  RefreshCw,
} from "lucide-react";
import { productService } from "../../services/api/product";
import { categoryService } from "../../services/api/category";
import { useAuth } from "../../hooks/useAuth";
import { useWishlist } from "../../hooks/useWishlist";
import { toast } from "react-toastify";
import { formatCurrency } from "../../utils/currency";

// Debounce utility
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Optimized Product Card with lazy loading and memoization
const OptimizedProductCard = React.memo(
  ({
    product,
    onAddToEvent,
    index,
    isInWishlist,
    onWishlistToggle,
    wishlistLoading,
  }) => {
    const navigate = useNavigate();
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const handleClick = useCallback(() => {
      navigate(`/products/${product._id}`);
    }, [navigate, product._id]);

    const handleWishlistClick = useCallback(
      (e) => {
        e.stopPropagation();
        onWishlistToggle(product._id);
      },
      [onWishlistToggle, product._id]
    );

    const handleAddToEventClick = useCallback(
      (e) => {
        e.stopPropagation();
        onAddToEvent(product);
      },
      [onAddToEvent, product]
    );

    const handleShare = useCallback(
      async (e) => {
        e.stopPropagation();
        const shareUrl = `${window.location.origin}/products/${product._id}`;

        try {
          if (navigator.share) {
            await navigator.share({
              title: product.name,
              url: shareUrl,
            });
          } else {
            await navigator.clipboard.writeText(shareUrl);
            toast.success("Product link copied!");
          }
        } catch (error) {
          console.error("Share failed:", error);
        }
      },
      [product]
    );

    // Preload image for better performance
    useEffect(() => {
      if (product.images?.[0]?.url && index < 8) {
        // Preload first 8 images
        const img = new Image();
        img.onload = () => setImageLoaded(true);
        img.onerror = () => setImageError(true);
        img.src = product.images[0].url;
      }
    }, [product.images, index]);

    return (
      <div
        className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-all duration-200 border border-gray-100 cursor-pointer group"
        onClick={handleClick}
      >
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {!imageError ? (
            <>
              {/* Skeleton loader */}
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
              )}

              <img
                src={product.images?.[0]?.url || "/api/placeholder/400/400"}
                alt={product.name}
                className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                loading={index < 6 ? "eager" : "lazy"} // Load first 6 immediately
                decoding="async"
              />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
          )}

          {/* Stock Status */}
          {product.stock <= 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-medium px-3 py-1 bg-red-500 rounded-md text-sm">
                Out of Stock
              </span>
            </div>
          )}

          {/* Low Stock Warning */}
          {product.stock > 0 && product.stock <= 5 && (
            <div className="absolute top-2 left-2">
              <span className="bg-orange-500 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {product.stock} left
              </span>
            </div>
          )}

          {/* Floating Actions */}
          <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {/* Wishlist Button */}
            <button
              onClick={handleWishlistClick}
              disabled={wishlistLoading}
              className={`p-2 rounded-full shadow-lg transition-all duration-200 ${
                isInWishlist
                  ? "bg-red-500 text-white"
                  : "bg-white/90 backdrop-blur-sm text-gray-600 hover:text-red-500"
              } disabled:opacity-50`}
              title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart
                className={`w-4 h-4 ${isInWishlist ? "fill-current" : ""}`}
              />
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-white/90 backdrop-blur-sm text-gray-600 hover:text-blue-500 shadow-lg transition-all duration-200"
              title="Share product"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Wishlist Indicator */}
          {isInWishlist && (
            <div className="absolute bottom-2 right-2">
              <div className="bg-red-500 text-white p-1 rounded-full">
                <Heart className="w-3 h-3 fill-current" />
              </div>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Seller */}
          <div className="text-xs text-gray-500 mb-1 truncate">
            {product.seller?.businessName ||
              product.seller?.name ||
              "Unknown Seller"}
          </div>

          {/* Title */}
          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 text-sm leading-tight">
            {product.name}
          </h3>

          {/* Rating */}
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
            <span className="font-bold text-indigo-600 text-lg">
              {formatCurrency(product.price)}
            </span>
            <span className="text-xs text-gray-500">
              Stock: {product.stock}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleAddToEventClick}
              disabled={product.stock <= 0}
              className="flex-1 bg-indigo-600 text-white text-xs py-2 px-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <ShoppingBag className="w-3 h-3 mr-1" />
              Add to Event
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/products/${product._id}`);
              }}
              className="px-3 py-2 border border-gray-300 text-gray-600 text-xs rounded-lg hover:bg-gray-50 transition-colors"
              title="View details"
            >
              <Eye className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if essential props changed
    return (
      prevProps.product._id === nextProps.product._id &&
      prevProps.product.stock === nextProps.product.stock &&
      prevProps.product.price === nextProps.product.price &&
      prevProps.isInWishlist === nextProps.isInWishlist &&
      prevProps.wishlistLoading === nextProps.wishlistLoading
    );
  }
);

const ProductsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    isInWishlist,
    toggleWishlist,
    loading: wishlistLoading,
  } = useWishlist();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState({
    page: parseInt(searchParams.get("page")) || 1,
    totalPages: 1,
    total: 0,
  });

  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    search: searchParams.get("search") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    inStock: searchParams.get("inStock") === "true",
  });

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sortOption, setSortOption] = useState(
    searchParams.get("sort") || "newest"
  );
  const [viewMode, setViewMode] = useState(
    localStorage.getItem("productViewMode") || "grid"
  );
  const [hasMoreProducts, setHasMoreProducts] = useState(true);

  // Memoized category fetch
  const fetchCategories = useCallback(async () => {
    try {
      const response = await categoryService.getAllCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Optimized debounced search
  const debouncedSearch = useCallback(
    debounce((value) => {
      setFilters((prev) => ({ ...prev, search: value }));
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 150), // Reduced debounce time for faster response
    []
  );

  const getSortValue = useCallback(() => {
    const sortMap = {
      newest: "-createdAt",
      oldest: "createdAt",
      price_asc: "price",
      price_desc: "-price",
      name_asc: "name",
      name_desc: "-name",
      popular: "-soldCount",
    };
    return sortMap[sortOption] || "-createdAt";
  }, [sortOption]);

  const fetchProducts = useCallback(
    async (resetPage = false, loadMore = false) => {
      try {
        if (resetPage) {
          setLoading(true);
          setProducts([]);
          setPagination((prev) => ({ ...prev, page: 1 }));
        } else if (loadMore) {
          setLoadingMore(true);
        }

        const currentPage = resetPage ? 1 : pagination.page;

        const options = {
          page: currentPage,
          limit: 24,
          sort: getSortValue(),
        };

        // Build optimized filters
        const apiFilters = { ...filters };
        if (filters.inStock) {
          apiFilters.minStock = 1;
        }

        const response = await productService.getAllProducts(
          apiFilters,
          options
        );

        if (response.success) {
          if (resetPage) {
            setProducts(response.data);
          } else if (loadMore) {
            setProducts((prev) => [...prev, ...response.data]);
          }

          setPagination({
            page: response.pagination.page,
            totalPages: response.pagination.totalPages,
            total: response.pagination.total,
          });

          setHasMoreProducts(
            response.pagination.page < response.pagination.totalPages
          );
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [filters, getSortValue, pagination.page]
  );

  // Fetch products when dependencies change
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== false) params.append(key, value.toString());
    });
    params.append("sort", sortOption);
    setSearchParams(params);

    fetchProducts(true);
  }, [filters, sortOption]);

  // Optimized wishlist toggle
  const handleWishlistToggle = useCallback(
    async (productId) => {
      if (!user) {
        toast.info("Please sign in to add items to your wishlist");
        navigate("/auth/signin", { state: { from: window.location.pathname } });
        return;
      }

      await toggleWishlist(productId);
    },
    [user, navigate, toggleWishlist]
  );

  // Handle add to event
  const handleAddToEvent = useCallback(
    (product) => {
      if (!user) {
        toast.info("Please sign in to add products to your event");
        navigate("/auth/signin", { state: { from: window.location.pathname } });
        return;
      }

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
    },
    [user, navigate]
  );

  const handleClearFilters = useCallback(() => {
    setFilters({
      category: "",
      search: "",
      minPrice: "",
      maxPrice: "",
      inStock: false,
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMoreProducts) {
      setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
      fetchProducts(false, true);
    }
  }, [loadingMore, hasMoreProducts, fetchProducts]);

  const handleSearchChange = useCallback(
    (e) => {
      debouncedSearch(e.target.value);
    },
    [debouncedSearch]
  );

  // Save view mode preference
  useEffect(() => {
    localStorage.setItem("productViewMode", viewMode);
  }, [viewMode]);

  // Intersection Observer for infinite scroll
  const loadMoreRef = useCallback(
    (node) => {
      if (loadingMore || !hasMoreProducts) return;

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            handleLoadMore();
          }
        },
        { threshold: 0.1 }
      );

      if (node) observer.observe(node);

      return () => {
        if (node) observer.unobserve(node);
      };
    },
    [loadingMore, hasMoreProducts, handleLoadMore]
  );

  const hasActiveFilters = useMemo(
    () => Object.values(filters).some((v) => v),
    [filters]
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Discover Perfect Gifts
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Browse our curated collection to find the ideal gift for any
            occasion
          </p>
        </div>

        {/* Search and Controls */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search products..."
                defaultValue={filters.search}
                onChange={handleSearchChange}
                className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-48">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="block appearance-none w-full pl-3 pr-8 py-2.5 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="name_asc">Name: A to Z</option>
                  <option value="name_desc">Name: Z to A</option>
                  <option value="popular">Most Popular</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <ChevronDown className="h-5 w-5" />
                </div>
              </div>

              <button
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden px-4 py-2.5 border rounded-xl flex items-center text-base font-medium text-gray-700 hover:bg-gray-50"
              >
                <Filter className="w-5 h-5 mr-2" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">
                    {Object.values(filters).filter((v) => v).length}
                  </span>
                )}
              </button>

              <div className="flex rounded-xl overflow-hidden border">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2.5 transition ${
                    viewMode === "grid"
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                  title="Grid view"
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2.5 transition ${
                    viewMode === "list"
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                  title="List view"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Active filters display */}
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap gap-2">
              {filters.category && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800">
                  Category:{" "}
                  {categories.find((c) => c._id === filters.category)?.name ||
                    "Selected"}
                  <button
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, category: "" }))
                    }
                    className="ml-2 text-indigo-600 hover:text-indigo-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </span>
              )}
              {filters.minPrice && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                  Min: {formatCurrency(filters.minPrice)}
                  <button
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, minPrice: "" }))
                    }
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </span>
              )}
              {filters.maxPrice && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                  Max: {formatCurrency(filters.maxPrice)}
                  <button
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, maxPrice: "" }))
                    }
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </span>
              )}
              {filters.inStock && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                  In Stock Only
                  <button
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, inStock: false }))
                    }
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </span>
              )}
              <button
                onClick={handleClearFilters}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Desktop Filters Sidebar */}
        <div className="flex gap-8">
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-gray-900">Filters</h3>
                {hasActiveFilters && (
                  <button
                    onClick={handleClearFilters}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Categories */}
              <div className="mb-8">
                <h4 className="text-base font-semibold text-gray-900 mb-4">
                  Categories
                </h4>
                <div className="space-y-3 max-h-72 overflow-y-auto">
                  <label className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <input
                      type="radio"
                      checked={filters.category === ""}
                      onChange={() =>
                        setFilters((prev) => ({ ...prev, category: "" }))
                      }
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <span className="ml-3 text-sm text-gray-700">
                      All Categories
                    </span>
                  </label>

                  {categories.map((category) => (
                    <label
                      key={category._id}
                      className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded"
                    >
                      <input
                        type="radio"
                        checked={filters.category === category._id}
                        onChange={() =>
                          setFilters((prev) => ({
                            ...prev,
                            category: category._id,
                          }))
                        }
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <span className="ml-3 text-sm text-gray-700">
                        {category.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-8">
                <h4 className="text-base font-semibold text-gray-900 mb-4">
                  Price Range
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Min Price
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={filters.minPrice}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          minPrice: e.target.value,
                        }))
                      }
                      className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Max Price
                    </label>
                    <input
                      type="number"
                      placeholder="Any"
                      value={filters.maxPrice}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          maxPrice: e.target.value,
                        }))
                      }
                      className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Filters */}
              <div>
                <h4 className="text-base font-semibold text-gray-900 mb-4">
                  Availability
                </h4>
                <label className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        inStock: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    In Stock Only
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Products Display */}
          <div className="flex-1">
            {/* Loading State */}
            {loading && products.length === 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(12)].map((_, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse"
                  >
                    <div className="aspect-square bg-gray-200"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3 mb-3"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                <div className="inline-flex justify-center items-center w-20 h-20 rounded-full bg-gray-100 mb-6">
                  <ShoppingBag className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  No products found
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Try adjusting your search or filter criteria
                </p>
                <button
                  onClick={handleClearFilters}
                  className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                {/* Results Count */}
                <div className="flex justify-between items-center mb-6">
                  <p className="text-base text-gray-600">
                    Showing{" "}
                    <span className="font-semibold">{products.length}</span> of{" "}
                    <span className="font-semibold">{pagination.total}</span>{" "}
                    products
                  </p>

                  {loading && (
                    <div className="flex items-center text-sm text-gray-500">
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </div>
                  )}
                </div>

                {/* Products Grid/List */}
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
                    {products.map((product, index) => (
                      <OptimizedProductCard
                        key={product._id}
                        product={product}
                        index={index}
                        onAddToEvent={handleAddToEvent}
                        isInWishlist={isInWishlist(product._id)}
                        onWishlistToggle={handleWishlistToggle}
                        wishlistLoading={wishlistLoading}
                      />
                    ))}
                  </div>
                ) : (
                  /* List View */
                  <div className="space-y-4">
                    {products.map((product, index) => (
                      <div
                        key={product._id}
                        className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 border border-gray-100"
                      >
                        <div className="flex flex-col sm:flex-row">
                          {/* Product Image */}
                          <div className="relative w-full sm:w-48 h-48 sm:h-36 overflow-hidden bg-gray-100">
                            <img
                              src={
                                product.images?.[0]?.url ||
                                "/api/placeholder/400/400"
                              }
                              alt={product.name}
                              className="w-full h-full object-cover"
                              loading={index < 6 ? "eager" : "lazy"}
                            />

                            {/* Stock Status Overlay */}
                            {product.stock <= 0 && (
                              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                <span className="text-white font-medium px-3 py-1 bg-red-500 rounded-md text-sm">
                                  Out of Stock
                                </span>
                              </div>
                            )}

                            {/* Wishlist Status */}
                            {isInWishlist(product._id) && (
                              <div className="absolute top-2 right-2">
                                <div className="bg-red-500 text-white p-1.5 rounded-full">
                                  <Heart className="w-3 h-3 fill-current" />
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 p-4 sm:p-6">
                            <div className="flex justify-between items-start">
                              <div className="flex-1 min-w-0">
                                {/* Seller */}
                                <div className="text-xs text-gray-500 mb-1">
                                  {product.seller?.businessName ||
                                    product.seller?.name ||
                                    "Unknown Seller"}
                                </div>

                                {/* Title */}
                                <h3 className="font-semibold text-gray-900 mb-2 text-lg leading-tight">
                                  {product.name}
                                </h3>

                                {/* Description */}
                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                  {product.description}
                                </p>

                                {/* Rating */}
                                {product.rating && (
                                  <div className="flex items-center mb-3">
                                    <div className="flex items-center">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`w-4 h-4 ${
                                            i < Math.floor(product.rating)
                                              ? "text-yellow-400 fill-current"
                                              : "text-gray-300"
                                          }`}
                                        />
                                      ))}
                                    </div>
                                    <span className="text-sm text-gray-500 ml-2">
                                      ({product.reviewCount || 0} reviews)
                                    </span>
                                  </div>
                                )}

                                {/* Price and Stock */}
                                <div className="flex items-center justify-between mb-4">
                                  <span className="font-bold text-indigo-600 text-xl">
                                    {formatCurrency(product.price)}
                                  </span>
                                  <div className="text-sm text-gray-500">
                                    <span
                                      className={
                                        product.stock <= 5
                                          ? "text-orange-600 font-medium"
                                          : ""
                                      }
                                    >
                                      {product.stock > 0
                                        ? `${product.stock} in stock`
                                        : "Out of stock"}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex flex-col gap-2 ml-4">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleWishlistToggle(product._id);
                                  }}
                                  disabled={wishlistLoading || !user}
                                  className={`p-2.5 rounded-lg transition-all duration-200 ${
                                    isInWishlist(product._id)
                                      ? "bg-red-500 text-white"
                                      : "bg-gray-100 text-gray-600 hover:text-red-500"
                                  } disabled:opacity-50`}
                                  title={
                                    isInWishlist(product._id)
                                      ? "Remove from wishlist"
                                      : "Add to wishlist"
                                  }
                                >
                                  <Heart
                                    className={`w-4 h-4 ${isInWishlist(product._id) ? "fill-current" : ""}`}
                                  />
                                </button>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/products/${product._id}`);
                                  }}
                                  className="p-2.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                                  title="View details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    const shareUrl = `${window.location.origin}/products/${product._id}`;
                                    try {
                                      if (navigator.share) {
                                        await navigator.share({
                                          title: product.name,
                                          url: shareUrl,
                                        });
                                      } else {
                                        await navigator.clipboard.writeText(
                                          shareUrl
                                        );
                                        toast.success("Product link copied!");
                                      }
                                    } catch (error) {
                                      console.error("Share failed:", error);
                                    }
                                  }}
                                  className="p-2.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                                  title="Share product"
                                >
                                  <Share2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Bottom Action Button */}
                            <div className="flex gap-3 mt-4">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddToEvent(product);
                                }}
                                disabled={product.stock <= 0}
                                className="flex-1 bg-indigo-600 text-white py-2.5 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
                              >
                                <ShoppingBag className="w-4 h-4 mr-2" />
                                Add to Event
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/products/${product._id}`);
                                }}
                                className="px-6 py-2.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Load More / Infinite Scroll */}
                {hasMoreProducts && (
                  <div
                    ref={loadMoreRef}
                    className="flex justify-center mt-8 py-8"
                  >
                    {loadingMore && (
                      <div className="flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                        <span className="text-gray-600">
                          Loading more products...
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* End of results message */}
                {!hasMoreProducts && products.length > 12 && (
                  <div className="text-center mt-8 py-6 border-t border-gray-200">
                    <p className="text-gray-500">
                      You've reached the end of the product list
                    </p>
                    <button
                      onClick={() =>
                        window.scrollTo({ top: 0, behavior: "smooth" })
                      }
                      className="mt-2 text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Back to top
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Mobile Filters Modal */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setShowMobileFilters(false)}
            />

            <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-xl overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg text-gray-900">Filters</h3>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="p-2 -m-2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile Categories */}
                <div className="mb-8">
                  <h4 className="text-base font-semibold text-gray-900 mb-4">
                    Categories
                  </h4>
                  <div className="space-y-3">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        checked={filters.category === ""}
                        onChange={() =>
                          setFilters((prev) => ({ ...prev, category: "" }))
                        }
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <span className="ml-3 text-sm text-gray-700">
                        All Categories
                      </span>
                    </label>

                    {categories.map((category) => (
                      <label
                        key={category._id}
                        className="flex items-center cursor-pointer"
                      >
                        <input
                          type="radio"
                          checked={filters.category === category._id}
                          onChange={() =>
                            setFilters((prev) => ({
                              ...prev,
                              category: category._id,
                            }))
                          }
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <span className="ml-3 text-sm text-gray-700">
                          {category.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Mobile Price Range */}
                <div className="mb-8">
                  <h4 className="text-base font-semibold text-gray-900 mb-4">
                    Price Range
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Min Price
                      </label>
                      <input
                        type="number"
                        placeholder="0"
                        value={filters.minPrice}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            minPrice: e.target.value,
                          }))
                        }
                        className="w-full p-3 text-base border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Max Price
                      </label>
                      <input
                        type="number"
                        placeholder="Any"
                        value={filters.maxPrice}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            maxPrice: e.target.value,
                          }))
                        }
                        className="w-full p-3 text-base border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Mobile Additional Filters */}
                <div className="mb-8">
                  <h4 className="text-base font-semibold text-gray-900 mb-4">
                    Availability
                  </h4>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.inStock}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          inStock: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700">
                      In Stock Only
                    </span>
                  </label>
                </div>

                {/* Mobile Filter Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={handleClearFilters}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
