// src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { Users, ShoppingBag, Calendar, DollarSign } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSellers: 0,
    totalEvents: 0,
    totalProducts: 0
  });

  useEffect(() => {
    // Fetch dashboard stats
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <h3 className="text-2xl font-bold mt-2">{value}</h3>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Sellers"
          value={stats.totalSellers}
          icon={ShoppingBag}
          color="bg-green-500"
        />
        <StatCard
          title="Total Events"
          value={stats.totalEvents}
          icon={Calendar}
          color="bg-purple-500"
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={DollarSign}
          color="bg-yellow-500"
        />
      </div>
    </div>
  );
};

export default AdminDashboard;