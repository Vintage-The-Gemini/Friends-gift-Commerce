// src/pages/dashboard/seller/ManageProducts.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Eye,
  Menu,
  X,
  AlertCircle,
  Package,
  RefreshCw,
  Info,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { sellerProductService } from "../../../services/api/sellerProduct";
import { toast } from "react-toastify";
import Button from "../../../components/common/Button";
import { formatCurrency } from "../../../utils/currency";
import SellerProductStatusBadge from "../../../components/seller/SellerProductStatusBadge";

const ManageProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all"); // Changed default to show all products
  const [approvalStatusFilter, setApprovalStatusFilter] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [statusStats, setStatusStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  });

  useEffect(() => {
    fetchProducts();
    fetchProductStats();
  }, [filter, approvalStatusFilter]);

  const fetchProductStats = async () => {
    try {
      const response = await sellerProductService.getProductStatusStats();
      if (response.success) {
        setStatusStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching product stats:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      // Prepare query params
      const params = {};

      // Set the isActive filter based on the selected filter value
      if (filter !== "all") {
        params.status = filter === "active" ? "true" : "false";
      }

      // Set the approval status filter
      if (approvalStatusFilter !== "all") {
        params.approvalStatus = approvalStatusFilter;
      }

      console.log("Fetching products with params:", params);
      const response = await sellerProductService.getSellerProducts(params);

      if (response.success) {
        setProducts(response.data);
        console.log(
          `Loaded ${response.data.length} products with filter: ${filter}, approval: ${approvalStatusFilter}`
        );
      } else {
        throw new Error(response.message || "Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to load products. Please try again later.");
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  // Show delete confirmation modal
  const confirmDelete = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  // Cancel deletion
  const cancelDelete = () => {
    setProductToDelete(null);
    setShowDeleteModal(false);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;

    try {
      setDeleteLoading(true);
      const response = await sellerProductService.deleteProduct(
        productToDelete._id
      );

      if (response.success) {
        toast.success("Product deleted successfully");

        // Remove product from state
        setProducts(products.filter((p) => p._id !== productToDelete._id));

        // Refresh statistics
        fetchProductStats();
      } else {
        throw new Error(response.message || "Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error(error.message || "Failed to delete product");
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
      setProductToDelete(null);
    }
  };

  const handleResubmit = async (productId) => {
    try {
      const response = await sellerProductService.resubmitProduct(productId);
      if (response.success) {
        toast.success("Product resubmitted for approval");
        fetchProducts();
        fetchProductStats();
      } else {
        throw new Error(response.message || "Failed to resubmit product");
      }
    } catch (error) {
      console.error("Error resubmitting product:", error);
      toast.error(error.message || "Failed to resubmit product");
    }
  };

  // Filter products based on search term
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Products</h1>
        <Button
          onClick={() => navigate("/seller/products/add")}
          variant="primary"
          icon={<Plus className="w-5 h-5 mr-2" />}
        >
          Add New Product
        </Button>
      </div>

      {/* Product Approval Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-yellow-700">
                Pending Approval
              </p>
              <p className="text-xl font-bold text-yellow-600">
                {statusStats.pending}
              </p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-full">
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-green-700">Approved</p>
              <p className="text-xl font-bold text-green-600">
                {statusStats.approved}
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-full">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-red-700">Rejected</p>
              <p className="text-xl font-bold text-red-600">
                {statusStats.rejected}
              </p>
            </div>
            <div className="p-2 bg-red-100 rounded-full">
              <X className="h-4 w-4 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-blue-700">
                Total Products
              </p>
              <p className="text-xl font-bold text-blue-600">
                {statusStats.total}
              </p>
            </div>
            <div className="p-2 bg-blue-100 rounded-full">
              <Package className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Info banner about approval process */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-blue-800 flex items-center">
          <Info className="w-5 h-5 mr-2" />
          Product Approval Process
        </h3>
        <p className="mt-2 text-blue-700 text-sm">
          All products require admin approval before they become visible to
          customers. After submission, your products will be reviewed by our
          team. If approved, they will be listed on the marketplace. If
          rejected, you'll see the reason and can edit and resubmit.
        </p>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search products by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">All Products</option>
          <option value="active">Active Products</option>
          <option value="inactive">Inactive Products</option>
        </select>

        <select
          value={approvalStatusFilter}
          onChange={(e) => setApprovalStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending Approval</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-600">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="flex justify-center mb-4">
            <Package className="w-16 h-16 text-gray-300" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No products found
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm
              ? `No products match your search for "${searchTerm}"`
              : filter !== "all" || approvalStatusFilter !== "all"
              ? `No products match your current filters`
              : "You haven't added any products yet"}
          </p>
          <Button
            onClick={() => navigate("/seller/products/add")}
            variant="primary"
            icon={<Plus className="w-4 h-4 mr-2" />}
          >
            Add Your First Product
          </Button>
        </div>
      ) : (
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
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Approval Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img
                            src={
                              product.images?.[0]?.url ||
                              "/api/placeholder/100/100"
                            }
                            alt={product.name}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.category?.name || "Uncategorized"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <SellerProductStatusBadge
                        product={product}
                        showTooltip={true}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => navigate(`/products/${product._id}`)}
                          className="text-gray-600 hover:text-gray-900"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            navigate(`/seller/products/edit/${product._id}`)
                          }
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {product.approvalStatus === "rejected" && (
                          <button
                            onClick={() => handleResubmit(product._id)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Resubmit for approval"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => confirmDelete(product)}
                          className="text-gray-600 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-500 mb-6">
              Are you sure you want to delete "{productToDelete?.name}"? This
              action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;
