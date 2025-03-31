// src/pages/orders/OrdersListPage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  Filter,
  Search,
  Calendar,
  Clock,
  Package,
  CheckCircle,
  Truck,
  AlertCircle,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { formatCurrency } from "../../utils/currency";
import { toast } from "react-toastify";
import { orderService } from "../../services/api/order";

const OrdersListPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      const response = await orderService.getOrders(params);

      if (response.success) {
        setOrders(response.data);
      } else {
        throw new Error(response.message || "Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to load orders. Please try again.");
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const refreshOrders = async () => {
    try {
      setRefreshing(true);
      await fetchOrders();
      toast.success("Orders refreshed successfully");
    } catch (error) {
      // Error is already handled in fetchOrders
    } finally {
      setRefreshing(false);
    }
  };

  const getFilteredOrders = () => {
    if (!searchTerm.trim()) return orders;

    return orders.filter((order) => {
      const orderId = order._id.toLowerCase();
      const sellerName = order.seller?.businessName?.toLowerCase() || "";
      const eventTitle = order.event?.title?.toLowerCase() || "";
      const term = searchTerm.toLowerCase();

      return (
        orderId.includes(term) ||
        sellerName.includes(term) ||
        eventTitle.includes(term) ||
        order.products.some((item) =>
          item.product.name.toLowerCase().includes(term)
        )
      );
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case "processing":
        return (
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
            <Package className="w-3 h-3 mr-1" />
            Processing
          </span>
        );
      case "shipped":
        return (
          <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
            <Truck className="w-3 h-3 mr-1" />
            Shipped
          </span>
        );
      case "delivered":
        return (
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
            <CheckCircle className="w-3 h-3 mr-1" />
            Delivered
          </span>
        );
      case "cancelled":
        return (
          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
            <AlertCircle className="w-3 h-3 mr-1" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
            {status}
          </span>
        );
    }
  };

  const filteredOrders = getFilteredOrders();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold flex items-center">
            <ShoppingBag className="w-6 h-6 mr-2 text-[#5551FF]" />
            My Orders
          </h1>
          <button
            onClick={refreshOrders}
            disabled={refreshing}
            className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#5551FF]"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5551FF]"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {/* Orders List */}
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#5551FF]"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-medium text-gray-900 mb-2">
              No Orders Found
            </h2>
            <p className="text-gray-500 mb-6">
              {orders.length === 0
                ? "You haven't placed any orders yet."
                : "No orders match your search criteria."}
            </p>
            {searchTerm || statusFilter !== "all" ? (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
                className="text-[#5551FF] hover:text-[#4440FF] font-medium"
              >
                Clear Filters
              </button>
            ) : (
              <Link
                to="/events"
                className="text-[#5551FF] hover:text-[#4440FF] font-medium"
              >
                Browse Events
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                <div className="p-6 border-b border-gray-100">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">
                          Order #{order._id.substring(order._id.length - 8)}
                        </h3>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Placed on {formatDate(order.createdAt)}
                      </p>
                      {order.event && (
                        <Link
                          to={`/events/${order.event._id}`}
                          className="text-[#5551FF] hover:underline text-sm flex items-center mt-1"
                        >
                          <Calendar className="w-3 h-3 mr-1" />
                          {order.event.title}
                        </Link>
                      )}
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-bold">
                        {formatCurrency(order.totalAmount)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {order.products.length}{" "}
                        {order.products.length === 1 ? "product" : "products"}
                      </span>
                      {order.estimatedDeliveryDate && (
                        <span className="text-sm text-gray-600 flex items-center mt-1">
                          <Truck className="w-3 h-3 mr-1" />
                          Est. delivery:{" "}
                          {formatDate(order.estimatedDeliveryDate)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50">
                  <div className="flex flex-wrap gap-4">
                    {order.products.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-12 h-12 rounded overflow-hidden">
                          <img
                            src={
                              item.product.images?.[0]?.url ||
                              "/api/placeholder/100/100"
                            }
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                    {order.products.length > 3 && (
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            +{order.products.length - 3}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 flex items-center justify-between border-t border-gray-100">
                  <div className="text-sm">
                    <span className="text-gray-600">Seller: </span>
                    <span className="font-medium">
                      {order.seller?.businessName || "Unknown Seller"}
                    </span>
                  </div>
                  <Link
                    to={`/orders/${order._id}`}
                    className="flex items-center text-[#5551FF] hover:text-[#4440FF]"
                  >
                    View Details <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersListPage;
