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
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get("/orders");
      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
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
    const matchesSearch =
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.event?.title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filter === "all" || order.status === filter;

    return matchesSearch && matchesFilter;
  });

  const OrderModal = ({ order, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold">Order Details</h2>
            <p className="text-sm text-gray-500">#{order._id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        {/* Event Progress */}
        <div className="mb-6">
          <h3 className="font-medium mb-2">{order.event?.title}</h3>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${calculateEventProgress(order.event)}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>
              Raised: {formatCurrency(order.event?.currentAmount || 0)}
            </span>
            <span>
              Target: {formatCurrency(order.event?.targetAmount || 0)}
            </span>
          </div>
        </div>

        {/* Products List */}
        <div className="space-y-4">
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

        <div className="mt-6 flex justify-end">
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

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order Info
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Event Progress
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
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.event?.title}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${calculateEventProgress(order.event)}%`,
                      }}
                    />
                  </div>
                  <div className="text-xs text-gray-500">
                    {calculateEventProgress(order.event).toFixed(1)}% Funded
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(order.totalAmount)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {order.products?.length || 0} items
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
