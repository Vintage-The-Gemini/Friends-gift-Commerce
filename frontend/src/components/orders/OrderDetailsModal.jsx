// src/components/orders/OrderDetailsModal.jsx
import React from "react";
import { X, Package, Truck, Calendar, DollarSign, Check } from "lucide-react";
import { formatCurrency } from "../../utils/currency";

const OrderDetailsModal = ({ order, onClose, onStatusUpdate }) => {
  if (!order) return null;

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">Order Details</h2>
            <p className="text-sm text-gray-500">
              Order #{order._id.slice(-8)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Order Timeline */}
        {order.timeline && order.timeline.length > 0 && (
          <div className="mb-6 border-b pb-6">
            <h3 className="font-medium mb-4">Order Timeline</h3>
            <div className="relative">
              {order.timeline.map((item, index) => (
                <div key={index} className="flex mb-4 last:mb-0">
                  <div className="mr-4 relative">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        statusColors[item.status] || "bg-gray-100"
                      }`}
                    >
                      {item.status === "delivered" ||
                      item.status === "completed" ? (
                        <Check className="w-5 h-5" />
                      ) : item.status === "cancelled" ? (
                        <X className="w-5 h-5" />
                      ) : item.status === "shipped" ? (
                        <Truck className="w-5 h-5" />
                      ) : (
                        <Package className="w-5 h-5" />
                      )}
                    </div>
                    {index < order.timeline.length - 1 && (
                      <div className="absolute top-10 bottom-0 left-5 border-l-2 border-dashed border-gray-200"></div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium">
                      {item.status.charAt(0).toUpperCase() +
                        item.status.slice(1)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(item.timestamp)}
                    </div>
                    <div className="text-sm">{item.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Event Information */}
        {order.event && (
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
                  {order.event?.eventType || order.eventType || "N/A"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Order Status */}
        <div className="mb-6">
          <h3 className="font-medium mb-2">Order Status</h3>
          <div className="flex flex-wrap gap-2">
            {[
              "pending",
              "processing",
              "shipped",
              "delivered",
              "completed",
              "cancelled",
            ].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                className={`px-4 py-2 rounded-lg capitalize ${
                  order.status === status
                    ? statusColors[status] + " font-medium"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Buyer Information */}
        <div className="mb-6 border-t pt-6">
          <h3 className="font-medium mb-2">Buyer Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium">{order.buyer?.name || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-medium">
                {order.buyer?.phoneNumber ||
                  order.shippingDetails?.phone ||
                  "N/A"}
              </p>
            </div>
          </div>

          {/* Shipping Details */}
          {order.shippingDetails && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-600 mb-1">
                Shipping Address
              </h4>
              <div className="bg-gray-50 p-3 rounded">
                <p>{order.shippingDetails.address}</p>
                <p>
                  {order.shippingDetails.city}
                  {order.shippingDetails.state &&
                    `, ${order.shippingDetails.state}`}
                  {order.shippingDetails.postalCode &&
                    ` ${order.shippingDetails.postalCode}`}
                </p>
                <p>{order.shippingDetails.country || "Kenya"}</p>
                {order.shippingDetails.notes && (
                  <p className="mt-2 text-sm text-gray-600 italic">
                    Notes: {order.shippingDetails.notes}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Products List */}
        <div className="mb-6 border-t pt-6">
          <h3 className="font-medium mb-4">Products</h3>
          <div className="space-y-4">
            {order.products.map((item, index) => (
              <div
                key={index}
                className="flex items-center border-b pb-4 last:border-b-0 last:pb-0"
              >
                <div className="h-16 w-16 flex-shrink-0">
                  <img
                    src={
                      item.product?.images?.[0]?.url ||
                      "/api/placeholder/100/100"
                    }
                    alt={item.product?.name || `Product ${index + 1}`}
                    className="h-full w-full object-cover rounded-lg"
                  />
                </div>
                <div className="ml-4 flex-1">
                  <h4 className="font-medium">
                    {item.product?.name || `Product ${index + 1}`}
                  </h4>
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
              Order Date: {formatDate(order.createdAt)}
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
