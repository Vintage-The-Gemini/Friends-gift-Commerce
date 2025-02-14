import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Store, ShoppingBag, DollarSign, TrendingUp } from "lucide-react";
import api from "../../../services/api/axios.config";

const SellerAnalytics = () => {
  const [loading, setLoading] = useState(true);
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
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    fetchSalesData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get("/seller/analytics/overview");
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      setError("Failed to load dashboard data");
      console.error("Dashboard data error:", error);
    }
  };

  const fetchSalesData = async () => {
    try {
      const response = await api.get("/seller/analytics/sales");
      if (response.data.success) {
        setSalesData(response.data.data);
      }
    } catch (error) {
      console.error("Sales data error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Format currency helper
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <Store className="w-12 h-12 text-blue-500 bg-blue-100 p-2 rounded-lg" />
            <span className="text-sm text-gray-500">Total Products</span>
          </div>
          <h3 className="text-2xl font-bold">{dashboardData.totalProducts}</h3>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <ShoppingBag className="w-12 h-12 text-green-500 bg-green-100 p-2 rounded-lg" />
            <span className="text-sm text-gray-500">Active Orders</span>
          </div>
          <h3 className="text-2xl font-bold">{dashboardData.activeOrders}</h3>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-12 h-12 text-yellow-500 bg-yellow-100 p-2 rounded-lg" />
            <span className="text-sm text-gray-500">Total Revenue</span>
          </div>
          <h3 className="text-2xl font-bold">
            {formatCurrency(dashboardData.totalRevenue)}
          </h3>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-12 h-12 text-purple-500 bg-purple-100 p-2 rounded-lg" />
            <span className="text-sm text-gray-500">Monthly Revenue</span>
          </div>
          <h3 className="text-2xl font-bold">
            {formatCurrency(dashboardData.monthlyRevenue)}
          </h3>
        </div>
      </div>

      {/* Sales Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-6">Sales Overview</h2>
        <div className="h-80">
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
                strokeWidth={2}
                name="Revenue"
              />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#82ca9d"
                strokeWidth={2}
                name="Sales"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Top Products</h2>
        <div className="space-y-4">
          {dashboardData.topProducts.map((item) => (
            <div
              key={item.product._id}
              className="flex items-center justify-between"
            >
              <div className="flex items-center">
                <img
                  src={item.product.images?.[0]?.url || "/placeholder.png"}
                  alt={item.product.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="ml-4">
                  <h3 className="font-medium">{item.product.name}</h3>
                  <p className="text-sm text-gray-500">{item.totalSold} sold</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatCurrency(item.revenue)}</p>
                <p className="text-sm text-gray-500">Revenue</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SellerAnalytics;
