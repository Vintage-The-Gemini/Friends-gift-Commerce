// frontend/src/pages/admin/AdminProducts.jsx
import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  Search,
  Filter,
  Trash2,
  Eye,
  Package,
  AlertCircle,
  Check,
  X,
  RefreshCw,
  Tag,
  GridIcon,
  ListIcon,
  CheckCircle,
  XCircle,
  Clock,
  MoreHorizontal,
  ChevronRight,
  ChevronLeft,
  Sliders,
  User,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  DollarSign,
} from "lucide-react";
import api from "../../services/api/axios.config";
import { toast } from "react-toastify";
import { formatCurrency } from "../../utils/currency";

const AdminProducts = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const searchTimeout = useRef(null);
  
  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState(queryParams.get("search") || "");
  const [categoryFilter, setCategoryFilter] = useState(queryParams.get("category") || "");
  const [sellerFilter, setSellerFilter] = useState(queryParams.get("seller") || "");
  const [statusFilter, setStatusFilter] = useState(queryParams.get("status") || "all");
  const [approvalFilter, setApprovalFilter] = useState(queryParams.get("approvalStatus") || "all");
  const [categories, setCategories] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(parseInt(queryParams.get("page")) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [viewMode, setViewMode] = useState(localStorage.getItem("adminProductsViewMode") || "table");
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSellers();

    // Close dropdown when clicking outside
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [page, categoryFilter, sellerFilter, statusFilter, approvalFilter, sortField, sortDirection]);

  // Debounced search effect
  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    if (searchTerm) {
      setLoadingSearch(true);
      searchTimeout.current = setTimeout(() => {
        setPage(1); // Reset to first page when searching
        fetchProducts();
      }, 500); // Debounce for 500ms
    }
    
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchTerm]);

  useEffect(() => {
    // Update URL with current filters
    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    if (categoryFilter) params.append("category", categoryFilter);
    if (sellerFilter) params.append("seller", sellerFilter);
    if (statusFilter !== "all") params.append("status", statusFilter);
    if (approvalFilter !== "all") params.append("approvalStatus", approvalFilter);
    if (page > 1) params.append("page", page);
    
    navigate({ search: params.toString() }, { replace: true });
  }, [page, categoryFilter, sellerFilter, statusFilter, approvalFilter, navigate]);

  // Save view mode to localStorage
  useEffect(() => {
    localStorage.setItem("adminProductsViewMode", viewMode);
  }, [viewMode]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query params
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", 12);
      params.append("sort", `${sortDirection === "desc" ? "-" : ""}${sortField}`);

      if (categoryFilter) {
        params.append("category", categoryFilter);
      }

      if (sellerFilter) {
        params.append("seller", sellerFilter);
      }

      if (statusFilter !== "all") {
        params.append("isActive", statusFilter === "active" ? "true" : "false");
      }

      if (approvalFilter !== "all") {
        params.append("approvalStatus", approvalFilter);
      }

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      const response = await api.get(`/admin/products?${params.toString()}`);

      if (response.data.success) {
        setProducts(response.data.data);
        setTotalPages(response.data.pagination.pages);
        setTotalProducts(response.data.pagination.total);
      } else {
        throw new Error(response.data.message || "Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to load products. Please try again.");
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
      setLoadingSearch(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/admin/categories");
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchSellers = async () => {
    try {
      const response = await api.get("/admin/sellers");
      if (response.data.success) {
        setSellers(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching sellers:", error);
    }
  };

  const handleSearch = (e) => {
    if (e) {
      e.preventDefault();
    }
    
    // Cancel any existing search timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    setLoadingSearch(true);
    setPage(1); // Reset to first page
    fetchProducts();
  };

  const resetFilters = () => {
    setSearchTerm("");
    setCategoryFilter("");
    setSellerFilter("");
    setStatusFilter("all");
    setApprovalFilter("all");
    setPage(1);
    navigate("/admin/products", { replace: true });
    fetchProducts();
  };

  const toggleProductStatus = async (product) => {
    try {
      setActionLoading(true);

      const response = await api.put(`/admin/products/${product._id}`, {
        isActive: !product.isActive,
      });

      if (response.data.success) {
        toast.success(
          `Product ${
            product.isActive ? "deactivated" : "activated"
          } successfully`
        );
        fetchProducts(); // Refresh product list
      } else {
        throw new Error(
          response.data.message || "Failed to update product status"
        );
      }
    } catch (error) {
      console.error("Error updating product status:", error);
      toast.error(error.message || "Failed to update product status");
    } finally {
      setActionLoading(false);
      setShowStatusModal(false);
    }
  };

  const handleDelete = async () => {
    try {
      setActionLoading(true);

      const response = await api.delete(
        `/admin/products/${selectedProduct._id}`
      );

      if (response.data.success) {
        toast.success("Product deleted successfully");
        setShowDeleteModal(false);
        setSelectedProduct(null);
        fetchProducts(); // Refresh product list
      } else {
        throw new Error(response.data.message || "Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error(error.message || "Failed to delete product");
    } finally {
      setActionLoading(false);
    }
  };

  const openDeleteModal = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
    setActiveDropdown(null); // Close any open dropdown
  };

  const openStatusModal = (product) => {
    setSelectedProduct(product);
    setShowStatusModal(true);
    setActiveDropdown(null); // Close any open dropdown
  };

  const toggleDropdown = (productId) => {
    setActiveDropdown(activeDropdown === productId ? null : productId);
  };

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Helper function to get appropriate status badge
  const getStatusBadge = (product) => {
    if (product.approvalStatus === "pending") {
      return (
        <span className="px-2 py-1 inline-flex items-center text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" /> Pending
        </span>
      );
    } else if (product.approvalStatus === "approved") {
      if (product.isActive) {
        return (
          <span className="px-2 py-1 inline-flex items-center text-xs font-medium rounded-full bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" /> Active
          </span>
        );
      } else {
        return (
          <span className="px-2 py-1 inline-flex items-center text-xs font-medium rounded-full bg-gray-100 text-gray-800">
            <XCircle className="w-3 h-3 mr-1" /> Inactive
          </span>
        );
      }
    } else {
      return (
        <span className="px-2 py-1 inline-flex items-center text-xs font-medium rounded-full bg-red-100 text-red-800">
          <X className="w-3 h-3 mr-1" /> Rejected
        </span>
      );
    }
  };

  // Determine the page title based on filters
  const getPageTitle = () => {
    if (approvalFilter === "approved" && statusFilter === "active") {
      return "Approved Products";
    } else if (approvalFilter === "pending") {
      return "Pending Products";
    } else if (approvalFilter === "rejected") {
      return "Rejected Products";
    } else {
      return "Products Management";
    }
  };

  // Render loading spinner
  if (loading && products.length === 0) {
    return (
      <div className="p-4 md:p-6 flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">{getPageTitle()}</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your product catalog
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-grow md:flex-grow-0">
            <form onSubmit={handleSearch} className="w-full md:w-auto">
              <input
                type="text"
                placeholder="Search products..."
                className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {loadingSearch ? (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <RefreshCw className="w-4 h-4 text-gray-400 animate-spin" />
                </div>
              ) : (
                <button
                  type="submit"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  <Search className="w-4 h-4" />
                </button>
              )}
            </form>
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 border rounded-lg hover:bg-gray-50 relative"
            aria-expanded={showFilters}
          >
            <Sliders className="w-5 h-5 text-gray-600" />
            {(categoryFilter || sellerFilter || statusFilter !== "all" || approvalFilter !== "all") && (
              <span className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3 bg-blue-500 rounded-full w-2.5 h-2.5"></span>
            )}
          </button>

          <div className="flex items-center border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 ${
                viewMode === "table"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
              title="Table view"
            >
              <ListIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 ${
                viewMode === "grid"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
              title="Grid view"
            >
              <GridIcon className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={fetchProducts}
            className="p-2 border rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6 animate-fadeIn">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Filters</h2>
            <button
              onClick={resetFilters}
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Reset all filters
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg text-gray-700 w-full"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Seller
              </label>
              <select
                value={sellerFilter}
                onChange={(e) => setSellerFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg text-gray-700 w-full"
              >
                <option value="">All Sellers</option>
                {sellers.map((seller) => (
                  <option key={seller._id} value={seller._id}>
                    {seller.businessName || seller.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg text-gray-700 w-full"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Approval
              </label>
              <select
                value={approvalFilter}
                onChange={(e) => setApprovalFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg text-gray-700 w-full"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={() => {
                setShowFilters(false);
                fetchProducts();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Active Filters */}
      {(categoryFilter || sellerFilter || statusFilter !== "all" || approvalFilter !== "all") && (
        <div className="mb-4 flex flex-wrap gap-2">
          {categoryFilter && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 text-xs px-3 py-1 rounded-full flex items-center">
              <Tag className="w-3 h-3 mr-1.5" />
              <span className="mr-1">Category:</span>
              <span className="font-medium mr-2">
                {categories.find((c) => c._id === categoryFilter)?.name || "Selected"}
              </span>
              <button
                onClick={() => setCategoryFilter("")}
                className="text-blue-500 hover:text-blue-700"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {sellerFilter && (
            <div className="bg-purple-50 border border-purple-200 text-purple-700 text-xs px-3 py-1 rounded-full flex items-center">
              <User className="w-3 h-3 mr-1.5" />
              <span className="mr-1">Seller:</span>
              <span className="font-medium mr-2">
                {sellers.find((s) => s._id === sellerFilter)?.businessName || "Selected"}
              </span>
              <button
                onClick={() => setSellerFilter("")}
                className="text-purple-500 hover:text-purple-700"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          
          {statusFilter !== "all" && (
            <div className={`${
              statusFilter === "active" ? "bg-green-50 border-green-200 text-green-700" : "bg-gray-50 border-gray-200 text-gray-700"
            } text-xs px-3 py-1 rounded-full flex items-center border`}>
              {statusFilter === "active" ? (
                <CheckCircle className="w-3 h-3 mr-1.5" />
              ) : (
                <XCircle className="w-3 h-3 mr-1.5" />
              )}
              <span className="mr-1">Status:</span>
              <span className="font-medium mr-2">
                {statusFilter === "active" ? "Active" : "Inactive"}
              </span>
              <button 
                onClick={() => setStatusFilter("all")}
                className={statusFilter === "active" ? "text-green-500 hover:text-green-700" : "text-gray-500 hover:text-gray-700"}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          
          {approvalFilter !== "all" && (
            <div className={`${
              approvalFilter === "approved" ? "bg-green-50 border-green-200 text-green-700" : 
              approvalFilter === "pending" ? "bg-yellow-50 border-yellow-200 text-yellow-700" : 
              "bg-red-50 border-red-200 text-red-700"
            } text-xs px-3 py-1 rounded-full flex items-center border`}>
              {approvalFilter === "approved" ? (
                <CheckCircle className="w-3 h-3 mr-1.5" />
              ) : approvalFilter === "pending" ? (
                <Clock className="w-3 h-3 mr-1.5" />
              ) : (
                <X className="w-3 h-3 mr-1.5" />
              )}
              <span className="mr-1">Approval:</span>
              <span className="font-medium mr-2">
                {approvalFilter.charAt(0).toUpperCase() + approvalFilter.slice(1)}
              </span>
              <button 
                onClick={() => setApprovalFilter("all")}
                className={
                  approvalFilter === "approved" ? "text-green-500 hover:text-green-700" : 
                  approvalFilter === "pending" ? "text-yellow-500 hover:text-yellow-700" : 
                  "text-red-500 hover:text-red-700"
                }
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Summary */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-medium text-gray-700">Products Summary</h2>
          <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full">
            {totalProducts} total product{totalProducts !== 1 ? "s" : ""}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="flex items-center gap-3 bg-green-50 rounded-lg p-3">
            <div className="bg-green-100 p-2 rounded-md">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-xs text-green-800">Active</div>
              <div className="text-lg font-semibold text-green-600">
                {products.filter(p => p.approvalStatus === "approved" && p.isActive).length}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-yellow-50 rounded-lg p-3">
            <div className="bg-yellow-100 p-2 rounded-md">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-xs text-yellow-800">Pending</div>
              <div className="text-lg font-semibold text-yellow-600">
                {products.filter(p => p.approvalStatus === "pending").length}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-red-50 rounded-lg p-3">
            <div className="bg-red-100 p-2 rounded-md">
              <X className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="text-xs text-red-800">Inactive/Rejected</div>
              <div className="text-lg font-semibold text-red-600">
                {products.filter(p => p.approvalStatus === "rejected" || (p.approvalStatus === "approved" && !p.isActive)).length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid View for Products */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          {products.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg shadow p-8 text-center">
              <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search filters</p>
              {(categoryFilter || sellerFilter || statusFilter !== "all" || approvalFilter !== "all") && (
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center text-blue-600 hover:text-blue-800"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset all filters
                </button>
              )}
            </div>
          ) : (
            products.map((product) => (
              <div key={product._id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative h-48 bg-gray-100">
                  {product.images && product.images.length > 0 ? (
                    <img 
                      src={product.images[0].url} 
                      alt={product.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-16 w-16 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    {getStatusBadge(product)}
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-1 truncate" title={product.name}>{product.name}</h3>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-semibold text-blue-600">
                      {formatCurrency(product.price)}
                    </span>
                    <span className="text-xs text-gray-500">
                      Stock: {product.stock}
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-2 text-xs mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Category:</span>
                      <span className="font-medium truncate max-w-[120px]" title={product.category?.name}>
                        {product.category?.name || "Uncategorized"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Seller:</span>
                      <span className="font-medium truncate max-w-[120px]" title={product.seller?.businessName || product.seller?.name}>
                        {product.seller?.businessName || product.seller?.name || "Unknown"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between gap-2">
                    <Link
                      to={`/products/${product._id}`}
                      target="_blank"
                      className="text-blue-600 px-3 py-1.5 text-sm rounded-lg border border-blue-600 hover:bg-blue-50 inline-flex items-center"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" /> View
                    </Link>
                    
                    {product