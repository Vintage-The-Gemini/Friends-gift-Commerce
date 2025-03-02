// frontend/src/pages/admin/AdminDashboard.jsx - Enhanced version

import { useState, useEffect } from "react";
import {
  Users,
  ShoppingBag,
  Calendar,
  DollarSign,
  Package,
  Store,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../services/api/axios.config";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSellers: 0,
    totalEvents: 0,
    totalProducts: 0,
    totalOrders: 0,
    recentUsers: [],
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/admin/dashboard/stats");
      if (response.data.success) {
        setStats(response.data.data);
      } else {
        throw new Error(
          response.data.message || "Failed to fetch dashboard stats"
        );
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      setError("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, link }) => (
    <Link
      to={link}
      className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <h3 className="text-2xl font-bold mt-2">{value}</h3>
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

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          color="bg-blue-500"
          link="/admin/users"
        />
        <StatCard
          title="Total Sellers"
          value={stats.totalSellers}
          icon={Store}
          color="bg-green-500"
          link="/admin/sellers"
        />
        <StatCard
          title="Total Events"
          value={stats.totalEvents}
          icon={Calendar}
          color="bg-purple-500"
          link="/admin/events"
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={Package}
          color="bg-yellow-500"
          link="/admin/products"
        />
      </div>

      {/* Quick Actions */}
      <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <QuickActionCard
          title="Manage Users"
          description="View, edit and manage user accounts"
          icon={Users}
          link="/admin/users"
        />
        <QuickActionCard
          title="Manage Sellers"
          description="Approve and manage seller accounts"
          icon={Store}
          link="/admin/sellers"
        />
        <QuickActionCard
          title="Manage Categories"
          description="Create and organize product categories"
          icon={ShoppingBag}
          link="/admin/categories"
        />
        <QuickActionCard
          title="View Events"
          description="Monitor active events and contributions"
          icon={Calendar}
          link="/admin/events"
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
                  <div className="ml-3">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.role}</p>
                  </div>
                  <div className="ml-auto text-xs text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-6">No recent users</p>
          )}
        </div>

        {/* Recent Orders/Events */}
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
                  <div className="ml-3">
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-gray-500">{event.eventType}</p>
                  </div>
                  <div className="ml-auto">
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
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-6">No recent events</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
