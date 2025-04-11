// frontend/src/pages/admin/AdminOrderDetail.jsx
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ShoppingBag,
  Calendar,
  Package,
  Truck,
  MapPin,
  User,
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertCircle,
  Edit,
  CheckSquare,
  Calendar as CalendarIcon,
  Printer
} from "lucide-react";
import api from "../../services/api/axios.config";
import { toast } from "react-toastify";
import { formatCurrency } from "../../utils/currency";

const AdminOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateData, setUpdateData] = useState({
    status: "",
    trackingNumber: "",
    carrierName: "",
    estimatedDeliveryDate: "",
    notes: ""
  });

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/admin/orders/${id}`);

      if (response.data.success) {
        const orderData = response.data.data;
        setOrder(orderData);
        // Initialize update form with current values
        setUpdateData({
          status: orderData.status || "",
          trackingNumber: orderData.trackingNumber || "",
          carrierName: orderData.carrierName || "",
          estimatedDeliveryDate: orderData.estimatedDeliveryDate 
            ? new Date(orderData.estimatedDeliveryDate).toISOString().split('T')[0]
            : "",
          notes: ""
        });
      } else {
        throw new Error(response.data.message || "Failed to fetch order details");
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      setError("Failed to load order details. Please try again.");
      toast.error("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrder = async () => {
    try {
      setUpdateLoading(true);

      const response = await api.put(`/admin/orders/${id}`, updateData);

      if (response.data.success) {
        toast.success("Order updated successfully");
        setShowUpdateModal(false);
        fetchOrderDetails(); // Refresh order data
      } else {
        throw new Error(response.data.message || "Failed to update order");
      }
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error(error.message || "Failed to update order");
    } finally {
      setUpdateLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" /> Pending
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <RefreshCw className="w-3 h-3 mr-1" /> Processing
          </span>
        );
      case "shipped":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <Truck className="w-3 h-3 mr-1" /> Shipped
          </span>
        );
      case "delivered":
      case "completed":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" /> {status === "delivered" ? "Delivered" : "Completed"}
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status || "Unknown"}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>

        <div className="mt-4">
          <Link
            to="/admin/orders"
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>Order not found.</span>
        </div>

        <div className="mt-4">
          <Link
            to="/admin/orders"
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center">
          <Link
            to="/admin/orders"
            className="text-gray-500 hover:text-gray-700 mr-4"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">
              Order #{order._id.substr(-8)}
            </h1>
            <div className="flex items-center mt-1">
              <Calendar className="w-4 h-4 text-gray-400 mr-1" />
              <span className="text-gray-500 text-sm">
                {formatDate(order.createdAt)} at {formatTime(order.createdAt)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => window.print()}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print Order
          </button>
          
          <button
            onClick={() => setShowUpdateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Edit className="w-4 h-4 mr-2" />
            Update Order
          </button>
        </div>
      </div>

      {/* Order Status */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium">Order Status</h2>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Current Status</p>
              <div>{getStatusBadge(order.status)}</div>
            </div>
            {order.paymentStatus && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Payment Status</p>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                  order.paymentStatus === "completed" 
                    ? "bg-green-100 text-green-800" 
                    : order.paymentStatus === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}>
                  {order.paymentStatus === "completed" ? (
                    <CheckCircle className="w-3 h-3 mr-1" />
                  ) : order.paymentStatus === "pending" ? (
                    <Clock className="w-3 h-3 mr-1" />
                  ) : (
                    <XCircle className="w-3 h-3 mr-1" />
                  )}
                  {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                </span>
              </div>
            )}
            {order.trackingNumber && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Tracking Number</p>
                <p className="font-medium">{order.trackingNumber}</p>
              </div>
            )}
            {order.carrierName && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Carrier</p>
                <p className="font-medium">{order.carrierName}</p>
              </div>
            )}
          </div>

          {/* Timeline */}
          {order.timeline && order.timeline.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Order Timeline</h3>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-3.5 top-0 h-full w-0.5 bg-gray-200"></div>
                
                {/* Timeline events */}
                <div className="space-y-6 relative">
                  {order.timeline.map((event, index) => (
                    <div key={index} className="flex items-start">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        index === 0 ? "bg-blue-500" : "bg-gray-300"
                      }`}>
                        {index === 0 ? (
                          <CheckCircle className="w-4 h-4 text-white" />
                        ) : (
                          <Clock className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div className="ml-4">
                        <p className="font-medium">{event.status.charAt(0).toUpperCase() + event.status.slice(1)}</p>
                        <p className="text-sm text-gray-500">{event.description}</p>
                        <p className="text-xs text-gray-400">
                          {formatDate(event.timestamp)} at {formatTime(event.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Customer Info */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium">Customer</h2>
          </div>
          <div className="p-4">
            {order.buyer ? (
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium">{order.buyer.name}</p>
                    {order.buyer.email && (
                      <p className="text-sm text-gray-500">{order.buyer.email}</p>
                    )}
                  </div>
                </div>
                
                {order.buyer.phoneNumber && (
                  <div className="flex items-center mt-2">
                    <Phone className="w-4 h-4 text-gray-400 mr-2" />
                    <span>{order.buyer.phoneNumber}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Customer information not available</p>
            )}
          </div>
        </div>

        {/* Shipping Info */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium">Shipping Details</h2>
          </div>
          <div className="p-4">
            {order.shippingDetails ? (
              <div>
                <div className="flex items-start mb-3">
                  <MapPin className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium">Delivery Address</p>
                    <p className="text-gray-600">
                      {order.shippingDetails.address}, {order.shippingDetails.city}
                      {order.shippingDetails.state && `, ${order.shippingDetails.state}`}
                      {order.shippingDetails.postalCode && ` ${order.shippingDetails.postalCode}`}
                      {order.shippingDetails.country && `, ${order.shippingDetails.country}`}
                    </p>
                  </div>
                </div>
                
                {order.shippingDetails.phone && (
                  <div className="flex items-center mt-2">
                    <Phone className="w-4 h-4 text-gray-400 mr-2" />
                    <span>{order.shippingDetails.phone}</span>
                  </div>
                )}
                
                {order.shippingDetails.notes && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm font-medium">Delivery Notes</p>
                    <p className="text-sm text-gray-600">{order.shippingDetails.notes}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Shipping details not available</p>
            )}
          </div>
        </div>

        {/* Seller Info */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium">Seller</h2>
          </div>
          <div className="p-4">
            {order.seller ? (
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <Store className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium">
                      {order.seller.businessName || order.seller.name}
                    </p>
                    {order.seller.email && (
                      <p className="text-sm text-gray-500">{order.seller.email}</p>
                    )}
                  </div>
                </div>
                
                {order.seller.phoneNumber && (
                  <div className="flex items-center mt-2">
                    <Phone className="w-4 h-4 text-gray-400 mr-2" />
                    <span>{order.seller.phoneNumber}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Seller information not available</p>
            )}
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium">Order Items</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {order.products && order.products.length > 0 ? (
                order.products.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-md overflow-hidden bg-gray-100">
                          {item.product?.images && item.product.images.length > 0 ? (
                            <img
                              src={item.product.images[0].url}
                              alt={item.product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Package className="h-10 w-10 p-2 text-gray-400" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {item.product?.name || "Unknown Product"}
                          </div>
                          {item.product?.description && (
                            <div className="text-xs text-gray-500 line-clamp-1">
                              {item.product.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {getStatusBadge(item.status || order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {formatCurrency(item.price * item.quantity)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No products in this order
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan="4" className="px-6 py-3 text-right text-sm font-medium">
                  Total
                </td>
                <td className="px-6 py-3 text-right text-sm font-bold">
                  {formatCurrency(order.totalAmount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Update Order Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Update Order</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order Status
                </label>
                <select
                  value={updateData.status}
                  onChange={(e) => 
                    setUpdateData({...updateData, status: e.target.value})
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Select Status</option>
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
                  Tracking Number
                </label>
                <input
                  type="text"
                  value={updateData.trackingNumber}
                  onChange={(e) => 
                    setUpdateData({...updateData, trackingNumber: e.target.value})
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  rows="3"
                  placeholder="Add notes about this update"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowUpdateModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateOrder}
                disabled={updateLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {updateLoading ? (
                  <>
                    <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckSquare className="h-4 w-4 mr-2" />
                    Update Order
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add CSS for printing */}
      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-section, .print-section * {
            visibility: visible;
          }
          .print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
        
        .line-clamp-1 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
        }
      `}</style>
    </div>
  );
};

export default AdminOrderDetail;