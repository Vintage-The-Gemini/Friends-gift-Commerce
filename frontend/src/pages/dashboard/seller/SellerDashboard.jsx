// src/pages/dashboard/seller/SellerDashboard.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  Users,
  DollarSign,
  TrendingUp,
  Package,
  ArrowUpRight,
  Calendar,
  PlusCircle,
  Eye,
} from "lucide-react";
import { analyticsService } from "../../../services/api/analytics";
import { orderService } from "../../../services/api/order";
import { eventService } from "../../../services/api/event";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "../../../utils/currency";
import { toast } from "react-toastify";

const SellerDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalProducts: 0,
    activeOrders: 0,
    totalSales: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    recentOrders: [],
    topProducts: [],
  });
  const [sellerEvents, setSellerEvents] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("weekly");

  useEffect(() => {
    fetchDashboardData();
    fetchSellerEvents();
  }, []);

  useEffect(() => {
    fetchSalesAnalytics(selectedPeriod);
  }, [selectedPeriod]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log("Fetching dashboard data...");
      const response = await analyticsService.getDashboardOverview();
      if (response.success) {
        console.log("Dashboard data received:", response.data);
        setDashboardData(response.data);
      } else {
        console.error("Failed to get dashboard data:", response);
        throw new Error(response.message || "Failed to load dashboard data");
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data: " + (error.message || ""));
      // Toast error but continue with default empty values
      toast.error("Failed to load dashboard data. Using default values.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSellerEvents = async () => {
    try {
      setEventsLoading(true);
      // This might not always return events for a seller, which is okay
      const response = await eventService.getUserEvents();
      if (response.success) {
        setSellerEvents(response.data);
      }
    } catch (error) {
      console.error("Error fetching seller events:", error);
      // Don't set an error state for this secondary data
      toast.info("Unable to load your events");
    } finally {
      setEventsLoading(false);
    }
  };

  const fetchSalesAnalytics = async (period) => {
    try {
      // Analytics might not be ready initially for new sellers
      const response = await analyticsService.getSalesAnalytics(period);
      if (response.success) {
        setSalesData(response.data);
      }
    } catch (error) {
      console.error("Error fetching sales analytics:", error);
      // Set fallback empty data instead of error
      setSalesData([]);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const calculateProgress = (currentAmount, targetAmount) => {
    if (!targetAmount) return 0;
    return Math.min((currentAmount / targetAmount) * 100, 100);
  };

  const StatCard = ({ title, value, icon: Icon, bgColor, percentage }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-full ${bgColor}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {percentage !== undefined && (
          <div
            className={`flex items-center ${
              percentage >= 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            <ArrowUpRight
              className={`w-4 h-4 mr-1 ${percentage < 0 ? "rotate-90" : ""}`}
            />
            <span className="text-sm">{Math.abs(percentage)}%</span>
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold mb-1">{value}</h3>
      <p className="text-gray-500 text-sm">{title}</p>
    </div>
  );

  const OrderStatusBadge = ({ status }) => {
    const statusStyles = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          statusStyles[status] || statusStyles.pending
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Render loading state
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Seller Dashboard</h1>
        <p className="text-gray-600">
          Welcome back! Here's what's happening with your store.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 mb-6">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Products"
          value={dashboardData.totalProducts}
          icon={Package}
          bgColor="bg-blue-500"
        />
        <StatCard
          title="Active Orders"
          value={dashboardData.activeOrders}
          icon={ShoppingBag}
          bgColor="bg-yellow-500"
          percentage={12} // Demo percentage
        />
        <StatCard
          title="Total Sales"
          value={dashboardData.totalSales}
          icon={Users}
          bgColor="bg-green-500"
          percentage={8} // Demo percentage
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(dashboardData.monthlyRevenue)}
          icon={DollarSign}
          bgColor="bg-purple-500"
          percentage={15} // Demo percentage
        />
      </div>

      {/* Charts and Data Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sales Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Sales Overview</h2>
            <div className="flex space-x-2">
              {["daily", "weekly", "monthly"].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    selectedPeriod === period
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Chart container with fallback for no data */}
          <div className="h-80">
            {salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8884d8"
                    name="Revenue"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#82ca9d"
                    name="Sales"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No sales data available yet</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Top Products</h2>
            <Link
              to="/seller/products"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              View All
            </Link>
          </div>

          {dashboardData.topProducts && dashboardData.topProducts.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.topProducts.map((item) => (
                <div key={item.product._id} className="flex items-center">
                  <img
                    src={
                      item.product.images?.[0]?.url ||
                      "/api/placeholder/100/100"
                    }
                    alt={item.product.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="ml-4 flex-1">
                    <h3 className="text-sm font-medium">{item.product.name}</h3>
                    <p className="text-gray-500 text-sm">
                      {item.totalSold} sold
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {formatCurrency(item.revenue)}
                    </p>
                    <p className="text-xs text-gray-500">Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">
                No product data available yet
              </p>
              <Link
                to="/seller/products/add"
                className="text-blue-600 hover:text-blue-800 flex items-center justify-center"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Products
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
          <Link
            to="/seller/orders"
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            View All
          </Link>
        </div>

        {dashboardData.recentOrders && dashboardData.recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order._id.slice(-6)}
                      {order.event && (
                        <span className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                          Event Order
                        </span>
                      )}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <Link
                        to={`/seller/orders/${order._id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center py-12">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No orders yet</p>
          </div>
        )}
      </div>

      {/* Seller's Events */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">My Events</h2>
          <Link
            to="/events/create"
            className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
          >
            <PlusCircle className="w-4 h-4 mr-1" />
            Create Event
          </Link>
        </div>

        {eventsLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : sellerEvents.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-gray-800 font-semibold mb-2">No Events Yet</h3>
            <p className="text-gray-600 mb-4">
              Create your first event to start collecting contributions
            </p>
            <Link
              to="/events/create"
              className="inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Create New Event
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sellerEvents.slice(0, 3).map((event) => (
              <div
                key={event._id}
                className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative">
                  {event.image ? (
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-32 object-cover"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                      <Calendar className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                    <h3 className="text-white font-medium text-sm">
                      {event.title}
                    </h3>
                  </div>
                </div>
                <div className="p-4">
                  <div className="mb-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${calculateProgress(
                            event.currentAmount,
                            event.targetAmount
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>
                        {formatCurrency(event.currentAmount)} of{" "}
                        {formatCurrency(event.targetAmount)}
                      </span>
                      <span>
                        {calculateProgress(
                          event.currentAmount,
                          event.targetAmount
                        ).toFixed(0)}
                        %
                      </span>
                    </div>
                  </div>
                  <Link
                    to={`/events/${event._id}`}
                    className="flex items-center justify-center w-full px-3 py-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 text-sm font-medium"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Event
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {sellerEvents.length > 3 && (
          <div className="text-center mt-4">
            <Link
              to="/seller/events"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              View All Events ({sellerEvents.length})
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;
