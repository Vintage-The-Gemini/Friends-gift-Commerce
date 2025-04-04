// src/pages/dashboard/seller/SingleOrderPage.jsx

//single order
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ChevronLeft,
  Package,
  Truck,
  Check,
  X,
  Clock,
  MapPin,
  Phone,
  Calendar,
  Edit,
  Save,
  ArrowRight,
} from "lucide-react";
import { orderService } from "../../../services/api/order";
import { formatCurrency } from "../../../utils/currency";
import { toast } from "react-toastify";

const SingleOrderPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTracking, setEditingTracking] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState({
    trackingNumber: "",
    carrierName: "",
    estimatedDeliveryDate: "",
  });

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrderDetails(id);
      if (response.success) {
        setOrder(response.data);
        // Initialize tracking form with existing values
        if (response.data.trackingNumber || response.data.carrierName) {
          setTrackingInfo({
            trackingNumber: response.data.trackingNumber || "",
            carrierName: response.data.carrierName || "",
            estimatedDeliveryDate: response.data.estimatedDeliveryDate
              ? new Date(response.data.estimatedDeliveryDate)
                  .toISOString()
                  .split("T")[0]
              : "",
          });
        }
      } else {
        throw new Error(response.message || "Failed to fetch order details");
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      setError(error.message || "Failed to load order details");
      toast.error("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      const response = await orderService.updateOrderStatus(id, newStatus);
      if (response.success) {
        toast.success(`Order status updated to ${newStatus}`);
        fetchOrderDetails();
      }
    } catch (error) {
      toast.error(error.message || "Failed to update order status");
    }
  };

  const handleTrackingSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await orderService.addTracking(id, trackingInfo);
      if (response.success) {
        toast.success("Tracking information updated");
        setEditingTracking(false);
        fetchOrderDetails();
      }
    } catch (error) {
      toast.error(error.message || "Failed to update tracking information");
    }
  };

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const formatDate = (date) => {
    if (!date) return "Not set";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4">
          {error}
        </div>
        <Link
          to="/seller/orders"
          className="mt-4 inline-flex items-center text-blue-600"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Orders
        </Link>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          to="/seller/orders"
          className="inline-flex items-center text-blue-600 hover:text-blue-700"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Orders
        </Link>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Order Details</h1>
          <p className="text-gray-600">Order #{order._id.slice(-8)}</p>
        </div>
        <div className="flex space-x-2">
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
              onClick={() => handleStatusUpdate(status)}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Order Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="font-semibold text-lg mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2 text-blue-600" />
            Order Information
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Created On</p>
              <p className="font-medium">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p
                className={`inline-flex px-2 py-1 rounded-full text-sm ${
                  statusColors[order.status]
                }`}
              >
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Payment Status</p>
              <p
                className={`inline-flex px-2 py-1 rounded-full text-sm ${
                  order.paymentStatus === "completed"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {order.paymentStatus.charAt(0).toUpperCase() +
                  order.paymentStatus.slice(1)}
              </p>
            </div>
            {order.paymentDetails && (
              <div>
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className="font-medium capitalize">
                  {order.paymentDetails.method || "Not specified"}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="text-xl font-bold">
                {formatCurrency(order.totalAmount)}
              </p>
            </div>
          </div>
        </div>

        {/* Customer Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="font-semibold text-lg mb-4 flex items-center">
            <Phone className="w-5 h-5 mr-2 text-blue-600" />
            Customer Information
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">
                {order.buyer?.name || "Not available"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">
                {order.buyer?.phoneNumber ||
                  order.shippingDetails?.phone ||
                  "Not available"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Order Type</p>
              <p className="font-medium capitalize">
                {order.eventType
                  ? `${order.eventType} Event`
                  : "Standard Order"}
              </p>
            </div>
            {order.event && (
              <div>
                <p className="text-sm text-gray-500">Event</p>
                <Link
                  to={`/events/${order.event._id}`}
                  className="font-medium text-blue-600 hover:text-blue-800"
                >
                  {order.event.title}
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Shipping Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="font-semibold text-lg mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-blue-600" />
            Shipping Information
          </h2>
          {order.shippingDetails ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium">{order.shippingDetails.address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">City</p>
                <p className="font-medium">{order.shippingDetails.city}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Country</p>
                <p className="font-medium">
                  {order.shippingDetails.country || "Kenya"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{order.shippingDetails.phone}</p>
              </div>
              {order.shippingDetails.notes && (
                <div>
                  <p className="text-sm text-gray-500">Notes</p>
                  <p className="italic">{order.shippingDetails.notes}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">No shipping details available</p>
          )}
        </div>
      </div>

      {/* Tracking Information */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg flex items-center">
            <Truck className="w-5 h-5 mr-2 text-blue-600" />
            Tracking Information
          </h2>
          <button
            onClick={() => setEditingTracking(!editingTracking)}
            className="text-blue-600 hover:text-blue-800"
          >
            {editingTracking ? "Cancel" : "Edit"}
          </button>
        </div>

        {editingTracking ? (
          <form onSubmit={handleTrackingSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tracking Number
                </label>
                <input
                  type="text"
                  value={trackingInfo.trackingNumber}
                  onChange={(e) =>
                    setTrackingInfo({
                      ...trackingInfo,
                      trackingNumber: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., TRK123456789"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Carrier Name
                </label>
                <input
                  type="text"
                  value={trackingInfo.carrierName}
                  onChange={(e) =>
                    setTrackingInfo({
                      ...trackingInfo,
                      carrierName: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., DHL, FedEx"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Delivery Date
                </label>
                <input
                  type="date"
                  value={trackingInfo.estimatedDeliveryDate}
                  onChange={(e) =>
                    setTrackingInfo({
                      ...trackingInfo,
                      estimatedDeliveryDate: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Tracking Information
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-gray-50 p-4 rounded-lg">
            {order.trackingNumber ||
            order.carrierName ||
            order.estimatedDeliveryDate ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Tracking Number</p>
                  <p className="font-medium">
                    {order.trackingNumber || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Carrier</p>
                  <p className="font-medium">
                    {order.carrierName || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Est. Delivery Date</p>
                  <p className="font-medium">
                    {formatDate(order.estimatedDeliveryDate)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <Truck className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">
                  No tracking information added yet
                </p>
                <button
                  onClick={() => setEditingTracking(true)}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  + Add Tracking Information
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Order Timeline */}
      {order.timeline && order.timeline.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="font-semibold text-lg mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-600" />
            Order Timeline
          </h2>
          <div className="relative">
            {order.timeline.map((item, index) => (
              <div key={index} className="flex mb-6 last:mb-0">
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
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
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

      {/* Order Products */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="font-semibold text-lg mb-4">Order Products</h2>
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
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {order.products.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img
                          src={
                            item.product?.images?.[0]?.url ||
                            "/api/placeholder/100/100"
                          }
                          alt={item.product?.name}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {item.product?.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(item.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(item.price * item.quantity)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        statusColors[item.status] || statusColors.pending
                      }`}
                    >
                      {item.status.charAt(0).toUpperCase() +
                        item.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan="3" className="px-6 py-4 text-right font-medium">
                  Total Amount:
                </td>
                <td colSpan="2" className="px-6 py-4 text-lg font-bold">
                  {formatCurrency(order.totalAmount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SingleOrderPage;
