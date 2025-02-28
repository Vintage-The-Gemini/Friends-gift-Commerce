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
  Calendar,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const SellerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Get user initials helper function
  const getUserInitials = (name) => {
    if (!name) return "";
    const names = name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  // Sellers can also create events
  const handleCreateEvent = () => {
    navigate("/events/create");
  };

  // Get business name or user name
  const displayName = user?.businessName || user?.name || "Your Business";
  const initials = getUserInitials(user?.name);

  const navigation = [
    {
      name: "Home",
      href: "/",
      icon: Home,
      external: true,
    },
    {
      name: "Dashboard",
      href: "/seller/dashboard",
      icon: Store,
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static shadow-lg`}
      >
        <div className="flex flex-col h-full">
          {/* Business Profile Section */}
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <Link
              to="/seller/dashboard"
              className="flex items-center space-x-2"
            >
              <Store className="w-6 h-6 text-blue-600" />
              <span className="text-lg font-semibold text-gray-900">
                {displayName}
              </span>
            </Link>
            <button
              className="lg:hidden text-gray-500"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive =
                !item.external && location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-2 rounded-lg ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Logout */}
          <div className="p-4 border-t space-y-4">
            {/* User Profile Section */}
            <div className="flex items-center p-2 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                {initials}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500">{user?.phoneNumber}</p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="flex items-center w-full px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              className="lg:hidden text-gray-500"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Header Actions */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handleCreateEvent}
                className="hidden md:flex items-center bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700"
              >
                <Gift className="w-4 h-4 mr-2" />
                Create Event
              </button>

              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                  {initials}
                </div>
                <div className="hidden md:block">
                  <div className="text-sm font-medium text-gray-900">
                    {user?.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {user?.phoneNumber}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SellerLayout;
