import React from "react";
import { X, Package, Truck, Calendar, DollarSign } from "lucide-react";
import { formatCurrency } from "../../utils/currency";

const OrderDetailsModal = ({ order, onClose, onStatusUpdate }) => {
  if (!order) return null;

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await onStatusUpdate(order._id, newStatus);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Order Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Event Information */}
        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium mb-2">Event Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Event</p>
              <p className="font-medium">{order.event?.title}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Type</p>
              <p className="font-medium capitalize">{order.event?.eventType}</p>
            </div>
          </div>
        </div>

        {/* Order Status */}
        <div className="mb-6">
          <h3 className="font-medium mb-2">Order Status</h3>
          <div className="flex gap-2">
            {["pending", "processing", "completed", "cancelled"].map(
              (status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className={`px-4 py-2 rounded-lg capitalize ${
                    order.status === status
                      ? statusColors[status]
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {status}
                </button>
              )
            )}
          </div>
        </div>

        {/* Products List */}
        <div className="mb-6">
          <h3 className="font-medium mb-4">Products</h3>
          <div className="space-y-4">
            {order.products.map((item, index) => (
              <div key={index} className="flex items-center border-b pb-4">
                <div className="h-16 w-16 flex-shrink-0">
                  <img
                    src={item.product.images?.[0]?.url || "/placeholder.jpg"}
                    alt={item.product.name}
                    className="h-full w-full object-cover rounded-lg"
                  />
                </div>
                <div className="ml-4 flex-1">
                  <h4 className="font-medium">{item.product.name}</h4>
                  <p className="text-sm text-gray-500">
                    Quantity: {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(item.price)}</p>
                  <p className="text-sm text-gray-500">
                    Total: {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Order Date: {new Date(order.createdAt).toLocaleDateString()}
            </div>
            <div>
              <span className="text-sm text-gray-600 mr-2">Total Amount:</span>
              <span className="font-bold text-lg">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
