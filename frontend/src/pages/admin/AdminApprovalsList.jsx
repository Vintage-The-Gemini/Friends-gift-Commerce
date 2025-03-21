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
} from "lucide-react";
import api from "../../services/api/axios.config";
import { toast } from "react-toastify";
import { formatCurrency } from "../../utils/currency";

const AdminApprovalsList = () => {
  const [pendingProducts, setPendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sellerFilter, setSellerFilter] = useState("");
  const [categories, setCategories] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchPendingProducts();
    fetchCategories();
    fetchSellers();
  }, [page]);

  const fetchPendingProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query params
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", 10);

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

  const handleApprove = async (productId) => {
    try {
      const response = await api.put(
        `/admin/approvals/products/${productId}/approve`
      );

      if (response.data.success) {
        toast.success("Product approved successfully");
        // Remove the approved product from the list
        setPendingProducts(
          pendingProducts.filter((product) => product._id !== productId)
        );
      } else {
        throw new Error(response.data.message || "Failed to approve product");
      }
    } catch (error) {
      console.error("Error approving product:", error);
      toast.error(error.message || "Failed to approve product");
    }
  };

  const openRejectModal = (product) => {
    setSelectedProduct(product);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!rejectionReason) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      const response = await api.put(
        `/admin/approvals/products/${selectedProduct._id}/reject`,
        {
          reason: rejectionReason,
        }
      );

      if (response.data.success) {
        toast.success("Product rejected successfully");
        // Remove the rejected product from the list
        setPendingProducts(
          pendingProducts.filter(
            (product) => product._id !== selectedProduct._id
          )
        );
        setShowRejectModal(false);
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

  // Render loading spinner
  if (loading && pendingProducts.length === 0) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Product Approvals</h1>
        <button
          onClick={fetchPendingProducts}
          className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
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
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Filter className="w-4 h-4 mr-2 inline" />
              Filter
            </button>
          </div>

          <div>
            <button
              type="button"
              onClick={resetFilters}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
            >
              <RefreshCw className="w-4 h-4 mr-2 inline" />
              Reset
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

      {pendingProducts.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-medium text-gray-900 mb-2">
            No Pending Products
          </h2>
          <p className="text-gray-500">
            There are no products waiting for approval at this moment.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
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
                <tr key={product._id}>
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
                        className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Link>
                      <button
                        onClick={() => handleApprove(product._id)}
                        className="text-green-600 hover:text-green-900 inline-flex items-center"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => openRejectModal(product)}
                        className="text-red-600 hover:text-red-900 inline-flex items-center"
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
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 flex items-center"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </button>
          <div className="flex space-x-2">
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
          </div>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 flex items-center"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Reject Product</h2>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting "{selectedProduct?.name}".
              This feedback will be shared with the seller.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rejection Reason
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                rows="4"
                placeholder="Explain why this product is being rejected..."
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason}
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
