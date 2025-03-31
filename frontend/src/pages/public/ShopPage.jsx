// src/pages/public/ShopPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  Search,
  Filter,
  Grid,
  List,
  Trash2,
  X,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ShoppingBag,
  Gift,
  Star,
  Heart,
  Clock,
  AlertCircle,
} from "lucide-react";
import { productService } from "../../services/api/product";
import { categoryService } from "../../services/api/category";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";
import CompactProductCard from "../../components/products/CompactProductCard";
import { debounce } from "lodash";
import { formatCurrency } from "../../utils/currency";

const ShopPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
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
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sortOption, setSortOption] = useState(
    searchParams.get("sort") || "newest"
  );

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
    fetchFeaturedProducts();
  }, []);

  // Fetch products when filters or sort option changes
  useEffect(() => {
    fetchProducts(true);
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    params.append("page", pagination.page.toString());
    params.append("sort", sortOption);
    setSearchParams(params);
  }, [filters, sortOption]);

  // Fetch products when page changes
  useEffect(() => {
    fetchProducts(false);
  }, [pagination.page]);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAllCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchFeaturedProducts = async () => {
    try {
      const response = await productService.getFeaturedProducts();
      if (response.success) {
        setFeaturedProducts(response.data.slice(0, 4)); // Limit to 4 featured products
      }
    } catch (error) {
      console.error("Error fetching featured products:", error);
    }
  };

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((value) => {
      setFilters((prev) => ({ ...prev, search: value }));
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 500),
    []
  );

  const fetchProducts = async (resetPage = false) => {
    try {
      setLoading(true);

      const options = {
        page: resetPage ? 1 : pagination.page,
        limit: 24, // Show more products per page with the compact cards
        sort: getSortValue(),
      };

      const response = await productService.getAllProducts(filters, options);

      if (response.success) {
        if (resetPage) {
          setProducts(response.data);
          setPagination((prev) => ({
            ...prev,
            page: 1,
            totalPages: response.pagination.totalPages,
            total: response.pagination.total,
          }));
        } else {
          setProducts(response.data);
          setPagination((prev) => ({
            ...prev,
            totalPages: response.pagination.totalPages,
            total: response.pagination.total,
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const getSortValue = () => {
    switch (sortOption) {
      case "newest":
        return "-createdAt";
      case "oldest":
        return "createdAt";
      case "price_asc":
        return "price";
      case "price_desc":
        return "-price";
      case "name_asc":
        return "name";
      case "name_desc":
        return "-name";
      default:
        return "-createdAt";
    }
  };

  const handleAddToEvent = (product) => {
    if (!user) {
      toast.info("Please sign in to add products to your event");
      navigate("/auth/signin");
      return;
    }

    navigate("/events/create", {
      state: { selectedProduct: product },
    });
  };

  const handleClearFilters = () => {
    setFilters({
      category: "",
      search: "",
      minPrice: "",
      maxPrice: "",
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePrevPage = () => {
    if (pagination.page > 1) {
      setPagination((prev) => ({
        ...prev,
        page: prev.page - 1,
      }));
    }
  };

  const handleNextPage = () => {
    if (pagination.page < pagination.totalPages) {
      setPagination((prev) => ({
        ...prev,
        page: prev.page + 1,
      }));
    }
  };

  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };

  const handleToggleWishlist = (productId) => {
    if (!user) {
      toast.info("Please sign in to save products to your wishlist");
      navigate("/auth/signin");
      return;
    }

    // Implement wishlist toggle functionality here
    toast.success("Wishlist updated");
  };

  return (
    <div className="bg-gray-50 min-h-screen py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Shop for Gifts
          </h1>
          <p className="text-gray-600">
            Find and purchase perfect gifts for your special occasions
          </p>
        </div>

        {/* Featured Products Section */}
        {featuredProducts.length > 0 && (
          <div className="mb-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Featured Gifts
              </h2>
              <Link
                to="/products?featured=true"
                className="text-indigo-600 hover:text-indigo-800 flex items-center text-sm font-medium"
              >
                View all featured
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredProducts.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative">
                    <Link to={`/products/${product._id}`}>
                      <img
                        src={
                          product.images?.[0]?.url || "/api/placeholder/300/300"
                        }
                        alt={product.name}
                        className="h-48 w-full object-cover"
                      />
                    </Link>
                    <button
                      onClick={() => handleToggleWishlist(product._id)}
                      className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm hover:bg-gray-100"
                    >
                      <Heart className="w-4 h-4 text-gray-500 hover:text-red-500" />
                    </button>
                    {product.discount > 0 && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        {product.discount}% OFF
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <Link to={`/products/${product._id}`}>
                      <h3 className="text-gray-900 font-medium mb-1 truncate">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-center mb-2">
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < (product.rating || 0)
                                ? "fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500 ml-1">
                        ({product.reviews?.length || 0})
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-indigo-700 font-bold">
                        {formatCurrency(product.price || product.sellingPrice)}
                      </div>
                      <button
                        onClick={() => handleAddToEvent(product)}
                        className="text-xs bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700 flex items-center"
                      >
                        <Gift className="w-3 h-3 mr-1" />
                        Add to Event
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Desktop */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-5 sticky top-20">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-gray-900">Filters</h3>
                {Object.values(filters).some((v) => v) && (
                  <button
                    onClick={handleClearFilters}
                    className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Clear all
                  </button>
                )}
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Categories
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  <div className="flex items-center">
                    <input
                      id="category-all"
                      type="radio"
                      checked={filters.category === ""}
                      onChange={() =>
                        setFilters((prev) => ({ ...prev, category: "" }))
                      }
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label
                      htmlFor="category-all"
                      className="ml-2 text-sm text-gray-700"
                    >
                      All Categories
                    </label>
                  </div>

                  {categories.map((category) => (
                    <div key={category._id} className="flex items-center">
                      <input
                        id={`category-${category._id}`}
                        type="radio"
                        checked={filters.category === category._id}
                        onChange={() =>
                          setFilters((prev) => ({
                            ...prev,
                            category: category._id,
                          }))
                        }
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label
                        htmlFor={`category-${category._id}`}
                        className="ml-2 text-sm text-gray-700"
                      >
                        {category.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Price Range
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="min-price" className="sr-only">
                      Minimum Price
                    </label>
                    <input
                      type="number"
                      id="min-price"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          minPrice: e.target.value,
                        }))
                      }
                      className="w-full p-2 text-sm border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="max-price" className="sr-only">
                      Maximum Price
                    </label>
                    <input
                      type="number"
                      id="max-price"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          maxPrice: e.target.value,
                        }))
                      }
                      className="w-full p-2 text-sm border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Special offers */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Special Offers
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      id="on-sale"
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label
                      htmlFor="on-sale"
                      className="ml-2 text-sm text-gray-700"
                    >
                      On Sale
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="free-shipping"
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label
                      htmlFor="free-shipping"
                      className="ml-2 text-sm text-gray-700"
                    >
                      Free Shipping
                    </label>
                  </div>
                </div>
              </div>

              {/* Trending Tags */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Popular Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Birthday",
                    "Wedding",
                    "Anniversary",
                    "Graduation",
                    "Baby Shower",
                  ].map((tag) => (
                    <button
                      key={tag}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search and Controls */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search for gifts..."
                    defaultValue={filters.search}
                    onChange={handleSearchChange}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <select
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value)}
                      className="appearance-none pl-3 pr-8 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="newest">Newest First</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="name_asc">Name: A to Z</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>

                  <button
                    onClick={() => setShowMobileFilters(true)}
                    className="lg:hidden px-3 py-2 border rounded-lg flex items-center"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Filters Modal */}
            {showMobileFilters && (
              <div className="fixed inset-0 z-50 bg-black bg-opacity-50 lg:hidden">
                <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl overflow-y-auto">
                  <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-semibold">Filters</h2>
                    <button onClick={() => setShowMobileFilters(false)}>
                      <X className="w-6 h-6 text-gray-500" />
                    </button>
                  </div>

                  <div className="p-4">
                    {/* Categories */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        Categories
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input
                            id="mobile-category-all"
                            type="radio"
                            checked={filters.category === ""}
                            onChange={() => {
                              setFilters((prev) => ({ ...prev, category: "" }));
                              setShowMobileFilters(false);
                            }}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                          />
                          <label
                            htmlFor="mobile-category-all"
                            className="ml-2 text-sm text-gray-700"
                          >
                            All Categories
                          </label>
                        </div>

                        {categories.map((category) => (
                          <div
                            key={`mobile-${category._id}`}
                            className="flex items-center"
                          >
                            <input
                              id={`mobile-category-${category._id}`}
                              type="radio"
                              checked={filters.category === category._id}
                              onChange={() => {
                                setFilters((prev) => ({
                                  ...prev,
                                  category: category._id,
                                }));
                                setShowMobileFilters(false);
                              }}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                            />
                            <label
                              htmlFor={`mobile-category-${category._id}`}
                              className="ml-2 text-sm text-gray-700"
                            >
                              {category.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Price Range */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        Price Range
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <input
                            type="number"
                            placeholder="Min"
                            value={filters.minPrice}
                            onChange={(e) =>
                              setFilters((prev) => ({
                                ...prev,
                                minPrice: e.target.value,
                              }))
                            }
                            className="w-full p-2 text-sm border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            placeholder="Max"
                            value={filters.maxPrice}
                            onChange={(e) =>
                              setFilters((prev) => ({
                                ...prev,
                                maxPrice: e.target.value,
                              }))
                            }
                            className="w-full p-2 text-sm border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Special Offers - Mobile */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        Special Offers
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input
                            id="mobile-on-sale"
                            type="checkbox"
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                          />
                          <label
                            htmlFor="mobile-on-sale"
                            className="ml-2 text-sm text-gray-700"
                          >
                            On Sale
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="mobile-free-shipping"
                            type="checkbox"
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                          />
                          <label
                            htmlFor="mobile-free-shipping"
                            className="ml-2 text-sm text-gray-700"
                          >
                            Free Shipping
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleClearFilters}
                        className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                      >
                        Clear All
                      </button>
                      <button
                        onClick={() => setShowMobileFilters(false)}
                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Products Display */}
            {loading && products.length === 0 ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-500 mb-6">
                  Try adjusting your search or filters to find what you're
                  looking for.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                {/* Product Results Count */}
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm text-gray-500">
                    Showing {products.length} of {pagination.total} products
                  </p>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {products.map((product) => (
                    <div
                      key={product._id}
                      className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow relative"
                    >
                      <Link to={`/products/${product._id}`}>
                        <div className="h-40 bg-gray-100 relative overflow-hidden">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0].url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <ShoppingBag className="h-10 w-10 text-gray-300" />
                            </div>
                          )}
                          {product.stock <= 5 && product.stock > 0 && (
                            <div className="absolute bottom-0 left-0 right-0 bg-amber-500 text-white text-xs text-center py-1">
                              Only {product.stock} left in stock
                            </div>
                          )}
                          {product.stock === 0 && (
                            <div className="absolute bottom-0 left-0 right-0 bg-red-500 text-white text-xs text-center py-1">
                              Out of stock
                            </div>
                          )}
                        </div>
                      </Link>

                      <button
                        onClick={() => handleToggleWishlist(product._id)}
                        className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm hover:bg-gray-100"
                        aria-label="Add to wishlist"
                      >
                        <Heart className="w-4 h-4 text-gray-500 hover:text-red-500" />
                      </button>

                      <div className="p-3">
                        <Link to={`/products/${product._id}`}>
                          <h3 className="text-sm font-medium text-gray-900 mb-1 truncate">
                            {product.name}
                          </h3>
                        </Link>

                        <div className="flex justify-between items-center mb-2">
                          <div className="text-indigo-700 font-semibold">
                            {formatCurrency(product.price)}
                          </div>
                          {product.marketPrice &&
                            product.marketPrice > product.price && (
                              <div className="text-xs text-gray-500 line-through">
                                {formatCurrency(product.marketPrice)}
                              </div>
                            )}
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex items-center text-amber-400 text-xs">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < (product.rating || 4)
                                    ? "fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                            <span className="text-xs text-gray-500 ml-1">
                              ({product.reviews?.length || 0})
                            </span>
                          </div>

                          <button
                            onClick={() => handleAddToEvent(product)}
                            disabled={product.stock === 0}
                            className={`text-xs px-2 py-1 rounded flex items-center ${
                              product.stock === 0
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                : "bg-indigo-600 text-white hover:bg-indigo-700"
                            }`}
                          >
                            <Gift className="w-3 h-3 mr-1" />
                            {product.stock === 0 ? "Sold Out" : "Add to Event"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="mt-8 flex justify-center">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={pagination.page === 1}
                      className="p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    {/* Display page numbers */}
                    <div className="flex space-x-1">
                      {[...Array(Math.min(5, pagination.totalPages))].map(
                        (_, index) => {
                          // Calculate page number with logic for showing pages around current page
                          let pageNumber;
                          if (pagination.totalPages <= 5) {
                            pageNumber = index + 1;
                          } else if (pagination.page <= 3) {
                            pageNumber = index + 1;
                          } else if (
                            pagination.page >=
                            pagination.totalPages - 2
                          ) {
                            pageNumber = pagination.totalPages - 4 + index;
                          } else {
                            pageNumber = pagination.page - 2 + index;
                          }

                          // Only display the page button if it's valid
                          if (
                            pageNumber > 0 &&
                            pageNumber <= pagination.totalPages
                          ) {
                            return (
                              <button
                                key={pageNumber}
                                onClick={() =>
                                  setPagination((prev) => ({
                                    ...prev,
                                    page: pageNumber,
                                  }))
                                }
                                className={`px-3 py-1 border rounded-lg ${
                                  pagination.page === pageNumber
                                    ? "bg-indigo-600 text-white"
                                    : "text-gray-700 hover:bg-gray-100"
                                }`}
                              >
                                {pageNumber}
                              </button>
                            );
                          }
                          return null;
                        }
                      )}
                    </div>

                    <button
                      onClick={handleNextPage}
                      disabled={pagination.page >= pagination.totalPages}
                      className="p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Recently Viewed Section (optional) - simulated for UI purposes */}
            <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Recently Viewed
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
                {products.slice(0, 4).map((product) => (
                  <div
                    key={`recent-${product._id}`}
                    className="border rounded-lg overflow-hidden hover:shadow-sm transition-shadow"
                  >
                    <Link to={`/products/${product._id}`}>
                      <div className="h-24 bg-gray-100">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0].url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <ShoppingBag className="h-8 w-8 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="p-2">
                        <p className="text-xs font-medium text-gray-900 truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-indigo-700">
                          {formatCurrency(product.price)}
                        </p>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
