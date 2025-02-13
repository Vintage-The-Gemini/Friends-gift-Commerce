// src/pages/seller/SellerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { ShoppingBag, Users, DollarSign, TrendingUp } from 'lucide-react';

const SellerDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    activeOrders: 0,
    monthlyRevenue: 0
  });

  const StatCard = ({ title, value, icon: Icon, bgColor }) => (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center">
        <div className={`${bgColor} p-3 rounded-full`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/seller/analytics/overview', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={ShoppingBag}
          bgColor="bg-blue-500"
        />
        <StatCard
          title="Active Orders"
          value={stats.activeOrders}
          icon={TrendingUp}
          bgColor="bg-green-500"
        />
        <StatCard
          title="Total Sales"
          value={stats.totalSales}
          icon={Users}
          bgColor="bg-purple-500"
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${stats.monthlyRevenue}`}
          icon={DollarSign}
          bgColor="bg-yellow-500"
        />
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
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
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  No orders yet
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;