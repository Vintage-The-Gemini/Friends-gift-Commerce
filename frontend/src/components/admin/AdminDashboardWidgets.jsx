// src/components/admin/AdminDashboardWidgets.jsx
import React from "react";
import { Link } from "react-router-dom";
import {
  Package,
  AlertTriangle,
  Clock,
  ShoppingBag,
  User,
  DollarSign,
  Calendar,
  Check,
  X,
  ChevronRight,
  Activity,
} from "lucide-react";

// Status Badge Component
const StatusBadge = ({ status }) => {
  let bgColor, textColor, icon;

  switch (status) {
    case "pending":
      bgColor = "bg-yellow-100";
      textColor = "text-yellow-800";
      icon = <Clock className="w-3 h-3 mr-1" />;
      break;
    case "approved":
      bgColor = "bg-green-100";
      textColor = "text-green-800";
      icon = <Check className="w-3 h-3 mr-1" />;
      break;
    case "rejected":
      bgColor = "bg-red-100";
      textColor = "text-red-800";
      icon = <X className="w-3 h-3 mr-1" />;
      break;
    default:
      bgColor = "bg-gray-100";
      textColor = "text-gray-800";
      icon = <Activity className="w-3 h-3 mr-1" />;
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}
    >
      {icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Pending Approvals Widget
export const PendingApprovalsWidget = ({
  pendingProducts = [],
  pendingSellers = [],
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Pending Approvals</h2>
        <Link
          to="/admin/approvals"
          className="text-indigo-600 text-sm hover:text-indigo-800 flex items-center"
        >
          View All <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      <div className="space-y-4">
        {/* Products Pending Approval */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Products</h3>
          {pendingProducts.length === 0 ? (
            <p className="text-sm text-gray-400">
              No pending product approvals
            </p>
          ) : (
            <ul className="space-y-2">
              {pendingProducts.slice(0, 3).map((product) => (
                <li
                  key={product._id}
                  className="flex justify-between items-center p-2 hover:bg-gray-50 rounded"
                >
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-gray-100 rounded flex items-center justify-center mr-3">
                      <Package className="h-4 w-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-gray-500">
                        {product.seller?.businessName || "Unknown Seller"}
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/admin/products/review/${product._id}`}
                    className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded hover:bg-indigo-200"
                  >
                    Review
                  </Link>
                </li>
              ))}
              {pendingProducts.length > 3 && (
                <li className="text-center text-xs text-gray-500 pt-1">
                  <Link
                    to="/admin/products?status=pending"
                    className="hover:text-indigo-600"
                  >
                    + {pendingProducts.length - 3} more pending
                  </Link>
                </li>
              )}
            </ul>
          )}
        </div>

        {/* Sellers Pending Approval */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Sellers</h3>
          {pendingSellers.length === 0 ? (
            <p className="text-sm text-gray-400">No pending seller approvals</p>
          ) : (
            <ul className="space-y-2">
              {pendingSellers.slice(0, 3).map((seller) => (
                <li
                  key={seller._id}
                  className="flex justify-between items-center p-2 hover:bg-gray-50 rounded"
                >
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                      <User className="h-4 w-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {seller.businessName || seller.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {seller.phoneNumber}
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/admin/sellers/review/${seller._id}`}
                    className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded hover:bg-indigo-200"
                  >
                    Review
                  </Link>
                </li>
              ))}
              {pendingSellers.length > 3 && (
                <li className="text-center text-xs text-gray-500 pt-1">
                  <Link
                    to="/admin/sellers?status=pending"
                    className="hover:text-indigo-600"
                  >
                    + {pendingSellers.length - 3} more pending
                  </Link>
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

// Quick Stats Widget
export const QuickStatsWidget = ({ stats }) => {
  const {
    totalProducts = 0,
    totalSellers = 0,
    totalOrders = 0,
    totalRevenue = 0,
  } = stats || {};

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Package className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-gray-500">Products</p>
            <p className="text-xl font-bold">{totalProducts}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center">
          <div className="p-2 bg-green-100 rounded-lg">
            <User className="h-6 w-6 text-green-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-gray-500">Sellers</p>
            <p className="text-xl font-bold">{totalSellers}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center">
          <div className="p-2 bg-purple-100 rounded-lg">
            <ShoppingBag className="h-6 w-6 text-purple-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-gray-500">Orders</p>
            <p className="text-xl font-bold">{totalOrders}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <DollarSign className="h-6 w-6 text-yellow-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-gray-500">Revenue</p>
            <p className="text-xl font-bold">
              ${totalRevenue.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Recent Activity Widget
export const RecentActivityWidget = ({ activities = [] }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Recent Activity</h2>
      </div>

      {activities.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">
          No recent activities
        </p>
      ) : (
        <div className="space-y-3">
          {activities.map((activity, index) => (
            <div
              key={index}
              className="flex items-start p-2 hover:bg-gray-50 rounded"
            >
              <div
                className={`p-2 rounded-full mr-3 ${
                  activity.bgColor || "bg-gray-100"
                }`}
              >
                {activity.icon || (
                  <Activity className="h-4 w-4 text-gray-500" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm">{activity.message}</p>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">{activity.time}</p>
                  {activity.status && <StatusBadge status={activity.status} />}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-gray-100 text-center">
        <Link
          to="/admin/activity"
          className="text-indigo-600 text-sm hover:text-indigo-800"
        >
          View All Activity
        </Link>
      </div>
    </div>
  );
};

export default {
  PendingApprovalsWidget,
  QuickStatsWidget,
  RecentActivityWidget,
  StatusBadge,
};
