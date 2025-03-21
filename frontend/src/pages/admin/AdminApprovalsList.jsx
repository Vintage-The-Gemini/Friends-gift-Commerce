// frontend/src/pages/admin/AdminApprovalsList.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  Eye,
  Check,
  X,
  ChevronRight,
  ChevronLeft,
  Clock,
  Package,
  ShoppingBag,
  Grid,
  List,
  ExternalLink,
  Info,
} from "lucide-react";
import api from "../../services/api/axios.config";
import { toast } from "react-toastify";
import { formatCurrency } from "../../utils/currency";

const AdminApprovalsList = () => {
  const [pendingProducts, setPendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sellerFilter, setSellerFilter] = useState("");
  const [categories, setCategories] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [viewMode, setViewMode] = useState("grid"); // grid or table
  const [approvalStats, setApprovalStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  });

  useEffect(() => {
    fetchPendingProducts();
    fetchCategories();
    fetchSellers();
    fetchApprovalStats();
  }, [page]);

  const fetchApprovalStats = async () => {
    try {
      const response = await api.get("/admin/approvals/stats");
      if (response.data.success) {
        setApprovalStats(
          response.data.data.products || {
            pending: 0,
            approved: 0,
            rejected: 0,
            total: 0,
          }
        );
      }
    } catch (error) {
      console.error("Error fetching approval stats:", error);
    }
  };

  const fetchPendingProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query params
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", 12); // Increased limit for better grid view

      if (categoryFilter) {
        params.append("category", categoryFilter);
      }

      if (sellerFilter) {
        params.append("seller", sellerFilter);
      }

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      const response = await api.get(
        `/admin/approvals/products?${params.toString()}`
      );

      if (response.data.success) {
        setPendingProducts(response.data.data);
        setTotalPages(response.data.pagination.pages || 1);
        setTotalProducts(response.data.pagination.total || 0);
      } else {
        throw new Error(
          response.data.message || "Failed to fetch pending products"
        );
      }
    } catch (error) {
      console.error("Error fetching pending products:", error);
      setError("Failed to load pending products. Please try again.");
      toast.error("Failed to load pending products");
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

  const refreshList = async () => {
    setRefreshing(true);
    await fetchPendingProducts();
    await fetchApprovalStats();
    setRefreshing(false);
    toast.success("Product list refreshed");
  };

  const handleApprove = async (productId) => {
    try {
      const response = await api.put(
        `/admin/approvals/products/${productId}/approve`,
        { notes: "Product approved by admin" }
      );

      if (response.data.success) {
        toast.success("Product approved successfully");
        // Remove the approved product from the list
        setPendingProducts(
          pendingProducts.filter((product) => product._id !== productId)
        );
        // Update stats
        fetchApprovalStats();
      } else {
        throw new Error(response.data.message || "Failed to approve product");
      }
    } catch (error) {
      console.error("Error approving product:", error);
      toast.error(error.message || "Failed to approve product");
    }
  };

  const handleReject = async (productId, reason) => {
    if (!reason) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      const response = await api.put(
        `/admin/approvals/products/${productId}/reject`,
        {
          reason: reason,
        }
      );

      if (response.data.success) {
        toast.success("Product rejected successfully");
        // Remove the rejected product from the list
        setPendingProducts(
          pendingProducts.filter((product) => product._id !== productId)
        );
        // Update stats
        fetchApprovalStats();
      } else {
        throw new Error(response.data.message || "Failed to reject product");
      }
    } catch (error) {
      console.error("Error rejecting product:", error);
      toast.error(error.message || "Failed to reject product");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page
    fetchPendingProducts();
  };

  const resetFilters = () => {
    setSearchTerm("");
    setCategoryFilter("");
    setSellerFilter("");
    setPage(1);
    fetchPendingProducts();
  };

  // Modal state for rejection reason
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const openRejectModal = (product) => {
    setSelectedProduct(product);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  // Render loading spinner
  if (loading && pendingProducts.length === 0) {
    return (
      <div className="p-4 md:p-6 flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header with Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Product Approvals</h1>
          <p className="text-gray-600 text-sm mt-1">
            Review and manage product submissions
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refreshList}
            disabled={refreshing}
            className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
          <div className="flex rounded-lg overflow-hidden border border-gray-200">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 transition ${
                viewMode === "grid" ? "bg-gray-200" : "bg-white"
              }`}
              title="Grid view"
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 transition ${
                viewMode === "table" ? "bg-gray-200" : "bg-white"
              }`}
              title="Table view"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-yellow-500">
                {approvalStats.pending}
              </p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-full">
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Approved</p>
              <p className="text-2xl font-bold text-green-500">
                {approvalStats.approved}
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-full">
              <Check className="h-5 w-5 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Rejected</p>
              <p className="text-2xl font-bold text-red-500">
                {approvalStats.rejected}
              </p>
            </div>
            <div className="p-2 bg-red-100 rounded-full">
              <X className="h-5 w-5 text-red-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Products
              </p>
              <p className="text-2xl font-bold text-blue-500">
                {approvalStats.total}
              </p>
            </div>
            <div className="p-2 bg-blue-100 rounded-full">
              <Package className="h-5 w-5 text-blue-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
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
                className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg text-gray-700 w-full focus:ring-2 focus:ring-blue-500"
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
              className="px-4 py-2 border rounded-lg text-gray-700 w-full focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Sellers</option>
              {sellers.map((seller) => (
                <option key={seller._id} value={seller._id}>
                  {seller.businessName || seller.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Filter className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Filter</span>
            </button>

            <button
              type="button"
              onClick={resetFilters}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Conditional rendering based on view mode */}
      {pendingProducts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-200">
          <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            No Pending Products
          </h2>
          <p className="text-gray-500 mb-4">
            There are no products waiting for approval at this moment.
          </p>
        </div>
      ) : viewMode === "grid" ? (
        // Grid View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          {pendingProducts.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col"
            >
              {/* Product Image */}
              <div className="relative h-48 bg-gray-100 overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0].url}
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="h-12 w-12 text-gray-400" />
                  </div>
                )}

                {/* Resubmitted Badge */}
                {product.resubmitted && (
                  <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    Resubmitted
                  </div>
                )}

                {/* Price Badge */}
                <div className="absolute bottom-2 right-2 bg-white bg-opacity-90 text-gray-900 font-bold px-2 py-1 rounded shadow-sm">
                  {formatCurrency(product.price)}
                </div>
              </div>

              {/* Product Details */}
              <div className="p-4 flex-grow">
                <h3 className="font-medium text-gray-900 line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2 mt-1 h-10">
                  {product.description}
                </p>

                <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
                  <div>
                    Seller:{" "}
                    {product.seller?.businessName ||
                      product.seller?.name ||
                      "Unknown"}
                  </div>
                  <div>Stock: {product.stock}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                <div className="flex gap-2 justify-between">
                  <Link
                    to={`/admin/product-review/${product._id}`}
                    className="flex-1 bg-blue-50 text-blue-600 px-2 py-1.5 rounded flex items-center justify-center hover:bg-blue-100"
                  >
                    <Eye className="w-4 h-4 mr-1.5" />
                    Review
                  </Link>
                  <button
                    onClick={() => handleApprove(product._id)}
                    className="flex-1 bg-green-50 text-green-600 px-2 py-1.5 rounded flex items-center justify-center hover:bg-green-100"
                  >
                    <Check className="w-4 h-4 mr-1.5" />
                    Approve
                  </button>
                  <button
                    onClick={() => openRejectModal(product)}
                    className="flex-1 bg-red-50 text-red-600 px-2 py-1.5 rounded flex items-center justify-center hover:bg-red-100"
                  >
                    <X className="w-4 h-4 mr-1.5" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Table View
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 mb-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Seller
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-md overflow-hidden">
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

                          {product.resubmitted && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                              <Info className="w-3 h-3 mr-1" />
                              Resubmitted
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {product.seller?.businessName ||
                          product.seller?.name ||
                          "Unknown Seller"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {product.seller?.phoneNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {product.category?.name || "Uncategorized"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(product.price)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Stock: {product.stock}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(product.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(product.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/admin/product-review/${product._id}`}
                          className="text-blue-600 hover:text-blue-900 inline-flex items-center px-2 py-1 bg-blue-50 rounded hover:bg-blue-100"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Review
                        </Link>
                        <button
                          onClick={() => handleApprove(product._id)}
                          className="text-green-600 hover:text-green-900 inline-flex items-center px-2 py-1 bg-green-50 rounded hover:bg-green-100"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </button>
                        <button
                          onClick={() => openRejectModal(product)}
                          className="text-red-600 hover:text-red-900 inline-flex items-center px-2 py-1 bg-red-50 rounded hover:bg-red-100"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
          <div className="text-sm text-gray-700">
            Showing{" "}
            <span className="font-medium">{pendingProducts.length}</span> of{" "}
            <span className="font-medium">{totalProducts}</span> products
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 flex items-center"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = page > 3 && totalPages > 5 ? page - 3 + i : i + 1;
              if (pageNum <= totalPages) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-3 py-1 border rounded ${
                      pageNum === page
                        ? "bg-blue-600 text-white"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              }
              return null;
            })}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 flex items-center"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Reject Product</h2>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting "{selectedProduct.name}".
              This will be shared with the seller.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rejection Reason
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                rows="4"
                placeholder="Explain why this product is being rejected..."
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleReject(selectedProduct._id, rejectionReason);
                  setShowRejectModal(false);
                }}
                disabled={!rejectionReason.trim()}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Reject Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApprovalsList;
