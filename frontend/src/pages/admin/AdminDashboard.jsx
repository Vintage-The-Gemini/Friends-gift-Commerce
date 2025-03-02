// frontend/src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from "react";
import {
  Users,
  ShoppingBag,
  Calendar,
  DollarSign,
  Package,
  Store,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Activity,
  CreditCard,
  UserCheck,
  Tag,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../services/api/axios.config";
import { formatCurrency } from "../../utils/currency";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSellers: 0,
    totalEvents: 0,
    totalProducts: 0,
    totalOrders: 0,
    activeEvents: 0,
    pendingOrders: 0,
    newUsers: 0,
    contributionAmount: 0,
    recentUsers: [],
    recentEvents: [],
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/admin/dashboard/stats");

      if (response.data.success) {
        setStats(response.data.data);
      } else {
        throw new Error(
          response.data.message || "Failed to fetch dashboard stats"
        );
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      setError("Failed to load dashboard statistics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = async () => {
    try {
      setRefreshing(true);
      await fetchDashboardStats();
      // Show success feedback
      setTimeout(() => setRefreshing(false), 1000);
    } catch (error) {
      setRefreshing(false);
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Stat Card Component
  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    link,
    subtitle = null,
  }) => (
    <Link
      to={link}
      className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <h3 className="text-2xl font-bold mt-2">{value}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Link>
  );

  // Quick action card component
  const QuickActionCard = ({ title, description, icon: Icon, link }) => (
    <Link
      to={link}
      className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-start"
    >
      <div className="p-3 bg-blue-50 rounded-lg mr-4">
        <Icon className="w-6 h-6 text-blue-600" />
      </div>
      <div>
        <h3 className="font-medium mb-1">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400 ml-auto self-center" />
    </Link>
  );

  if (loading && !stats.totalUsers) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button
          onClick={refreshStats}
          disabled={refreshing}
          className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
          />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          subtitle={`+${stats.newUsers} new (7d)`}
          icon={Users}
          color="bg-blue-500"
          link="/admin/users"
        />
        <StatCard
          title="Total Sellers"
          value={stats.totalSellers.toLocaleString()}
          icon={Store}
          color="bg-green-500"
          link="/admin/sellers"
        />
        <StatCard
          title="Active Events"
          value={stats.activeEvents.toLocaleString()}
          subtitle={`${stats.totalEvents} total`}
          icon={Calendar}
          color="bg-purple-500"
          link="/admin/events"
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts.toLocaleString()}
          icon={Package}
          color="bg-yellow-500"
          link="/admin/products"
        />
      </div>

      {/* Second Row Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Pending Orders"
          value={stats.pendingOrders?.toLocaleString() || 0}
          subtitle={`${stats.totalOrders || 0} total orders`}
          icon={ShoppingBag}
          color="bg-orange-500"
          link="/admin/orders"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.contributionAmount || 0)}
          icon={DollarSign}
          color="bg-emerald-500"
          link="/admin/contributions"
        />
        <StatCard
          title="Completed Events"
          value={stats.completedEvents?.toLocaleString() || 0}
          icon={TrendingUp}
          color="bg-indigo-500"
          link="/admin/events?status=completed"
        />
        <StatCard
          title="Active Categories"
          value={stats.totalCategories?.toLocaleString() || 0}
          icon={Tag}
          color="bg-pink-500"
          link="/admin/categories"
        />
      </div>

      {/* Quick Actions */}
      <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <QuickActionCard
          title="Manage Users"
          description="View, edit and manage user accounts"
          icon={Users}
          link="/admin/users"
        />
        <QuickActionCard
          title="Approve Sellers"
          description="Review and approve seller applications"
          icon={UserCheck}
          link="/admin/sellers"
        />
        <QuickActionCard
          title="Manage Categories"
          description="Create and organize product categories"
          icon={Tag}
          link="/admin/categories"
        />
        <QuickActionCard
          title="Process Payments"
          description="View and manage payment transactions"
          icon={CreditCard}
          link="/admin/contributions"
        />
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Users</h2>
            <Link
              to="/admin/users"
              className="text-blue-600 text-sm hover:underline"
            >
              View All
            </Link>
          </div>

          {stats.recentUsers && stats.recentUsers.length > 0 ? (
            <div className="space-y-4">
              {stats.recentUsers.map((user) => (
                <div key={user._id} className="flex items-center p-2 border-b">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-500">
                      {user.role} • {user.phoneNumber}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(user.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-6">No recent users</p>
          )}
        </div>

        {/* Recent Events */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Events</h2>
            <Link
              to="/admin/events"
              className="text-blue-600 text-sm hover:underline"
            >
              View All
            </Link>
          </div>

          {stats.recentEvents && stats.recentEvents.length > 0 ? (
            <div className="space-y-4">
              {stats.recentEvents.map((event) => (
                <div key={event._id} className="flex items-center p-2 border-b">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-medium">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-gray-500">
                      {event.eventType} • {formatCurrency(event.targetAmount)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        event.status === "active"
                          ? "bg-green-100 text-green-800"
                          : event.status === "completed"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {event.status}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      {formatDate(event.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-6">No recent events</p>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2 mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Orders</h2>
            <Link
              to="/admin/orders"
              className="text-blue-600 text-sm hover:underline"
            >
              View All
            </Link>
          </div>

          {stats.recentOrders && stats.recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Buyer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        #{order._id.substr(-6)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {order.buyer?.name || "Unknown"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            order.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : order.status === "processing"
                              ? "bg-blue-100 text-blue-800"
                              : order.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-6">No recent orders</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
