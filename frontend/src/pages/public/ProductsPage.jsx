// src/pages/public/ProductsPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
} from "lucide-react";
import { productService } from "../../services/api/product";
import { categoryService } from "../../services/api/category";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";
import CompactProductCard from "../../components/products/CompactProductCard";
import { debounce } from "lodash";

const ProductsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
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
          setProducts((prev) => [...prev, ...response.data]);
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

  return (
    <div className="bg-gray-50 min-h-screen py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Discover Products
          </h1>
          <p className="text-gray-600">
            Find perfect gifts for your special occasions
          </p>
        </div>

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
                    placeholder="Search products..."
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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {products.map((product) => (
                    <CompactProductCard
                      key={product._id}
                      product={product}
                      onAddToEvent={handleAddToEvent}
                    />
                  ))}
                </div>

                {/* Pagination */}
                <div className="mt-8 flex justify-center">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={pagination.page === 1}
                      className="p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <span className="px-4 py-2 text-sm">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>

                    <button
                      onClick={handleNextPage}
                      disabled={pagination.page >= pagination.totalPages}
                      className="p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
