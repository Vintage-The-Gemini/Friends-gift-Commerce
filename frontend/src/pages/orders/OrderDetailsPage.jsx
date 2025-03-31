// src/pages/orders/OrderDetailsPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import {
  ChevronLeft,
  Calendar,
  Truck,
  Package,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  User,
  MapPin,
  Phone,
  FileText,
  DollarSign,
  CreditCard,
  ShoppingBag,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { formatCurrency } from "../../utils/currency";
import { toast } from "react-toastify";

const OrderDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fromCheckout = location.state?.fromCheckout || false;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);

      // Mock API call for demo purposes
      // In a real implementation, you would use an order service:
      // const response = await orderService.getOrderById(id);

      // Simulating API response
      setTimeout(() => {
        const mockOrder = {
          _id: id,
          status: "pending",
          orderProgress: "pending",
          createdAt: new Date().toISOString(),
          totalAmount: 25000,
          products: [
            {
              product: {
                _id: "product1",
                name: "Wireless Headphones",
                price: 5000,
                images: [{ url: "/api/placeholder/400/400" }],
              },
              quantity: 2,
              price: 5000,
              status: "pending",
            },
            {
              product: {
                _id: "product2",
                name: "Smart Watch",
                price: 15000,
                images: [{ url: "/api/placeholder/400/400" }],
              },
              quantity: 1,
              price: 15000,
              status: "pending",
            },
          ],
          shippingDetails: {
            name: "John Doe",
            address: "123 Main St",
            city: "Nairobi",
            state: "Nairobi",
            postalCode: "00100",
            country: "Kenya",
            phone: "+254712345678",
          },
          event: {
            _id: "event1",
            title: "Birthday Celebration",
          },
          timeline: [
            {
              status: "pending",
              description: "Order created from event checkout",
              timestamp: new Date().toISOString(),
            },
          ],
          paymentStatus: "completed",
          paymentDetails: {
            method: "mpesa",
            transactionId: "EVENT-12345",
            paidAmount: 25000,
            paidAt: new Date().toISOString(),
            currency: "KES",
          },
          estimatedDeliveryDate: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
          seller: {
            _id: "seller1",
            name: "Tech Store",
            businessName: "Tech Gadgets Ltd",
          },
          buyer: {
            _id: "user1",
            name: "John Doe",
          },
        };

        setOrder(mockOrder);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching order:", error);
      setError("Failed to load order details");
      toast.error("Failed to load order details");
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#5551FF]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-red-50 p-6 rounded-lg text-red-700">
          <AlertCircle className="w-10 h-10 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-center mb-2">
            Error Loading Order
          </h2>
          <p className="text-center">{error}</p>
          <div className="flex justify-center mt-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          to="/orders"
          className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Orders
        </Link>

        {fromCheckout && (
          <div className="mb-6 bg-green-50 p-4 rounded-lg text-green-800 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            <div>
              <p className="font-medium">Order created successfully!</p>
              <p className="text-sm">
                Your event has been completed and your order has been placed
                with the seller.
              </p>
            </div>
          </div>
        )}

        {/* Order Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-xl font-bold">
                Order #{order._id.substring(order._id.length - 8)}
              </h1>
              <p className="text-gray-600">
                Placed on {formatDate(order.createdAt)} at{" "}
                {formatTime(order.createdAt)}
              </p>
              {order.event && (
                <Link
                  to={`/events/${order.event._id}`}
                  className="text-[#5551FF] hover:underline flex items-center mt-1"
                >
                  <Calendar className="w-4 h-4 mr-1" />
                  {order.event.title}
                </Link>
              )}
            </div>
            <div>{getStatusBadge(order.status)}</div>
          </div>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Shipping Information */}
          <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Truck className="w-5 h-5 mr-2 text-[#5551FF]" />
              Shipping Information
            </h2>

            <div className="space-y-4">
              <div className="border-b pb-4">
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 mr-2 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium">{order.shippingDetails.name}</p>
                    <p className="text-gray-600">
                      {order.shippingDetails.address}
                    </p>
                    <p className="text-gray-600">
                      {order.shippingDetails.city},{" "}
                      {order.shippingDetails.state}{" "}
                      {order.shippingDetails.postalCode}
                    </p>
                    <p className="text-gray-600">
                      {order.shippingDetails.country}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <Phone className="w-5 h-5 mr-2 text-gray-400" />
                <div>
                  <p className="font-medium">Contact Phone</p>
                  <p className="text-gray-600">{order.shippingDetails.phone}</p>
                </div>
              </div>

              {order.shippingDetails.notes && (
                <div className="pt-4 border-t">
                  <p className="font-medium">Delivery Notes</p>
                  <p className="text-gray-600">{order.shippingDetails.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-[#5551FF]" />
              Order Summary
            </h2>

            <div className="space-y-4">
              <div className="border-b pb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Total</span>
                  <span className="font-bold">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Status</span>
                  <span
                    className={`font-medium ${
                      order.paymentStatus === "completed"
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {order.paymentStatus.charAt(0).toUpperCase() +
                      order.paymentStatus.slice(1)}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-start mb-2">
                  {order.paymentDetails?.method === "mpesa" ? (
                    <Phone className="w-5 h-5 mr-2 text-green-500 mt-0.5" />
                  ) : (
                    <CreditCard className="w-5 h-5 mr-2 text-blue-500 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium">
                      {order.paymentDetails?.method === "mpesa"
                        ? "M-PESA"
                        : "Card Payment"}
                    </p>
                    {order.paymentDetails?.transactionId && (
                      <p className="text-xs text-gray-500">
                        ID: {order.paymentDetails.transactionId}
                      </p>
                    )}
                  </div>
                </div>

                {order.seller && (
                  <div className="flex items-start mt-4 pt-4 border-t">
                    <ShoppingBag className="w-5 h-5 mr-2 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Seller</p>
                      <p className="text-gray-600">
                        {order.seller.businessName || order.seller.name}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Estimated Delivery</span>
                  <span className="font-medium">
                    {formatDate(order.estimatedDeliveryDate)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products List */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2 text-[#5551FF]" />
            Products
          </h2>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Product
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Price
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Quantity
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Total
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
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
                            className="h-10 w-10 rounded object-cover"
                            src={
                              item.product.images?.[0]?.url ||
                              "/api/placeholder/200/200"
                            }
                            alt={item.product.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {item.product.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {formatCurrency(item.price * item.quantity)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {getStatusBadge(item.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Timeline */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-[#5551FF]" />
            Order Timeline
          </h2>

          <div className="space-y-6">
            {order.timeline.map((event, index) => (
              <div key={index} className="relative">
                {/* Timeline connector */}
                {index < order.timeline.length - 1 && (
                  <div className="absolute top-6 left-3 bottom-0 w-0.5 bg-gray-200"></div>
                )}

                <div className="flex items-start">
                  <div
                    className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center 
                    ${
                      index === 0
                        ? "bg-[#5551FF] text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                  </div>
                  <div className="ml-4">
                    <div className="font-medium">
                      {event.status.charAt(0).toUpperCase() +
                        event.status.slice(1)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(event.timestamp)}{" "}
                      {formatTime(event.timestamp)}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {event.description}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
