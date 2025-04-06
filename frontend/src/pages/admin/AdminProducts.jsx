// frontend/src/pages/admin/AdminProducts.jsx
import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  ShoppingBag,
  AlertCircle,
  Check,
  X,
  RefreshCw,
  Package,
  Tag,
  DollarSign,
  GridIcon,
  ListIcon,
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import api from "../../services/api/axios.config";
import { toast } from "react-toastify";
import { formatCurrency } from "../../utils/currency";

const AdminProducts = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  
  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const [actionsDropdown, setActionsDropdown] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSellers();

    // Close dropdown when clicking outside
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActionsDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [page, categoryFilter, sellerFilter, statusFilter, approvalFilter]);

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
    e.preventDefault();
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
    setActionsDropdown(null); // Close any open dropdown
  };

  const openStatusModal = (product) => {
    setSelectedProduct(product);
    setShowStatusModal(true);
    setActionsDropdown(null); // Close any open dropdown
  };

  const toggleActionsDropdown = (productId) => {
    if (actionsDropdown === productId) {
      setActionsDropdown(null);
    } else {
      setActionsDropdown(productId);
    }
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
      <div className="p-6 flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-wrap justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{getPageTitle()}</h1>
        
        {/* View mode toggle + filters */}
        <div className="flex items-center space-x-2 mt-2 sm:mt-0">
          <div className="flex items-center border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 ${
                viewMode === "table"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
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
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
              title="Grid view"
            >
              <GridIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <form
          onSubmit={handleSearch}
          className="flex flex-wrap gap-4 items-end"
        >
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="pl-10 pr-4 py-2 border rounded-lg w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>

          <div className="w-full sm:w-auto">
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

          <div className="w-full sm:w-auto">
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

          <div className="w-full sm:w-auto">
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

          <div className="w-full sm:w-auto">
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

          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Filter className="w-4 h-4 mr-2 inline-block" />
              <span className="hidden sm:inline-block">Filter</span>
            </button>

            <button
              type="button"
              onClick={resetFilters}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline-block">Reset</span>
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Pills */}
      {(categoryFilter || sellerFilter || statusFilter !== "all" || approvalFilter !== "all") && (
        <div className="mb-4 flex flex-wrap gap-2">
          {categoryFilter && (
            <div className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full flex items-center">
              <span className="mr-1">Category:</span>
              <span className="font-medium mr-2">
                {categories.find(cat => cat._id === categoryFilter)?.name || 'Selected'}
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
            <div className="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full flex items-center">
              <span className="mr-1">Seller:</span>
              <span className="font-medium mr-2">
                {sellers.find(s => s._id === sellerFilter)?.businessName || 
                 sellers.find(s => s._id === sellerFilter)?.name || 'Selected'}
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
              statusFilter === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
            } text-xs px-3 py-1 rounded-full flex items-center`}>
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
              approvalFilter === "approved" ? "bg-green-100 text-green-800" : 
              approvalFilter === "pending" ? "bg-yellow-100 text-yellow-800" : 
              "bg-red-100 text-red-800"
            } text-xs px-3 py-1 rounded-full flex items-center`}>
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
                      <ShoppingBag className="h-16 w-16 text-gray-300" />
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
                    
                    {product.isActive ? (
                      <button
                        onClick={() => openStatusModal(product)}
                        className="text-red-600 px-3 py-1.5 text-sm rounded-lg border border-red-600 hover:bg-red-50 inline-flex items-center"
                      >
                        <X className="w-3.5 h-3.5 mr-1" /> Deactivate
                      </button>
                    ) : (
                      <button
                        onClick={() => openStatusModal(product)}
                        className="text-green-600 px-3 py-1.5 text-sm rounded-lg border border-green-600 hover:bg-green-50 inline-flex items-center"
                      >
                        <Check className="w-3.5 h-3.5 mr-1" /> Activate
                      </button>
                    )}
                    
                    <button
                      onClick={() => openDeleteModal(product)}
                      className="text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Table View for Products */}
      {viewMode === "table" && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Seller
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      <ShoppingBag className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                      <p>Try adjusting your search filters</p>
                      {(categoryFilter || sellerFilter || statusFilter !== "all" || approvalFilter !== "all") && (
                        <button
                          onClick={resetFilters}
                          className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Reset all filters
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-md overflow-hidden bg-gray-100">
                            {product.images && product.images.length > 0 ? (
                              <img
                                src={product.images[0].url}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <ShoppingBag className="h-10 w-10 p-2 text-gray-400" />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-xs text-gray-500 truncate max-w-xs">
                              {product.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(product.price)}
                        </div>
                        {product.marginPercentage > 0 && (
                          <div className="text-xs text-gray-500">
                            Margin: {product.marginPercentage}%
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Tag className="w-4 h-4 mr-1.5 text-gray-400" />
                          {product.category?.name || "Uncategorized"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {product.seller?.businessName ||
                            product.seller?.name ||
                            "Unknown Seller"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.stock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(product)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="relative inline-block text-left" ref={dropdownRef}>
                          <button
                            onClick={() => toggleActionsDropdown(product._id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <MoreVertical className="h-5 w-5" />
                          </button>

                          {actionsDropdown === product._id && (
                            <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                              <div className="py-1">
                                <Link
                                  to={`/products/${product._id}`}
                                  target="_blank"
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <ExternalLink className="w-4 h-4 mr-2 text-gray-400" />
                                  View on Site
                                </Link>
                                
                                {product.isActive ? (
                                  <button
                                    onClick={() => openStatusModal(product)}
                                    className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                  >
                                    <X className="w-4 h-4 mr-2" />
                                    Deactivate
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => openStatusModal(product)}
                                    className="w-full text-left flex items-center px-4 py-2 text-sm text-green-600 hover:bg-gray-100"
                                  >
                                    <Check className="w-4 h-4 mr-2" />
                                    Activate
                                  </button>
                                )}
                                
                                <button
                                  onClick={() => openDeleteModal(product)}
                                  className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-700 hidden sm:block">
            Showing <span className="font-medium">{products.length}</span> of{" "}
            <span className="font-medium">{totalProducts}</span> products
          </div>
          <div className="flex gap-2 mx-auto sm:mx-0">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 flex items-center"
            >
              <ChevronLeft className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Previous</span>
            </button>
            
            <div className="hidden sm:flex gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = page > 3 && totalPages > 5 ? page - 3 + i : i + 1;
                if (pageNum <= totalPages) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-8 h-8 flex items-center justify-center border rounded ${
                        pageNum === page
                          ? "bg-blue-600 text-white border-blue-600"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                }
                return null;
              })}
            </div>
            
            <div className="sm:hidden flex items-center px-2">
              <span className="text-sm font-medium">
                {page} / {totalPages}
              </span>
            </div>
            
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 flex items-center"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4 sm:ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Delete Product</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the product "
              {selectedProduct?.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
              >
                {actionLoading ? (
                  <>
                    <RefreshCw className="animate-spin w-4 h-4 mr-2" />
                    Deleting...
                  </>
                ) : (
                  "Delete Product"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activate/Deactivate Confirmation Modal */}
      {showStatusModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">
              {selectedProduct.isActive ? "Deactivate" : "Activate"} Product
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to {selectedProduct.isActive ? "deactivate" : "activate"} the product "
              {selectedProduct?.name}"? 
              {selectedProduct.isActive 
                ? " This will make the product invisible to users." 
                : " This will make the product visible to users."}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => toggleProductStatus(selectedProduct)}
                disabled={actionLoading}
                className={`text-white px-4 py-2 rounded-lg disabled:opacity-50 flex items-center ${
                  selectedProduct.isActive 
                    ? "bg-red-600 hover:bg-red-700" 
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {actionLoading ? (
                  <>
                    <RefreshCw className="animate-spin w-4 h-4 mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    {selectedProduct.isActive ? (
                      <>
                        <X className="w-4 h-4 mr-2" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Activate
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;