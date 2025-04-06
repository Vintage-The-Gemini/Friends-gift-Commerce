// frontend/src/pages/admin/AdminDashboard.jsx (Updated)
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
  Clock,
  CheckCircle,
  X,
} from "lucide-react";
import api from "../../services/api/axios.config";
import { formatCurrency } from "../../utils/currency";
import {
  PendingApprovalsWidget,
  QuickStatsWidget,
  RecentActivityWidget,
} from "../../components/admin/AdminDashboardWidgets";

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
  const [pendingProducts, setPendingProducts] = useState([]);
  const [pendingSellers, setPendingSellers] = useState([]);
  const [approvalStats, setApprovalStats] = useState({
    products: { pending: 0, approved: 0, rejected: 0, total: 0 },
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Make parallel requests to different endpoints
      const [
        statsResponse,
        productsResponse,
        sellersResponse,
        approvalsResponse,
      ] = await Promise.all([
        api.get("/admin/dashboard/stats"),
        api.get("/admin/approvals/products?limit=5"),
        api.get("/admin/sellers?status=pending&limit=5"),
        api.get("/admin/approvals/stats"),
      ]);

      // Process dashboard stats
      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }

      // Process pending products
      if (productsResponse.data.success) {
        setPendingProducts(productsResponse.data.data || []);
      }

      // Process pending sellers
      if (sellersResponse.data.success) {
        setPendingSellers(sellersResponse.data.data || []);
      }

      // Process approval stats
      if (approvalsResponse.data.success) {
        setApprovalStats(approvalsResponse.data.data);
      }

      // Generate activities from recent events
      generateActivities(
        statsResponse.data.success ? statsResponse.data.data : null,
        productsResponse.data.success ? productsResponse.data.data : []
      );
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard statistics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Generate activities array from various data sources
  const generateActivities = (statsData, pendingProductsData) => {
    const activitiesList = [];
  
    // Add recent user registrations
    if (statsData?.recentUsers?.length) {
      statsData.recentUsers.slice(0, 3).forEach((user) => {
        activitiesList.push({
          message: `New ${user.role} registered: ${user.name}`,
          time: new Date(user.createdAt).toLocaleString(),
          icon: <User className="h-4 w-4 text-blue-600" />,
          bgColor: "bg-blue-100",
        });
      });
    }
  
    // Add recent orders
    if (statsData?.recentOrders?.length) {
      statsData.recentOrders.slice(0, 3).forEach((order) => {
        activitiesList.push({
          message: `New order (${formatCurrency(order.totalAmount)}) from ${
            order.buyer?.name || "Anonymous"
          }`,
          time: new Date(order.createdAt).toLocaleString(),
          icon: <ShoppingBag className="h-4 w-4 text-green-600" />,
          bgColor: "bg-green-100",
          status: order.status,
        });
      });
    }
  
    // Add pending product approvals
    if (pendingProductsData?.length) {
      pendingProductsData.slice(0, 3).forEach((product) => {
        activitiesList.push({
          message: `Product needs approval: ${product.name}`,
          time: new Date(product.createdAt).toLocaleString(),
          icon: <Clock className="h-4 w-4 text-yellow-600" />,
          bgColor: "bg-yellow-100",
          status: "pending",
        });
      });
    }
  
    // Sort activities by date (newest first)
    activitiesList.sort((a, b) => new Date(b.time) - new Date(a.time));
  
    setActivities(activitiesList);
  };
  

  const refreshDashboard = async () => {
    try {
      setRefreshing(true);
      await fetchDashboardData();
      // Show success feedback
      setTimeout(() => setRefreshing(false), 1000);
    } catch (error) {
      // Error already handled in fetchDashboardData
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

  if (loading && !stats.totalUsers) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button
          onClick={refreshDashboard}
          disabled={refreshing}
          className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"
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
      <div className="mb-8">
        <QuickStatsWidget stats={stats} />
      </div>

      {/* Approval Stats Cards */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Approval Status</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Pending Approvals
                </p>
                <p className="text-2xl font-bold text-yellow-500">
                  {approvalStats.products.pending}
                </p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-full">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
            </div>
            <div className="mt-2">
              <Link
                to="/admin/approvals"
                className="text-sm text-yellow-600 hover:text-yellow-700 flex items-center"
              >
                Review Pending <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Approved Products
                </p>
                <p className="text-2xl font-bold text-green-500">
                  {approvalStats.products.approved}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
            </div>
            <div className="mt-2">
              <Link
                to="/admin/products?status=active"
                className="text-sm text-green-600 hover:text-green-700 flex items-center"
              >
                View Approved <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Rejected Products
                </p>
                <p className="text-2xl font-bold text-red-500">
                  {approvalStats.products.rejected}
                </p>
              </div>
              <div className="p-2 bg-red-100 rounded-full">
                <X className="h-5 w-5 text-red-500" />
              </div>
            </div>
            <div className="mt-2">
              <Link
                to="/admin/products?status=inactive"
                className="text-sm text-red-600 hover:text-red-700 flex items-center"
              >
                View Rejected <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Products
                </p>
                <p className="text-2xl font-bold text-indigo-500">
                  {approvalStats.products.total}
                </p>
              </div>
              <div className="p-2 bg-indigo-100 rounded-full">
                <Package className="h-5 w-5 text-indigo-500" />
              </div>
            </div>
            <div className="mt-2">
              <Link
                to="/admin/products"
                className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center"
              >
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Pending Approvals Widget */}
        <div className="lg:col-span-2">
          <PendingApprovalsWidget
            pendingProducts={pendingProducts}
            pendingSellers={pendingSellers}
          />
        </div>

        {/* Recent Activity Widget */}
        <div>
          <RecentActivityWidget activities={activities} />
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
          <Link
            to="/admin/orders"
            className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
          >
            View All <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {stats.recentOrders && stats.recentOrders.length > 0 ? (
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
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
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
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <Link
                        to={`/admin/orders/${order._id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            No recent orders available
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
