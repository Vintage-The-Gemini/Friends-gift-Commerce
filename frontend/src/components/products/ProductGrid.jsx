// src/components/products/ProductGrid.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Grid,
  List,
  Trash2,
  X,
  ChevronDown,
} from "lucide-react";
import { productService } from "../../services/api/product";
import { categoryService } from "../../services/api/category";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";
import ProductCard from "./ProductCard";
import { debounce } from "lodash";

const ProductGrid = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [filters, setFilters] = useState({
    category: "",
    search: "",
    minPrice: "",
    maxPrice: "",
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sortOption, setSortOption] = useState("newest");
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch categories
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
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    fetchProducts(true);
  }, [filters, sortOption]);

  // Create debounced search handler
  const debouncedSearch = useCallback(
    debounce((value) => {
      setFilters((prev) => ({ ...prev, search: value }));
    }, 500),
    []
  );

  const fetchProducts = async (resetPage = false) => {
    try {
      setLoading(true);

      const options = {
        page: resetPage ? 1 : pagination.page,
        limit: 12,
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
  };

  const handleLoadMore = () => {
    setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
    fetchProducts(false);
  };

  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Discover Products</h2>

        {/* Sort and View Controls */}
        <div className="flex items-center space-x-3">
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

          <div className="flex border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 ${
                viewMode === "grid"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-600"
              }`}
              aria-label="Grid view"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 ${
                viewMode === "list"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-600"
              }`}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setShowMobileFilters(true)}
            className="p-2 border rounded-lg md:hidden"
            aria-label="Show filters"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        {/* Desktop Filters Sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm p-5 sticky top-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-gray-900">Filters</h3>
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
              <h4 className="text-sm font-medium text-gray-700 mb-2">
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
              <h4 className="text-sm font-medium text-gray-700 mb-2">
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

        {/* Mobile Filters Modal */}
        {showMobileFilters && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end lg:hidden">
            <div className="w-80 bg-white h-full overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-lg">Filters</h3>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Categories
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  <div className="flex items-center">
                    <input
                      id="mobile-category-all"
                      type="radio"
                      checked={filters.category === ""}
                      onChange={() =>
                        setFilters((prev) => ({ ...prev, category: "" }))
                      }
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
                        onChange={() =>
                          setFilters((prev) => ({
                            ...prev,
                            category: category._id,
                          }))
                        }
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
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="mobile-min-price" className="sr-only">
                      Minimum Price
                    </label>
                    <input
                      type="number"
                      id="mobile-min-price"
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
                    <label htmlFor="mobile-max-price" className="sr-only">
                      Maximum Price
                    </label>
                    <input
                      type="number"
                      id="mobile-max-price"
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

              <div className="flex space-x-2 mt-6">
                <button
                  onClick={handleClearFilters}
                  className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="flex-1 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Products Content */}
        <div className="flex-1">
          {/* Search Bar */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search products..."
              onChange={handleSearchChange}
              defaultValue={filters.search}
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          {/* Products Grid/List */}
          {loading && products.length === 0 ? (
            <div className="flex justify-center items-center h-60">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No products found
              </h3>
              <p className="text-gray-500 mb-6">
                Try adjusting your search or filters to find what you're looking
                for.
              </p>
              <button
                onClick={handleClearFilters}
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              {/* Product Results Count */}
              <p className="text-sm text-gray-500 mb-4">
                Showing {products.length} of {pagination.total} products
              </p>

              {/* Grid View */}
              {viewMode === "grid" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      onAddToEvent={handleAddToEvent}
                    />
                  ))}
                </div>
              )}

              {/* List View */}
              {viewMode === "list" && (
                <div className="space-y-4">
                  {products.map((product) => (
                    <div
                      key={product._id}
                      className="flex flex-col sm:flex-row bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all"
                    >
                      <div className="sm:w-48 h-48">
                        <img
                          src={
                            product.images?.[0]?.url ||
                            "/api/placeholder/400/400"
                          }
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 p-4 flex flex-col">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1">
                            {product.name}
                          </h3>
                          <p className="text-gray-600 text-sm mb-4">
                            {product.description}
                          </p>

                          {!product.stock > 0 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Out of Stock
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <span className="text-lg font-bold text-indigo-700">
                            {product.price &&
                              product.price.toLocaleString("en-KE", {
                                style: "currency",
                                currency: "KES",
                              })}
                          </span>

                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleAddToEvent(product)}
                              disabled={!product.stock > 0}
                              className={`px-4 py-2 rounded-lg flex items-center ${
                                product.stock > 0
                                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
                              }`}
                            >
                              <Gift className="w-4 h-4 mr-1.5" />
                              <span className="text-sm">Add to Event</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Load More Button */}
              {pagination.page < pagination.totalPages && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="px-6 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {loading ? "Loading..." : "Load More Products"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductGrid;
