// frontend/src/pages/dashboard/seller/SellerDashboard.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Users,
  DollarSign,
  Package,
  ArrowUpRight,
  Plus,
  Eye,
  Clock,
  AlertCircle,
} from "lucide-react";
import { analyticsService } from "../../../services/api/analytics";
import { formatCurrency } from "../../../utils/currency";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const SellerDashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    totalProducts: 0,
    activeOrders: 0,
    totalSales: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    recentOrders: [],
    topProducts: [],
  });
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("weekly");

  useEffect(() => {
    // Remove business profile fetch and only fetch dashboard data
    Promise.all([fetchDashboardData(), fetchSalesAnalytics(selectedPeriod)])
      .catch((err) => {
        setError("Failed to load dashboard data. Please try again.");
        console.error("Dashboard error:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchSalesAnalytics(selectedPeriod).catch((err) => {
      console.error("Failed to load sales analytics:", err);
    });
  }, [selectedPeriod]);

  const fetchDashboardData = async () => {
    try {
      const response = await analyticsService.getDashboardOverview();
      if (response.success) {
        setDashboardData(response.data);
      } else {
        throw new Error(response.message || "Failed to load dashboard data");
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      throw error;
    }
  };

  const fetchSalesAnalytics = async (period) => {
    try {
      const response = await analyticsService.getSalesAnalytics(period);
      if (response.success) {
        setSalesData(response.data);
      } else {
        throw new Error(response.message || "Failed to load sales analytics");
      }
    } catch (error) {
      console.error("Error fetching sales analytics:", error);
      throw error;
    }
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    bgColor,
    percentage,
    onClick,
  }) => (
    <div
      className="bg-white p-4 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-full ${bgColor}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {percentage !== undefined && (
          <div
            className={`flex items-center ${
              percentage >= 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            <ArrowUpRight
              className={`w-3 h-3 mr-1 ${percentage < 0 ? "rotate-90" : ""}`}
            />
            <span className="text-xs">{Math.abs(percentage)}%</span>
          </div>
        )}
      </div>
      <h3 className="text-xl font-bold mb-1">{value}</h3>
      <p className="text-gray-500 text-xs">{title}</p>
    </div>
  );

  const OrderStatusBadge = ({ status }) => {
    const statusStyles = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          statusStyles[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Products"
          value={dashboardData.totalProducts}
          icon={Package}
          bgColor="bg-blue-500"
          onClick={() => navigate("/seller/products")}
        />
        <StatCard
          title="Active Orders"
          value={dashboardData.activeOrders}
          icon={ShoppingBag}
          bgColor="bg-yellow-500"
          percentage={12}
          onClick={() => navigate("/seller/orders")}
        />
        <StatCard
          title="Total Sales"
          value={dashboardData.totalSales}
          icon={Users}
          bgColor="bg-green-500"
          percentage={8}
          onClick={() => navigate("/seller/analytics")}
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(dashboardData.monthlyRevenue)}
          icon={DollarSign}
          bgColor="bg-purple-500"
          percentage={15}
          onClick={() => navigate("/seller/analytics")}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Sales Chart */}
        <div className="bg-white p-5 rounded-lg shadow-md lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Sales Overview</h2>
            <div className="flex space-x-2">
              {["daily", "weekly", "monthly"].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1 rounded-lg text-xs ${
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
          <div className="h-64">
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
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white p-5 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Top Products</h2>
            <Link
              to="/seller/products"
              className="text-blue-600 hover:text-blue-800 text-xs"
            >
              View All
            </Link>
          </div>
          {dashboardData.topProducts && dashboardData.topProducts.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.topProducts.slice(0, 5).map((item) => (
                <div key={item.product._id} className="flex items-center">
                  <img
                    src={
                      item.product.images?.[0]?.url ||
                      "/api/placeholder/100/100"
                    }
                    alt={item.product.name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div className="ml-3 flex-1">
                    <h3 className="text-sm font-medium truncate">
                      {item.product.name}
                    </h3>
                    <p className="text-gray-500 text-xs">
                      {item.totalSold} sold
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {formatCurrency(item.revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No product data available</p>
              <Link
                to="/seller/products/add"
                className="text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Your First Product
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
          <Link
            to="/seller/orders"
            className="text-blue-600 hover:text-blue-800 text-xs"
          >
            View All
          </Link>
        </div>

        {dashboardData.recentOrders && dashboardData.recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order._id.slice(-6)}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.buyer?.name || "Unknown"}
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-right text-sm">
                      <Link
                        to={`/seller/orders/${order._id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-5 h-5 inline-block" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">No recent orders</p>
            <p className="text-sm text-gray-400">
              New orders will appear here when customers make purchases
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;
