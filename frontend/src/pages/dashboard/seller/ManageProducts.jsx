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
} from "lucide-react";
import { sellerProductService } from "../../../services/api/sellerProduct";
import { toast } from "react-toastify";
import Button from "../../../components/common/Button";
import { formatCurrency } from "../../../utils/currency";

const ManageProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [showConfirmDelete, setShowConfirmDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [filter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      // Prepare query params
      const params = {};
      if (filter !== "all") {
        params.status = filter === "active" ? "true" : "false";
      }

      const response = await sellerProductService.getSellerProducts(params);

      if (response.success) {
        setProducts(response.data);
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

  const handleDelete = async (productId) => {
    // First click just shows confirmation
    if (showConfirmDelete !== productId) {
      setShowConfirmDelete(productId);
      return;
    }

    // Second click performs the delete
    try {
      setDeleteLoading(true);

      console.log("Attempting to delete product:", productId); // Debug log

      const response = await sellerProductService.deleteProduct(productId);

      if (response.success) {
        toast.success("Product deleted successfully");
        // Remove product from state to avoid refetching
        setProducts(products.filter((p) => p._id !== productId));
      } else {
        throw new Error(response.message || "Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error(error.message || "Failed to delete product");
    } finally {
      setDeleteLoading(false);
      setShowConfirmDelete(null);
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
              : filter !== "all"
              ? `You don't have any ${filter} products`
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
                        <button
                          onClick={() => handleDelete(product._id)}
                          className={`${
                            showConfirmDelete === product._id
                              ? "text-red-600 hover:text-red-900"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                          disabled={deleteLoading}
                          title={
                            showConfirmDelete === product._id
                              ? "Confirm Delete"
                              : "Delete"
                          }
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
    </div>
  );
};

export default ManageProducts;
