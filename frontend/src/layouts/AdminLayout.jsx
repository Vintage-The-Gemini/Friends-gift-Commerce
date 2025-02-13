// src/layouts/AdminLayout.jsx
import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { 
  Users, ShoppingBag, Calendar, Settings, 
  LogOut, Menu, X, Home 
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { logout } = useAuth();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: Home
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: Users
    },
    {
      name: 'Sellers',
      href: '/admin/sellers',
      icon: ShoppingBag
    },
    {
      name: 'Events',
      href: '/admin/events',
      icon: Calendar
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: Settings
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#5551FF] transform transition-transform duration-200 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 bg-[#4440FF]">
            <Link to="/admin/dashboard" className="text-white text-xl font-bold">
              Admin Panel
            </Link>
            <button
              className="lg:hidden text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-2 rounded-lg ${
                    isActive
                      ? 'bg-white text-[#5551FF]'
                      : 'text-white hover:bg-[#4440FF]'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4">
            <button
              onClick={logout}
              className="flex items-center w-full px-4 py-2 text-white hover:bg-[#4440FF] rounded-lg"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64 flex flex-col h-screen">
        {/* Top Bar */}
        <div className="sticky top-0 z-10 bg-white h-16 flex items-center px-4 shadow">
          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;