// frontend/src/layouts/SellerLayout.jsx
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
  User,
  ChevronDown,
  Calendar,
  Search,
  LayoutDashboard,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const SellerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // User menu dropdown
      const userMenuButton = document.getElementById("user-menu-button");
      if (
        userMenuButton &&
        !userMenuButton.contains(event.target) &&
        userMenuOpen
      ) {
        setUserMenuOpen(false);
      }

      // Notifications dropdown
      const notificationsButton = document.getElementById(
        "notifications-button"
      );
      if (
        notificationsButton &&
        !notificationsButton.contains(event.target) &&
        notificationsOpen
      ) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuOpen, notificationsOpen]);

  // Handle creating a new event
  const handleCreateEvent = () => {
    navigate("/events/create");
  };

  // Get user initials for avatar
  const getUserInitials = (name) => {
    if (!name) return "";
    const names = name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  // Get business name or user name
  const displayName = user?.businessName || user?.name || "Your Business";
  const initials = getUserInitials(user?.name);

  // Navigation items - Added Home as the first item
  const navigationItems = [
    {
      name: "Go to Homepage",
      href: "/",
      icon: Home,
      external: true,
    },
    {
      name: "Dashboard",
      href: "/seller/dashboard",
      icon: LayoutDashboard,
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
    // Keep profile link
    {
      name: "Business Profile",
      href: "/seller/profile",
      icon: Store,
    },
    {
      name: "Settings",
      href: "/seller/settings",
      icon: Settings,
    },
  ];

  // Sample notifications (would come from API in real app)
  const notifications = [
    {
      id: 1,
      title: "New Order",
      message: "You have received a new order #12345",
      time: "5 minutes ago",
      read: false,
    },
    {
      id: 2,
      title: "Payment Received",
      message: "Payment of KES 2,500 has been processed",
      time: "1 hour ago",
      read: false,
    },
    {
      id: 3,
      title: "Low Stock Alert",
      message: "Product 'Wireless Headphones' is running low on stock",
      time: "Yesterday",
      read: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
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
            className="p-1 rounded-md text-gray-400 md:hidden hover:bg-gray-50"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <div className="p-4 flex flex-col h-[calc(100%-4rem)]">
          <nav className="flex-1 space-y-1">
            {navigationItems.map((item) => {
              const isActive =
                !item.external && location.pathname === item.href;

              return item.external ? (
                <a
                  key={item.name}
                  href={item.href}
                  className="flex items-center px-3 py-2.5 rounded-lg transition-colors text-gray-700 hover:bg-gray-50"
                >
                  <item.icon className="w-5 h-5 mr-3 text-gray-500" />
                  <span className="font-medium">{item.name}</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-auto text-gray-400" />
                </a>
              ) : (
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
            <button
              onClick={handleCreateEvent}
              className="w-full flex items-center justify-center px-4 py-2.5 bg-[#5551FF] text-white rounded-lg hover:bg-[#4440FF] transition-colors"
            >
              <Gift className="w-4 h-4 mr-2" />
              Create Event
            </button>
          </div>

          {/* User Profile - Simplified */}
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
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="bg-white border-b h-16 flex items-center justify-between px-4 md:px-6">
          {/* Left side - mobile menu button and search */}
          <div className="flex items-center">
            <button
              className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="ml-4 relative max-w-xs lg:max-w-md hidden md:block">
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5551FF] focus:border-transparent"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>

          {/* Right side - notifications and user menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications dropdown */}
            <div className="relative">
              <button
                id="notifications-button"
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 relative"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
              >
                <Bell className="w-6 h-6" />
                {notifications.some((n) => !n.read) && (
                  <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-50 border">
                  <div className="px-4 py-2 border-b">
                    <h3 className="font-medium">Notifications</h3>
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`px-4 py-3 hover:bg-gray-50 ${
                            !notification.read ? "bg-blue-50/50" : ""
                          }`}
                        >
                          <p className="font-medium text-sm">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {notification.time}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-center text-gray-500">
                        <p>No notifications</p>
                      </div>
                    )}
                  </div>

                  {notifications.length > 0 && (
                    <div className="px-4 py-2 border-t text-center">
                      <button className="text-sm text-[#5551FF] hover:text-[#4440FF]">
                        Mark all as read
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Menu Dropdown */}
            <div className="relative">
              <button
                id="user-menu-button"
                className="flex items-center space-x-2"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="w-8 h-8 rounded-full bg-[#5551FF] flex items-center justify-center text-white font-medium">
                  {initials}
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border">
                  <Link
                    to="/seller/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Account Settings
                  </Link>
                  <Link
                    to="/seller/dashboard"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                  >
                    Sign Out
                  </button>
                </div>
              )}
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
