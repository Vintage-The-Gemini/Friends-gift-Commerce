// src/layouts/SellerLayout.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import {
  Store,
  Package,
  BarChart2,
  Settings,
  LogOut,
  Menu,
  X,
  ShoppingBag,
  Home,
  Gift,
  Bell,
  Calendar,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const SellerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Get user initials for avatar
  const getUserInitials = (name) => {
    if (!name) return "?";
    const names = name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  // Navigation items
  const navigationItems = [
    {
      name: "Dashboard",
      href: "/seller/dashboard",
      icon: Home,
    },
    {
      name: "Products",
      href: "/seller/products",
      icon: Package,
    },
    {
      name: "Orders",
      href: "/seller/orders",
      icon: ShoppingBag,
    },
    {
      name: "Events",
      href: "/seller/events",
      icon: Calendar,
    },
    {
      name: "Analytics",
      href: "/seller/analytics",
      icon: BarChart2,
    },
    {
      name: "Settings",
      href: "/seller/settings",
      icon: Settings,
    },
  ];

  const initials = getUserInitials(user?.name);
  const displayName = user?.businessName || user?.name || "Your Business";

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b">
          <Link to="/seller/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-md bg-[#5551FF] flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-gray-800 truncate">
              {displayName}
            </span>
          </Link>
          <button
            className="p-1 rounded-md text-gray-400 lg:hidden hover:bg-gray-50"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <div className="p-4 flex flex-col h-[calc(100%-4rem)]">
          <nav className="flex-1 space-y-1">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-[#5551FF]/10 text-[#5551FF]"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <item.icon
                    className={`w-5 h-5 mr-3 ${
                      isActive ? "text-[#5551FF]" : "text-gray-500"
                    }`}
                  />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Create Event Button */}
          <div className="mt-6 mb-6">
            <Link
              to="/events/create"
              className="w-full flex items-center justify-center px-4 py-2.5 bg-[#5551FF] text-white rounded-lg hover:bg-[#4440FF] transition-colors"
            >
              <Gift className="w-4 h-4 mr-2" />
              Create Event
            </Link>
          </div>

          {/* User Profile */}
          <div className="mt-auto border-t pt-4">
            <div className="flex items-center p-2">
              <div className="w-10 h-10 rounded-full bg-[#5551FF] flex items-center justify-center text-white font-medium">
                {initials}
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.phoneNumber}
                </p>
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="bg-white border-b h-16 flex items-center justify-between px-4 lg:px-6">
          {/* Left side - mobile menu button */}
          <div className="flex items-center">
            <button
              className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Right side - user profile and notifications */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 relative"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
              >
                <Bell className="w-6 h-6" />
                <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
              </button>

              {/* Notifications Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-50 border">
                  <div className="px-4 py-2 border-b">
                    <h3 className="font-medium">Notifications</h3>
                  </div>
                  <div className="p-4 text-center text-gray-500">
                    <p>No new notifications</p>
                  </div>
                </div>
              )}
            </div>

            {/* User Info - Simplified */}
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#5551FF] flex items-center justify-center text-white font-medium">
                {initials}
              </div>
              <div className="ml-2">
                <p className="text-sm font-medium">{user?.name || "User"}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SellerLayout;
