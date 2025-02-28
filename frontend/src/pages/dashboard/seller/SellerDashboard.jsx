// src/pages/dashboard/seller/SellerDashboard.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ShoppingBag,
  Users,
  DollarSign,
  Package,
  ArrowUpRight,
  Settings,
  Home,
  BarChart2,
  LogOut,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { analyticsService } from "../../../services/api/analytics";
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
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const location = useLocation();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    fetchSalesAnalytics(selectedPeriod);
  }, [selectedPeriod]);

  const fetchDashboardData = async () => {
    try {
      const response = await analyticsService.getDashboardOverview();
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesAnalytics = async (period) => {
    try {
      const response = await analyticsService.getSalesAnalytics(period);
      if (response.success) {
        setSalesData(response.data);
      }
    } catch (error) {
      console.error("Error fetching sales analytics:", error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const StatCard = ({ title, value, icon: Icon, bgColor, percentage }) => (
    <div className="bg-white p-4 rounded-lg shadow-md">
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
        className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status]}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const SidebarLink = ({ to, icon: Icon, label, active }) => (
    <Link
      to={to}
      className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
        active ? "bg-blue-100 text-blue-600" : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      <Icon className="w-5 h-5 mr-3" />
      {sidebarOpen && <span>{label}</span>}
    </Link>
  );

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
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-white shadow-md transition-all duration-300 fixed h-full z-10`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          {sidebarOpen ? (
            <h1 className="text-xl font-bold">Seller Hub</h1>
          ) : (
            <span className="text-xl font-bold">SH</span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            {sidebarOpen ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
        <div className="py-4 flex flex-col h-full">
          <div className="flex-1 space-y-1 px-3">
            <SidebarLink
              to="/seller/dashboard"
              icon={Home}
              label="Dashboard"
              active={location.pathname === "/seller/dashboard"}
            />
            <SidebarLink
              to="/seller/products"
              icon={Package}
              label="Products"
              active={location.pathname === "/seller/products"}
            />
            <SidebarLink
              to="/seller/orders"
              icon={ShoppingBag}
              label="Orders"
              active={location.pathname === "/seller/orders"}
            />
            <SidebarLink
              to="/seller/customers"
              icon={Users}
              label="Customers"
              active={location.pathname === "/seller/customers"}
            />
            <SidebarLink
              to="/seller/analytics"
              icon={BarChart2}
              label="Analytics"
              active={location.pathname === "/seller/analytics"}
            />
            <SidebarLink
              to="/seller/settings"
              icon={Settings}
              label="Settings"
              active={location.pathname === "/seller/settings"}
            />
          </div>
          <div className="px-3 mt-auto">
            <SidebarLink
              to="/logout"
              icon={LogOut}
              label="Logout"
              active={false}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`flex-1 ${
          sidebarOpen ? "ml-64" : "ml-20"
        } transition-all duration-300`}
      >
        {/* Top Navigation */}
        <div className="bg-white p-4 shadow-sm flex justify-between items-center">
          <h1 className="text-xl font-bold">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
              <span className="sr-only">Notifications</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
            </button>
            <div className="flex items-center">
              <img
                src="https://randomuser.me/api/portraits/women/68.jpg"
                alt="User"
                className="h-8 w-8 rounded-full object-cover"
              />
              {sidebarOpen && (
                <div className="ml-3">
                  <p className="text-sm font-medium">Sarah Johnson</p>
                  <p className="text-xs text-gray-500">seller@example.com</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div
          className="p-6 overflow-auto"
          style={{ height: "calc(100vh - 65px)" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
              percentage={12}
            />
            <StatCard
              title="Total Sales"
              value={dashboardData.totalSales}
              icon={Users}
              bgColor="bg-green-500"
              percentage={8}
            />
            <StatCard
              title="Monthly Revenue"
              value={formatCurrency(dashboardData.monthlyRevenue)}
              icon={DollarSign}
              bgColor="bg-purple-500"
              percentage={15}
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
                    <Tooltip />
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
              <div className="space-y-4">
                {dashboardData.topProducts.slice(0, 5).map((item) => (
                  <div key={item.product._id} className="flex items-center">
                    <img
                      src={
                        item.product.images?.[0]?.url ||
                        "https://placehold.co/100x100"
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
                          {order.buyer.name}
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.createdAt)}
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
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
