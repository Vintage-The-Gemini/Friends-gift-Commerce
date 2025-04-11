// frontend/src/pages/admin/AdminOrders.jsx
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  RefreshCw,
  AlertCircle,
  ShoppingBag,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Sliders,
  User,
  Package,
  X,
  Eye,
  Download,
  Filter,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  DollarSign,
} from "lucide-react";
import api from "../../services/api/axios.config";
import { toast } from "react-toastify";
import { formatCurrency } from "../../utils/currency";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRangeFilter, setDateRangeFilter] = useState({
    startDate: "",
    endDate: "",
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [loadingSearch, setLoadingSearch] = useState(false);
  const searchTimeout = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchOrders();

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
  }, [page, statusFilter, sortField, sortDirection]);

  // Debounced search effect
  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    if (searchTerm) {
      setLoadingSearch(true);
      searchTimeout.current = setTimeout(() => {
        setPage(1); // Reset to first page when searching
        fetchOrders();
      }, 500); // Debounce for 500ms
    }
    
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchTerm]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query params
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", 10);
      params.append("sort", `${sortDirection === "desc" ? "-" : ""}${sortField}`);

      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      if (dateRangeFilter.startDate) {
        params.append("startDate", dateRangeFilter.startDate);
      }

      if (dateRangeFilter.endDate) {
        params.append("endDate", dateRangeFilter.endDate);
      }

      const response = await api.get(`/admin/orders?${params.toString()}`);

      if (response.data.success) {
        setOrders(response.data.data);
        setTotalPages(response.data.pagination.pages || 1);
        setTotalOrders(response.data.pagination.total || 0);
      } else {
        throw new Error(response.data.message || "Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to load orders. Please try again.");
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
      setLoadingSearch(false);
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
    fetchOrders();
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDateRangeFilter({ startDate: "", endDate: "" });
    setPage(1);
    fetchOrders();
  };

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const toggleDropdown = (orderId) => {
    setActiveDropdown(activeDropdown === orderId ? null : orderId);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get color and icon for order status
  const getStatusDetails = (status) => {
    switch (status) {
      case "pending":
        return {
          icon: <Clock className="w-3 h-3 mr-1" />,
          bgColor: "bg-yellow-100",
          textColor: "text-yellow-800",
          label: "Pending"
        };
      case "processing":
        return {
          icon: <RefreshCw className="w-3 h-3 mr-1" />,
          bgColor: "bg-blue-100",
          textColor: "text-blue-800",
          label: "Processing"
        };
      case "shipped":
        return {
          icon: <Package className="w-3 h-3 mr-1" />,
          bgColor: "bg-purple-100",
          textColor: "text-purple-800",
          label: "Shipped"
        };
      case "delivered":
      case "completed":
        return {
          icon: <CheckCircle className="w-3 h-3 mr-1" />,
          bgColor: "bg-green-100",
          textColor: "text-green-800",
          label: status === "delivered" ? "Delivered" : "Completed"
        };
      case "cancelled":
        return {
          icon: <XCircle className="w-3 h-3 mr-1" />,
          bgColor: "bg-red-100",
          textColor: "text-red-800",
          label: "Cancelled"
        };
      default:
        return {
          icon: <Clock className="w-3 h-3 mr-1" />,
          bgColor: "bg-gray-100",
          textColor: "text-gray-800",
          label: status || "Unknown"
        };
    }
  };

  // Render loading spinner
  if (loading && orders.length === 0) {
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
          <h1 className="text-xl md:text-2xl font-bold">Orders Management</h1>
          <p className="text-gray-500 text-sm mt-1">
            View and manage all customer orders
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-grow md:flex-grow-0">
            <form onSubmit={handleSearch} className="w-full md:w-auto">
              <input
                type="text"
                placeholder="Search orders..."
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
            {(statusFilter !== "all" || dateRangeFilter.startDate || dateRangeFilter.endDate) && (
              <span className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3 bg-blue-500 rounded-full w-2.5 h-2.5"></span>
            )}
          </button>

          <button
            onClick={fetchOrders}
            className="p-2 border rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>

          <button
            onClick={() => toast.info("Export functionality would go here")}
            className="p-2 border rounded-lg hover:bg-gray-50"
            title="Export Orders"
          >
            <Download className="w-5 h-5 text-gray-600" />
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={dateRangeFilter.startDate}
                onChange={(e) => 
                  setDateRangeFilter({...dateRangeFilter, startDate: e.target.value})
                }
                className="px-4 py-2 border rounded-lg text-gray-700 w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={dateRangeFilter.endDate}
                onChange={(e) => 
                  setDateRangeFilter({...dateRangeFilter, endDate: e.target.value})
                }
                className="px-4 py-2 border rounded-lg text-gray-700 w-full"
              />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={() => {
                setShowFilters(false);
                fetchOrders();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Active Filters */}
      {(statusFilter !== "all" || dateRangeFilter.startDate || dateRangeFilter.endDate) && (
        <div className="mb-4 flex flex-wrap gap-2">
          {statusFilter !== "all" && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 text-xs px-3 py-1 rounded-full flex items-center">
              <Filter className="w-3 h-3 mr-1.5" />
              <span className="mr-1">Status:</span>
              <span className="font-medium mr-2">
                {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
              </span>
              <button
                onClick={() => setStatusFilter("all")}
                className="text-blue-500 hover:text-blue-700"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {dateRangeFilter.startDate && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-xs px-3 py-1 rounded-full flex items-center">
              <Calendar className="w-3 h-3 mr-1.5" />
              <span className="mr-1">From:</span>
              <span className="font-medium mr-2">
                {new Date(dateRangeFilter.startDate).toLocaleDateString()}
              </span>
              <button
                onClick={() => setDateRangeFilter({...dateRangeFilter, startDate: ""})}
                className="text-green-500 hover:text-green-700"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {dateRangeFilter.endDate && (
            <div className="bg-purple-50 border border-purple-200 text-purple-700 text-xs px-3 py-1 rounded-full flex items-center">
              <Calendar className="w-3 h-3 mr-1.5" />
              <span className="mr-1">To:</span>
              <span className="font-medium mr-2">
                {new Date(dateRangeFilter.endDate).toLocaleDateString()}
              </span>
              <button
                onClick={() => setDateRangeFilter({...dateRangeFilter, endDate: ""})}
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

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("_id")}
                >
                  <div className="flex items-center">
                    <span>Order ID</span>
                    {sortField === "_id" && (
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("totalAmount")}
                >
                  <div className="flex items-center">
                    <span>Amount</span>
                    {sortField === "totalAmount" && (
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
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("createdAt")}
                >
                  <div className="flex items-center">
                    <span>Date</span>
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
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <ShoppingBag className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No orders found</h3>
                    <p className="text-sm mb-4">Try adjusting your search filters</p>
                    {(statusFilter !== "all" || dateRangeFilter.startDate || dateRangeFilter.endDate) && (
                      <button
                        onClick={resetFilters}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reset all filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const statusDetails = getStatusDetails(order.status);
                  return (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <ShoppingBag className="h-5 w-5 text-gray-500 mr-2" />
                          <span className="text-sm font-medium">
                            #{order._id.substr(-8)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.buyer?.name || "Unknown"}
                        </div>
                        {order.buyer?.phoneNumber && (
                          <div className="text-xs text-gray-500">
                            {order.buyer.phoneNumber}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex items-center text-xs font-medium rounded-full ${statusDetails.bgColor} ${statusDetails.textColor}`}>
                          {statusDetails.icon} {statusDetails.label}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(order.totalAmount)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.products?.length || 0} item(s)
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap hidden lg:table-cell">
                        <div className="text-sm text-gray-900">
                          {formatDate(order.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/admin/orders/${order._id}`}
                            className="text-blue-600 hover:text-blue-800 p-1"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>
                          
                          <div className="relative inline-block" ref={dropdownRef}>
                            <button
                              onClick={() => toggleDropdown(order._id)}
                              className="text-gray-400 hover:text-gray-600 p-1"
                            >
                              <MoreHorizontal className="h-5 w-5" />
                            </button>
                            
                            {activeDropdown === order._id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                                <div className="py-1">
                                  <Link
                                    to={`/admin/orders/${order._id}`}
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    <Eye className="w-4 h-4 mr-2 text-gray-400" />
                                    View Details
                                  </Link>
                                  
                                  {order.status === "pending" && (
                                    <button
                                      onClick={() => {
                                        toast.info(`Update status to Processing for order #${order._id.substr(-8)}`);
                                        toggleDropdown(null);
                                      }}
                                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                    >
                                      <RefreshCw className="w-4 h-4 mr-2 text-blue-500" />
                                      Mark as Processing
                                    </button>
                                  )}
                                  
                                  {order.status === "processing" && (
                                    <button
                                      onClick={() => {
                                        toast.info(`Update status to Shipped for order #${order._id.substr(-8)}`);
                                        toggleDropdown(null);
                                      }}
                                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                    >
                                      <Package className="w-4 h-4 mr-2 text-purple-500" />
                                      Mark as Shipped
                                    </button>
                                  )}
                                  
                                  {order.status === "shipped" && (
                                    <button
                                      onClick={() => {
                                        toast.info(`Update status to Delivered for order #${order._id.substr(-8)}`);
                                        toggleDropdown(null);
                                      }}
                                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                    >
                                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                                      Mark as Delivered
                                    </button>
                                  )}
                                  
                                  {["pending", "processing"].includes(order.status) && (
                                    <button
                                      onClick={() => {
                                        toast.info(`Update status to Cancelled for order #${order._id.substr(-8)}`);
                                        toggleDropdown(null);
                                      }}
                                      className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                                    >
                                      <XCircle className="w-4 h-4 mr-2" />
                                      Cancel Order
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
                  Showing <span className="font-medium">{orders.length}</span>{" "}
                  of <span className="font-medium">{totalOrders}</span> orders
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

      {/* Order Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-semibold">{totalOrders}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <ShoppingBag className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-semibold">
                {orders.filter(order => order.status === 'pending').length}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Processing</p>
              <p className="text-2xl font-semibold">
                {orders.filter(order => order.status === 'processing').length}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <RefreshCw className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-semibold">
                {orders.filter(order => ['delivered', 'completed'].includes(order.status)).length}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

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
        `}
      </style>
    </div>
  );
};

export default AdminOrders;