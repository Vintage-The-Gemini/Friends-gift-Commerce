import React, { useState, useEffect } from "react";
import { Search, Filter, Eye, Package } from "lucide-react";
import { formatCurrency } from "../../../utils/currency";
import api from "../../../services/api/axios.config";
import { toast } from "react-toastify";

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  useEffect(() => {
    // Debug auth token
    const token = localStorage.getItem("token");
    console.log("Auth token available:", !!token);

    fetchOrders();
  }, [filter]); // Re-fetch when filter changes

  const fetchOrders = async () => {
    try {
      setLoading(true);

      // Correct endpoint path - don't include /api in the path as it's already in the base URL
      const endpoint =
        filter === "all" ? "/orders" : `/orders?status=${filter}`;

      console.log("Fetching orders from:", endpoint);
      const response = await api.get(endpoint);
      console.log("Orders response:", response.data); // Debug log

      // Validate response data structure
      if (!Array.isArray(response.data?.data)) {
        console.warn("Unexpected response data structure:", response.data);
      }

      if (response.data.success) {
        // Add event data to order items if it exists
        setOrders(response.data.data);
        console.log("Orders loaded successfully:", response.data.data.length);
      } else {
        throw new Error(response.data.message || "Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error(error.message || "Failed to load orders");
      setOrders([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const calculateEventProgress = (event) => {
    if (!event?.targetAmount) return 0;
    return Math.min((event.currentAmount / event.targetAmount) * 100, 100);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredOrders = orders.filter((order) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      order._id.toLowerCase().includes(searchLower) ||
      order.event?.title?.toLowerCase().includes(searchLower) ||
      order.buyer?.name?.toLowerCase().includes(searchLower)
    );
  });

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await api.put(`/orders/${orderId}`, {
        status: newStatus,
      });

      if (response.data.success) {
        toast.success("Order status updated successfully");
        fetchOrders(); // Refresh the orders list
      } else {
        throw new Error(
          response.data.message || "Failed to update order status"
        );
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error(error.message || "Failed to update order status");
    }
  };

  const OrderModal = ({ order, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold">Order Details</h2>
            <p className="text-sm text-gray-500">#{order._id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        {/* Order Status */}
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-2">Status</p>
          <select
            value={order.status}
            onChange={(e) => updateOrderStatus(order._id, e.target.value)}
            className="w-full p-2 border rounded-lg"
          >
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Event Information */}
        {order.event ? (
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Event Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Event</p>
                <p className="font-medium">{order.event?.title || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Type</p>
                <p className="font-medium capitalize">
                  {order.event?.eventType || "N/A"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Order Information</h3>
            <div>
              <p className="text-sm text-gray-600">Order Type</p>
              <p className="font-medium capitalize">
                {order.eventType || "Regular Order"}
              </p>
            </div>
          </div>
        )}

        {/* Buyer Information */}
        <div className="mb-6">
          <h3 className="font-medium mb-2">Buyer Information</h3>
          <p className="text-sm text-gray-600">Name: {order.buyer?.name}</p>
          {order.shippingAddress && (
            <div className="mt-2 text-sm text-gray-600">
              <p>Shipping Address:</p>
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
            </div>
          )}
        </div>

        {/* Products List */}
        <div className="space-y-4">
          <h3 className="font-medium mb-2">Products</h3>
          {order.products.map((item) => (
            <div
              key={item._id}
              className="flex items-center justify-between border-b pb-4"
            >
              <div className="flex items-center">
                <img
                  src={
                    item.product.images?.[0]?.url || "/placeholder-image.jpg"
                  }
                  alt={item.product.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="ml-4">
                  <p className="font-medium">{item.product.name}</p>
                  <p className="text-sm text-gray-500">
                    Quantity: {item.quantity}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">{formatCurrency(item.price)}</p>
                <p className="text-sm text-gray-500">
                  Total: {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Order Date: {formatDate(order.createdAt)}
          </div>
          <p className="font-bold text-lg">
            Total: {formatCurrency(order.totalAmount)}
          </p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border rounded-lg px-4 py-2"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Orders Found
          </h3>
          <p className="text-gray-500">
            {filter === "all"
              ? "You haven't received any orders yet."
              : `No ${filter} orders found.`}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Buyer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
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
              {filteredOrders.map((order) => (
                <tr key={order._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">
                        Order #{order._id.slice(-6)}
                        {order.event && (
                          <span className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                            Event Order
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.products?.length || 0} items
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {order.buyer?.name || "Unknown Buyer"}
                    </div>
                    {order.event && (
                      <div className="text-xs text-blue-600">
                        From: {order.event.title}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(order.totalAmount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        statusColors[order.status]
                      }`}
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

export default SellerOrders;
