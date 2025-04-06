// src/pages/public/ProductsPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  Filter,
  Grid,
  X,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Star,
  ShoppingBag
} from "lucide-react";
import { productService } from "../../services/api/product";
import { categoryService } from "../../services/api/category";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";
import CompactProductCard from "../../components/products/CompactProductCard";
import { debounce } from "lodash";
import { formatCurrency } from "../../utils/currency";

const ProductsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
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

  // Fetch categories on mount - just once
  useEffect(() => {
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

    fetchCategories();
    fetchProducts(true);
  }, []);

  // Fetch products when filters or sort changes
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    params.append("page", pagination.page.toString());
    params.append("sort", sortOption);
    setSearchParams(params);
    
    fetchProducts(true);
  }, [filters, sortOption]);

  // Fetch products when page changes 
  useEffect(() => {
    if (pagination.page > 1) {
      fetchProducts(false);
    }
  }, [pagination.page]);

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((value) => {
      setFilters((prev) => ({ ...prev, search: value }));
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 300),
    []
  );

  const fetchProducts = async (resetPage = false) => {
    try {
      setLoading(true);

      const options = {
        page: resetPage ? 1 : pagination.page,
        limit: 24,
        sort: getSortValue(),
      };

      const response = await productService.getAllProducts(filters, options);

      if (response.success) {
        if (resetPage) {
          setProducts(response.data);
        } else {
          setProducts((prev) => [...prev, ...response.data]);
        }
        setPagination({
          page: response.pagination.page,
          totalPages: response.pagination.totalPages,
          total: response.pagination.total,
        });
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
      navigate("/auth/signin", { state: { from: window.location.pathname } });
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

  const hasActiveFilters = Object.values(filters).some((v) => v);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Discover Perfect Gifts
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Browse our curated collection to find the ideal gift for any occasion
          </p>
        </div>

        {/* Main Content Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Desktop */}
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
                <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                  <div className="flex items-center">
                    <input
                      id="category-all"
                      type="radio"
                      checked={filters.category === ""}
                      onChange={() =>
                        setFilters((prev) => ({ ...prev, category: "" }))
                      }
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <label
                      htmlFor="category-all"
                      className="ml-3 text-sm text-gray-700"
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
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <label
                        htmlFor={`category-${category._id}`}
                        className="ml-3 text-sm text-gray-700"
                      >
                        {category.name}
                      </label>
                    </div>
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
                    <label htmlFor="min-price" className="block text-sm text-gray-600 mb-1">
                      Min Price
                    </label>
                    <input
                      type="number"
                      id="min-price"
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
                    <label htmlFor="max-price" className="block text-sm text-gray-600 mb-1">
                      Max Price
                    </label>
                    <input
                      type="number"
                      id="max-price"
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
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
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
                  </button>
                </div>
              </div>

              {/* Active filters - mobile */}
              {hasActiveFilters && (
                <div className="mt-6 flex flex-wrap gap-2 lg:hidden">
                  {filters.category && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                      Category:{" "}
                      {
                        categories.find((c) => c._id === filters.category)
                          ?.name || "Selected"
                      }
                      <button
                        onClick={() =>
                          setFilters((prev) => ({ ...prev, category: "" }))
                        }
                        className="ml-2 inline-flex text-indigo-600 focus:outline-none"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </span>
                  )}
                  {filters.minPrice && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      Min: {formatCurrency(filters.minPrice)}
                      <button
                        onClick={() =>
                          setFilters((prev) => ({ ...prev, minPrice: "" }))
                        }
                        className="ml-2 inline-flex text-green-600 focus:outline-none"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </span>
                  )}
                  {filters.maxPrice && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      Max: {formatCurrency(filters.maxPrice)}
                      <button
                        onClick={() =>
                          setFilters((prev) => ({ ...prev, maxPrice: "" }))
                        }
                        className="ml-2 inline-flex text-green-600 focus:outline-none"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Filters Modal */}
            {showMobileFilters && (
              <div className="fixed inset-0 z-50 bg-black bg-opacity-50 lg:hidden">
                <div className="absolute right-0 top-0 h-full w-full sm:w-96 bg-white shadow-xl overflow-y-auto">
                  <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-bold">Filters</h2>
                    <button 
                      onClick={() => setShowMobileFilters(false)}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <X className="w-6 h-6 text-gray-500" />
                    </button>
                  </div>

                  <div className="p-6 space-y-8">
                    {/* Categories */}
                    <div>
                      <h4 className="text-base font-semibold text-gray-900 mb-4">
                        Categories
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <input
                            id="mobile-category-all"
                            type="radio"
                            checked={filters.category === ""}
                            onChange={() => {
                              setFilters((prev) => ({ ...prev, category: "" }));
                            }}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                          />
                          <label
                            htmlFor="mobile-category-all"
                            className="ml-3 text-sm text-gray-700"
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
                              }}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                            />
                            <label
                              htmlFor={`mobile-category-${category._id}`}
                              className="ml-3 text-sm text-gray-700"
                            >
                              {category.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Price Range */}
                    <div>
                      <h4 className="text-base font-semibold text-gray-900 mb-4">
                        Price Range
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="mobile-min-price" className="block text-sm text-gray-600 mb-1">
                            Min Price
                          </label>
                          <input
                            type="number"
                            id="mobile-min-price"
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
                          <label htmlFor="mobile-max-price" className="block text-sm text-gray-600 mb-1">
                            Max Price
                          </label>
                          <input
                            type="number"
                            id="mobile-max-price"
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

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleClearFilters}
                        className="flex-1 px-6 py-3 border rounded-xl text-gray-700 font-medium hover:bg-gray-50"
                      >
                        Clear All
                      </button>
                      <button
                        onClick={() => setShowMobileFilters(false)}
                        className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700"
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
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      <div className="mt-4 h-8 bg-gray-200 rounded"></div>
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
                {/* Product Results Count */}
                <div className="flex justify-between items-center mb-6">
                  <p className="text-base text-gray-600">
                    Showing <span className="font-semibold">{products.length}</span> of{" "}
                    <span className="font-semibold">{pagination.total}</span> products
                  </p>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <CompactProductCard
                      key={product._id}
                      product={product}
                      onAddToEvent={handleAddToEvent}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-10 flex justify-center">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={handlePrevPage}
                        disabled={pagination.page === 1}
                        className="p-3 border rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center"
                      >
                        <ChevronLeft className="w-6 h-6" />
                        <span className="ml-1 hidden sm:inline">Previous</span>
                      </button>

                      <span className="px-5 py-2 text-base font-medium">
                        Page {pagination.page} of {pagination.totalPages}
                      </span>

                      <button
                        onClick={handleNextPage}
                        disabled={pagination.page >= pagination.totalPages}
                        className="p-3 border rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center"
                      >
                        <span className="mr-1 hidden sm:inline">Next</span>
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;