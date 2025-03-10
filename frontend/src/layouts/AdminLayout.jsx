// frontend/src/layouts/AdminLayout.jsx
import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Package,
  CalendarDays,
  Tag,
  ShoppingBag,
  Settings,
  ChevronRight,
  Menu,
  X,
  LogOut,
  Search,
  Bell,
  User,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);

  // Mock notifications - in a real app, these would come from an API
  useEffect(() => {
    setNotifications([
      {
        id: 1,
        title: "New Seller Registration",
        message: "A new seller has registered and needs approval",
        time: "5 minutes ago",
        read: false,
      },
      {
        id: 2,
        title: "Order Completed",
        message: "Order #1234 has been marked as completed",
        time: "1 hour ago",
        read: false,
      },
      {
        id: 3,
        title: "System Update",
        message: "System will undergo maintenance tonight at 2 AM",
        time: "3 hours ago",
        read: true,
      },
    ]);
  }, []);

  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/auth/signin");
    }
  }, [user, navigate]);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    setSidebarMobileOpen(false);
  }, [location.pathname]);

  // Navigation config
  const navigation = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      name: "Users",
      path: "/admin/users",
      icon: <Users size={20} />,
    },
    {
      name: "Sellers",
      path: "/admin/sellers",
      icon: <User size={20} />,
    },
    {
      name: "Products",
      path: "/admin/products",
      icon: <Package size={20} />,
    },
    {
      name: "Events",
      path: "/admin/events",
      icon: <CalendarDays size={20} />,
    },
    {
      name: "Categories",
      path: "/admin/categories",
      icon: <Tag size={20} />,
    },
    {
      name: "Orders",
      path: "/admin/orders",
      icon: <ShoppingBag size={20} />,
    },
    {
      name: "Settings",
      path: "/admin/settings",
      icon: <Settings size={20} />,
    },
  ];

  // Toggle sidebar on desktop
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  // Get current user initials for avatar
  const getUserInitials = () => {
    if (!user || !user.name) return "A";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Get unread notifications count
  const getUnreadCount = () => {
    return notifications.filter((notification) => !notification.read).length;
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarMobileOpen(false)}
        />
      )}

      {/* Sidebar for mobile */}
      <div
        className={`fixed inset-y-0 left-0 flex flex-col z-50 max-w-xs w-full bg-indigo-800 transform ease-in-out duration-300 lg:hidden ${
          sidebarMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 bg-indigo-900">
          <div className="flex items-center">
            <span className="text-xl font-semibold text-white">
              Admin Panel
            </span>
          </div>
          <button
            onClick={() => setSidebarMobileOpen(false)}
            className="text-gray-300 hover:text-white focus:outline-none"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? "bg-indigo-900 text-white"
                      : "text-indigo-100 hover:bg-indigo-700"
                  }`
                }
              >
                <div className="mr-3">{item.icon}</div>
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="border-t border-indigo-700 p-4">
          <button
            onClick={handleLogout}
            className="flex items-center px-3 py-2 text-sm font-medium text-indigo-100 hover:bg-indigo-700 rounded-md w-full"
          >
            <LogOut size={20} className="mr-3" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Sidebar for desktop */}
      <div
        className={`hidden lg:flex lg:flex-col lg:flex-shrink-0 transition-all duration-300 ease-in-out ${
          sidebarOpen ? "lg:w-64" : "lg:w-20"
        } fixed inset-y-0 z-50`}
      >
        <div className="flex flex-col h-full bg-indigo-800">
          <div className="flex items-center justify-between h-16 px-4 bg-indigo-900">
            <div className="flex items-center">
              {sidebarOpen ? (
                <span className="text-xl font-semibold text-white">
                  Admin Panel
                </span>
              ) : (
                <span className="text-xl font-semibold text-white">AP</span>
              )}
            </div>
            <button
              onClick={toggleSidebar}
              className="text-gray-300 hover:text-white focus:outline-none"
            >
              {sidebarOpen ? (
                <ChevronsLeft size={20} />
              ) : (
                <ChevronsRight size={20} />
              )}
            </button>
          </div>

          <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? "bg-indigo-900 text-white"
                        : "text-indigo-100 hover:bg-indigo-700"
                    }`
                  }
                  title={item.name}
                >
                  <div className="mr-3">{item.icon}</div>
                  {sidebarOpen && item.name}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="border-t border-indigo-700 p-4">
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 text-sm font-medium text-indigo-100 hover:bg-indigo-700 rounded-md w-full"
              title="Sign Out"
            >
              <LogOut size={20} className="mr-3" />
              {sidebarOpen && "Sign Out"}
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div
        className={`flex flex-col flex-1 transition-all duration-300 ease-in-out ${
          sidebarOpen ? "lg:pl-64" : "lg:pl-20"
        }`}
      >
        {/* Top header */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <button
                  onClick={() => setSidebarMobileOpen(true)}
                  className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden"
                >
                  <Menu size={24} />
                </button>
                {/* Optional: Add breadcrumbs or page title here */}
              </div>

              <div className="flex items-center">
                {/* Search bar */}
                <div className="hidden md:block">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search..."
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                {/* Notifications dropdown */}
                <div className="ml-4 relative">
                  <button
                    onClick={() =>
                      setNotificationMenuOpen(!notificationMenuOpen)
                    }
                    className="flex items-center text-gray-500 hover:text-gray-700 focus:outline-none relative"
                  >
                    <Bell size={20} />
                    {getUnreadCount() > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                        {getUnreadCount()}
                      </span>
                    )}
                  </button>

                  {notificationMenuOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                      <div className="py-2 px-3 border-b border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-700">
                          Notifications
                        </h3>
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 ${
                                !notification.read ? "bg-blue-50" : ""
                              }`}
                            >
                              <p className="text-sm font-medium text-gray-900">
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {notification.time}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-sm text-gray-500">
                            No notifications
                          </div>
                        )}
                      </div>
                      <div className="py-2 px-3 border-t border-gray-200">
                        <button className="text-xs font-medium text-indigo-600 hover:text-indigo-800">
                          Mark all as read
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* User dropdown */}
                <div className="ml-4 relative">
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center space-x-3 text-gray-700 focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                      {getUserInitials()}
                    </div>
                    <div className="hidden md:block text-left">
                      <span className="block text-sm font-medium">
                        {user?.name || "Admin User"}
                      </span>
                      <span className="block text-xs text-gray-500">
                        {user?.role || "admin"}
                      </span>
                    </div>
                  </button>

                  {profileMenuOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                      <div className="py-1">
                        <a
                          href="#profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Your Profile
                        </a>
                        <a
                          href="#settings"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Settings
                        </a>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-100">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
