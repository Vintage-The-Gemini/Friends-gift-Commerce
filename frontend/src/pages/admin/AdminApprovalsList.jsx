// frontend/src/pages/admin/AdminApprovalsList.jsx

import React, { useState, useEffect, useRef } from "react";
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
  ArrowUp,
  ArrowDown,
  Calendar,
  User,
  Tag,
  DollarSign,
  CheckCircle,
  XCircle,
  Sliders,
  MoreHorizontal,
  ExternalLink,
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
  const [totalProducts, setTotalProducts] = useState(0);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showMarginModal, setShowMarginModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [marginPercentage, setMarginPercentage] = useState(0);
  const [calculatedPrice, setCalculatedPrice] = useState(null);
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

  const [loadingSearch, setLoadingSearch] = useState(false);
  const searchTimeout = useRef(null);

  useEffect(() => {
    fetchPendingProducts();
    fetchCategories();
    fetchSellers();

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [page, categoryFilter, sellerFilter, sortField, sortDirection]);

  // Debounced search effect
  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    if (searchTerm) {
      setLoadingSearch(true);
      searchTimeout.current = setTimeout(() => {
        setPage(1); // Reset to first page when searching
        fetchPendingProducts();
      }, 500); // Debounce for 500ms
    }
    
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchTerm]);

  // Effect to calculate price when margin changes
  useEffect(() => {
    if (selectedProduct && marginPercentage) {
      setCalculatedPrice(
        calculatePriceWithMargin(selectedProduct.price, marginPercentage)
      );
    } else {
      setCalculatedPrice(null);
    }
  }, [marginPercentage, selectedProduct]);

  // Function to calculate price with margin
  const calculatePriceWithMargin = (basePrice, margin) => {
    const marginAmount = (basePrice * margin) / 100;
    return basePrice + marginAmount;
  };

  const fetchPendingProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query params
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", 10);
      params.append("sort", `${sortDirection === "desc" ? "-" : ""}${sortField}`);

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
        setTotalProducts(response.data.pagination.total);
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

  const handleApprove = async (productId) => {
    // Select the product and show margin modal
    const product = pendingProducts.find((p) => p._id === productId);
    if (product) {
      setSelectedProduct(product);
      setMarginPercentage(0); // Reset margin
      setShowMarginModal(true);
    }
  };

  const submitApprovalWithMargin = async () => {
    try {
      setActionLoading(true);

      const response = await api.put(
        `/admin/approvals/products/${selectedProduct._id}/approve`,
        {
          notes: "Product approved by admin",
          marginPercentage: marginPercentage,
        }
      );

      if (response.data.success) {
        toast.success("Product approved successfully");
        // Remove the approved product from the list
        setPendingProducts(
          pendingProducts.filter(
            (product) => product._id !== selectedProduct._id
          )
        );
        setShowMarginModal(false);
      } else {
        throw new Error(response.data.message || "Failed to approve product");
      }
    } catch (error) {
      console.error("Error approving product:", error);
      toast.error(error.message || "Failed to approve product");
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = (product) => {
    setSelectedProduct(product);
    setRejectionReason("");
    setShowRejectModal(true);
    setActiveDropdown(null);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      setActionLoading(true);

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
    } finally {
      setActionLoading(false);
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
    fetchPendingProducts();
  };

  const resetFilters = () => {
    setSearchTerm("");
    setCategoryFilter("");
    setSellerFilter("");
    setPage(1);
    fetchPendingProducts();
  };

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const toggleDropdown = (productId) => {
    setActiveDropdown(activeDropdown === productId ? null : productId);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Product Approvals</h1>
          <p className="text-gray-500 text-sm mt-1">
            Review and manage pending product submissions
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
            {(categoryFilter || sellerFilter) && (
              <span className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3 bg-blue-500 rounded-full w-2.5 h-2.5"></span>
            )}
          </button>

          <button
            onClick={fetchPendingProducts}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={() => {
                setShowFilters(false);
                fetchPendingProducts();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Active Filters */}
      {(categoryFilter || sellerFilter) && (
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
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Section */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-medium text-gray-700">Pending Approvals</h2>
          <span className="bg-yellow-100 text-yellow-800 text-xs px-2.5 py-1 rounded-full">
            {totalProducts} product{totalProducts !== 1 ? "s" : ""}
          </span>
        </div>
        
        <div className="h-1.5 w-full bg-gray-200 rounded-full">
          <div 
            className="h-1.5 bg-yellow-500 rounded-full"
            style={{ width: `${Math.min((pendingProducts.length / 10) * 100, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center">
                    <span>Product</span>
                    {sortField === "name" && (
                      <span className="ml-1">
                        {sortDirection === "asc" ? (
                          <ArrowUp className="w-3 h-3" />
                        ) : (
                          <ArrowDown className="w-3 h-3" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("price")}
                >
                  <div className="flex items-center">
                    <span>Price</span>
                    {sortField === "price" && (
                      <span className="ml-1">
                        {sortDirection === "asc" ? (
                          <ArrowUp className="w-3 h-3" />
                        ) : (
                          <ArrowDown className="w-3 h-3" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Seller
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 hidden lg:table-cell"
                  onClick={() => handleSort("createdAt")}
                >
                  <div className="flex items-center">
                    <span>Submitted</span>
                    {sortField === "createdAt" && (
                      <span className="ml-1">
                        {sortDirection === "asc" ? (
                          <ArrowUp className="w-3 h-3" />
                        ) : (
                          <ArrowDown className="w-3 h-3" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingProducts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                    <Package className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No pending products</h3>
                    <p className="text-sm">All products have been reviewed</p>
                  </td>
                </tr>
              ) : (
                pendingProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-md overflow-hidden bg-gray-100">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0].url}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Package className="h-10 w-10 p-2 text-gray-400" />
                          )}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 line-clamp-1">
                            {product.name}
                          </div>
                          <div className="hidden sm:flex items-center text-xs text-gray-500">
                            <Tag className="w-3 h-3 mr-1" />
                            {product.category?.name || "Uncategorized"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(product.price)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Stock: {product.stock}
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <div className="text-sm text-gray-900 line-clamp-1">
                        {product.seller?.businessName ||
                          product.seller?.name ||
                          "Unknown"}
                      </div>
                      <div className="text-xs text-gray-500 hidden lg:block">
                        {product.seller?.phoneNumber}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 hidden lg:table-cell">
                      <div className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                        {formatDate(product.createdAt)}
                      </div>
                      <div className="flex items-center text-xs mt-1">
                        <Clock className="w-3 h-3 mr-1 text-yellow-500" />
                        <span className="text-yellow-700">Pending Review</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-2">
                        <div className="relative inline-block" ref={dropdownRef}>
                          <button
                            onClick={() => toggleDropdown(product._id)}
                            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                          >
                            <MoreHorizontal className="h-5 w-5" />
                          </button>

                          {activeDropdown === product._id && (
                            <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10 divide-y divide-gray-100">
                              <div className="py-1">
                                <Link
                                  to={`/admin/product-review/${product._id}`}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <Eye className="w-4 h-4 mr-2 text-gray-400" />
                                  Detailed Review
                                </Link>
                                <Link
                                  to={`/products/${product._id}`}
                                  target="_blank"
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <ExternalLink className="w-4 h-4 mr-2 text-gray-400" />
                                  View on Site
                                </Link>
                              </div>
                              <div className="py-1">
                                <button
                                  onClick={() => handleApprove(product._id)}
                                  className="w-full text-left flex items-center px-4 py-2 text-sm text-green-600 hover:bg-gray-100"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => openRejectModal(product)}
                                  className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Reject
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        <Link
                          to={`/admin/product-review/${product._id}`}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50 hidden sm:flex"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>

                        <button
                          onClick={() => handleApprove(product._id)}
                          className="text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-50"
                          title="Approve"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        
                        <button
                          onClick={() => openRejectModal(product)}
                          className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50"
                          title="Reject"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{pendingProducts.length}</span>{" "}
                  of <span className="font-medium">{totalProducts}</span> products
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = page > 3 && totalPages > 5 ? page - 3 + i : i + 1;
                    if (pageNum <= totalPages) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pageNum === page
                              ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
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
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
            
            {/* Mobile pagination */}
            <div className="flex items-center justify-between w-full sm:hidden">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Margin Modal */}
      {showMarginModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 animate-fadeIn">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">Set Product Margin</h2>
              <button
                onClick={() => setShowMarginModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Product details */}
            <div className="mb-5 bg-gray-50 p-3 rounded-lg flex items-start">
              <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0 mr-3">
                {selectedProduct.images && selectedProduct.images.length > 0 ? (
                  <img
                    src={selectedProduct.images[0].url}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="w-full h-full p-4 text-gray-400" />
                )}
              </div>
              <div>
                <h3 className="font-medium line-clamp-1">{selectedProduct.name}</h3>
                <p className="text-gray-600 text-sm">Base Price: {formatCurrency(selectedProduct.price)}</p>
                {selectedProduct.seller && (
                  <p className="text-gray-500 text-xs mt-1">
                    {selectedProduct.seller.businessName || selectedProduct.seller.name}
                  </p>
                )}
              </div>
            </div>

            {/* Margin Input */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Margin Percentage (%)
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={marginPercentage}
                  onChange={(e) => setMarginPercentage(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="ml-2 text-gray-500">%</span>
              </div>
              
              {calculatedPrice !== null && (
                <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg">
                  <div className="flex items-center mb-1">
                    <DollarSign className="w-4 h-4 mr-1.5" />
                    <span className="font-medium">Pricing Summary</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-sm pl-1">
                    <span className="text-gray-600">Base Price:</span>
                    <span>{formatCurrency(selectedProduct.price)}</span>
                    <span className="text-gray-600">Margin ({marginPercentage}%):</span>
                    <span>{formatCurrency(calculatedPrice - selectedProduct.price)}</span>
                    <span className="text-gray-600 font-medium">Final Price:</span>
                    <span className="font-medium">{formatCurrency(calculatedPrice)}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowMarginModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submitApprovalWithMargin}
                disabled={actionLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
              >
                {actionLoading ? (
                  <>
                    <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                    Approving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve with Margin
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 animate-fadeIn">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">Reject Product</h2>
              <button
                onClick={() => setShowRejectModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Product preview */}
            <div className="mb-4 flex items-center">
              <div className="w-12 h-12 bg-gray-100 rounded-md flex-shrink-0 overflow-hidden mr-3">
                {selectedProduct.images && selectedProduct.images.length > 0 ? (
                  <img
                    src={selectedProduct.images[0].url}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="w-full h-full p-3 text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 text-sm line-clamp-1">
                  {selectedProduct.name}
                </h3>
                <p className="text-gray-500 text-xs">
                  {selectedProduct.seller?.businessName || selectedProduct.seller?.name}
                </p>
              </div>
            </div>
            
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting this product. This feedback will be shared with the seller.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rejection Reason <span className="text-red-500">*</span>
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
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim() || actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
              >
                {actionLoading ? (
                  <>
                    <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Product
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add CSS for animations */}
      <style>
        {`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
        .line-clamp-1 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
        }
        `}
      </style>
    </div>
  );
};

export default AdminApprovalsList;