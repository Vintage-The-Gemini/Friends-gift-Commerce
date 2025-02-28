// src/pages/public/ProductsPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  Filter,
  Heart,
  Grid,
  List,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
// Fix the Card import to use relative path instead of @/ path
import Card from "../../components/ui/card";
import { CardContent } from "../../components/ui/card";
import { productService } from "../../services/api/product";
import { categoryService } from "../../services/api/category";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";
import { formatCurrency } from "../../utils/currency";

const ProductsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    search: searchParams.get("search") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
  });

  const [options, setOptions] = useState({
    page: parseInt(searchParams.get("page")) || 1,
    limit: 12,
    sort: searchParams.get("sort") || "newest",
  });

  const [viewMode, setViewMode] = useState("grid");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch categories and products on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    params.append("page", options.page);
    params.append("sort", options.sort);
    setSearchParams(params);
  }, [filters, options.page, options.sort]);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAllCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productService.getAllProducts(filters, options);

      if (response.success) {
        setProducts(response.data);
        setPagination({
          currentPage: response.pagination.page,
          totalPages: response.pagination.totalPages,
          total: response.pagination.total,
        });
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to load products");
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback((e) => {
    const value = e.target.value;
    setFilters((prev) => ({ ...prev, search: value }));
    setOptions((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setOptions((prev) => ({ ...prev, page: 1 }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      category: "",
      search: "",
      minPrice: "",
      maxPrice: "",
    });
    setOptions((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleAddToEvent = async (product) => {
    if (!user) {
      toast.info("Please sign in to add products to your event");
      navigate("/auth/signin");
      return;
    }
    navigate("/events/create", { state: { selectedProduct: product } });
  };

  const handleWishlist = async (productId) => {
    if (!user) {
      toast.info("Please sign in to add products to your wishlist");
      navigate("/auth/signin");
      return;
    }

    try {
      const response = await productService.toggleWishlist(productId);
      if (response.success) {
        toast.success(response.message);
      }
    } catch (error) {
      toast.error("Failed to update wishlist");
    }
  };

  const renderFiltersSidebar = () => (
    <Card className="sticky top-4">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-semibold">Filters</h2>
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear All
          </button>
        </div>

        <div className="space-y-6">
          {/* Categories */}
          <div>
            <h3 className="text-sm font-medium mb-3">Categories</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <label key={category._id} className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    checked={filters.category === category._id}
                    onChange={() =>
                      handleFilterChange("category", category._id)
                    }
                    className="mr-2"
                  />
                  <span className="text-sm">{category.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="text-sm font-medium mb-3">Price Range</h3>
            <div className="space-y-3">
              <input
                type="number"
                placeholder="Min Price"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
              <input
                type="number"
                placeholder="Max Price"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderProductCard = (product) => (
    <Card key={product._id} className="group hover:shadow-lg transition-shadow">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.images?.[0]?.url || "/api/placeholder/400/400"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <button
          onClick={() => handleWishlist(product._id)}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Heart className="w-5 h-5" />
        </button>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {product.description}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold">
            {formatCurrency(product.price)}
          </span>
          <button
            onClick={() => handleAddToEvent(product)}
            className="px-4 py-2 bg-[#5551FF] text-white rounded-lg hover:bg-[#4440FF]"
          >
            Add to Event
          </button>
        </div>
      </CardContent>
    </Card>
  );

  const renderPagination = () => (
    <div className="flex justify-center items-center mt-8 space-x-2">
      <button
        onClick={() => setOptions((prev) => ({ ...prev, page: prev.page - 1 }))}
        disabled={options.page === 1}
        className="p-2 rounded-lg border disabled:opacity-50"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <span className="px-4 py-2">
        Page {pagination.currentPage} of {pagination.totalPages}
      </span>
      <button
        onClick={() => setOptions((prev) => ({ ...prev, page: prev.page + 1 }))}
        disabled={options.page === pagination.totalPages}
        className="p-2 rounded-lg border disabled:opacity-50"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <h1 className="text-2xl font-bold">All Products</h1>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={handleSearch}
                className="w-full md:w-64 pl-10 pr-4 py-2 border rounded-lg"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            <select
              value={options.sort}
              onChange={(e) =>
                setOptions((prev) => ({ ...prev, sort: e.target.value }))
              }
              className="border rounded-lg px-4 py-2"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
            </select>

            <div className="flex border rounded-lg">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${
                  viewMode === "grid" ? "bg-[#5551FF] text-white" : ""
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 ${
                  viewMode === "list" ? "bg-[#5551FF] text-white" : ""
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden p-2 border rounded-lg"
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar - Desktop */}
          <div className="hidden md:block w-64 flex-shrink-0">
            {renderFiltersSidebar()}
          </div>

          {/* Mobile Filters Modal */}
          {showFilters && (
            <div className="fixed inset-0 z-50 md:hidden">
              <div
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={() => setShowFilters(false)}
              />
              <div className="absolute right-0 top-0 h-full w-80 bg-white p-6 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-semibold">Filters</h2>
                  <button onClick={() => setShowFilters(false)}>
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {renderFiltersSidebar()}
              </div>
            </div>
          )}

          {/* Products Grid/List */}
          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5551FF]"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">
                  No products found matching your criteria.
                </p>
                <button
                  onClick={clearFilters}
                  className="text-[#5551FF] hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                      : "space-y-4"
                  }
                >
                  {products.map((product) => renderProductCard(product))}
                </div>
                {renderPagination()}
              </>
            )}
          </div>
        </div>

        {/* Results Summary */}
        {!loading && products.length > 0 && (
          <div className="mt-4 text-sm text-gray-500">
            Showing {(options.page - 1) * options.limit + 1} to{" "}
            {Math.min(options.page * options.limit, pagination.total)} of{" "}
            {pagination.total} products
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
