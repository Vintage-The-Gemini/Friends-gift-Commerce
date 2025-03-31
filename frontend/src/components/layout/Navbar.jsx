import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  Menu,
  X,
  User,
  Gift,
  ShoppingBag,
  LogOut,
  Package,
  Store,
  BarChart,
  Settings,
  Calendar,
  DollarSign,
  ChevronDown,
  ShoppingCart,
  Bell,
  Heart,
} from "lucide-react";
import Logo from "../../assets/Friends-gift-logo.svg";

const NavBar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);

  // Simulated state - in production this would come from a real notification system
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New contribution",
      message: "Alex contributed to your event",
      unread: true,
      time: "5m ago",
    },
    {
      id: 2,
      title: "Event reminder",
      message: "Sarah's birthday is tomorrow",
      unread: true,
      time: "1h ago",
    },
  ]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMobileMenu();
    navigate("/");
  };

  const toggleProfileDropdown = (e) => {
    e.stopPropagation();
    setProfileDropdownOpen(!profileDropdownOpen);
    if (notificationsOpen) setNotificationsOpen(false);
  };

  const toggleNotifications = (e) => {
    e.stopPropagation();
    setNotificationsOpen(!notificationsOpen);
    if (profileDropdownOpen) setProfileDropdownOpen(false);

    // Mark notifications as read when opened
    if (!notificationsOpen && hasUnreadNotifications) {
      setHasUnreadNotifications(false);
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, unread: false }))
      );
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    let profileTimeoutId;
    let notificationsTimeoutId;

    const handleClickOutside = (event) => {
      // Handle profile dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // Use a slight delay to prevent accidental closing
        profileTimeoutId = setTimeout(() => {
          setProfileDropdownOpen(false);
        }, 100);
      }

      // Handle notifications dropdown
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        notificationsTimeoutId = setTimeout(() => {
          setNotificationsOpen(false);
        }, 100);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      clearTimeout(profileTimeoutId);
      clearTimeout(notificationsTimeoutId);
    };
  }, []);

  // Stop propagation to prevent closing when clicking inside dropdown
  const handleDropdownClick = (e) => {
    e.stopPropagation();
  };

  // Consistent active link styling
  const getNavLinkClass = (path) => {
    const isPathActive =
      location.pathname === path || location.pathname.startsWith(`${path}/`);

    return `transition-colors px-3 py-2 rounded-md ${
      isPathActive
        ? "text-[#5551FF] font-medium"
        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
    }`;
  };

  // Determine display name
  const getDisplayName = () => {
    if (!user) return "";
    if (user.businessName && user.role === "seller") return user.businessName;
    return user.name || user.phoneNumber || "User";
  };

  // Seller Navigation Links - Simplified
  const sellerLinks = [
    {
      path: "/seller/dashboard",
      icon: <BarChart className="w-4 h-4 mr-2" />,
      label: "Dashboard",
    },
    {
      path: "/seller/products",
      icon: <Package className="w-4 h-4 mr-2" />,
      label: "Products",
    },
    {
      path: "/seller/orders",
      icon: <ShoppingCart className="w-4 h-4 mr-2" />,
      label: "Orders",
    },
    {
      path: "/seller/profile",
      icon: <Store className="w-4 h-4 mr-2" />,
      label: "Profile",
    },
    {
      path: "/seller/settings",
      icon: <Settings className="w-4 h-4 mr-2" />,
      label: "Settings",
    },
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" onClick={closeMobileMenu}>
              <img src={Logo} alt="FriendsGift Logo" className="h-25 w-20" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={getNavLinkClass("/")}
              onClick={closeMobileMenu}
            >
              Home
            </Link>
            <Link
              to="/events"
              className={getNavLinkClass("/events")}
              onClick={closeMobileMenu}
            >
              Public Events
            </Link>
            <Link
              to="/products"
              className={getNavLinkClass("/products")}
              onClick={closeMobileMenu}
            >
              Gifts
            </Link>
            {user && (
              <Link
                to="/events/my-events"
                className={getNavLinkClass("/events/my-events")}
                onClick={closeMobileMenu}
              >
                My Events
              </Link>
            )}
            {user && user.role === "seller" && (
              <Link
                to="/seller/dashboard"
                className={getNavLinkClass("/seller/dashboard")}
                onClick={closeMobileMenu}
              >
                Seller Portal
              </Link>
            )}
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={toggleNotifications}
                    className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors relative"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {hasUnreadNotifications && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white"></span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {notificationsOpen && (
                    <div
                      ref={notificationsRef}
                      className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-200 ease-in-out z-50"
                      onClick={handleDropdownClick}
                    >
                      <div className="px-4 py-3 border-b border-gray-100">
                        <h3 className="font-medium">Notifications</h3>
                      </div>

                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-6 text-center text-gray-500">
                            <p>No notifications</p>
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                                notification.unread ? "bg-indigo-50/50" : ""
                              }`}
                            >
                              <div className="flex justify-between">
                                <p className="font-medium text-sm">
                                  {notification.title}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {notification.time}
                                </p>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.message}
                              </p>
                            </div>
                          ))
                        )}
                      </div>

                      {notifications.length > 0 && (
                        <div className="px-4 py-2 border-t border-gray-100 text-center">
                          <button className="text-sm text-indigo-600">
                            Mark all as read
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Wishlist */}
                <Link
                  to="/wishlist"
                  className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                  aria-label="Wishlist"
                >
                  <Heart className="w-5 h-5" />
                </Link>

                {/* Create Event Button */}
                {user && (
                  <Link
                    to="/events/create"
                    className="px-4 py-2 bg-[#5551FF] text-white rounded-lg hover:bg-[#4440FF] transition-colors flex items-center"
                    onClick={closeMobileMenu}
                  >
                    <Gift className="h-4 w-4 mr-2" />
                    <span>Create Event</span>
                  </Link>
                )}

                {/* User Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={toggleProfileDropdown}
                    className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#5551FF]/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-[#5551FF]" />
                    </div>
                    <span className="max-w-[120px] truncate">
                      {getDisplayName()}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        profileDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Profile Dropdown */}
                  {profileDropdownOpen && (
                    <div
                      ref={dropdownRef}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 transform transition-all duration-200 ease-in-out"
                      onClick={handleDropdownClick}
                    >
                      {user.role === "seller" && (
                        <>
                          <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                            Seller Portal
                          </div>
                          <Link
                            to="/seller/dashboard"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center"
                            onClick={() => setProfileDropdownOpen(false)}
                          >
                            <BarChart className="h-4 w-4 mr-2" />
                            Dashboard
                          </Link>
                          <Link
                            to="/seller/products"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center"
                            onClick={() => setProfileDropdownOpen(false)}
                          >
                            <Package className="h-4 w-4 mr-2" />
                            Products
                          </Link>
                          <div className="border-t border-gray-100 my-1"></div>
                        </>
                      )}
                      {user.role === "buyer" && (
                        <Link
                          to="/events/create"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <Gift className="h-4 w-4 mr-2" />
                          Create Event
                        </Link>
                      )}
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/auth/signin"
                  className="px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  onClick={closeMobileMenu}
                >
                  Sign In
                </Link>
                <Link
                  to="/auth/signup"
                  className="px-4 py-2 bg-[#5551FF] text-white rounded-lg hover:bg-[#4440FF] transition-colors"
                  onClick={closeMobileMenu}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-500 hover:text-gray-600 focus:outline-none focus:text-gray-600"
              onClick={toggleMobileMenu}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden bg-white shadow-md z-40 transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } fixed top-16 left-0 right-0 bottom-0 overflow-y-auto`}
      >
        {user ? (
          <div className="flex items-center space-x-3 mb-4 p-4 bg-gray-50">
            <div className="w-10 h-10 rounded-full bg-[#5551FF]/10 flex items-center justify-center">
              <User className="h-5 w-5 text-[#5551FF]" />
            </div>
            <div>
              <div className="font-medium">{getDisplayName()}</div>
              <div className="text-sm text-gray-500">
                {user.role === "seller" ? "Seller Account" : "Buyer Account"}
              </div>
            </div>
          </div>
        ) : null}

        {/* Main Nav Links */}
        <div className="flex flex-col p-4 space-y-2">
          <Link
            to="/"
            className={getNavLinkClass("/")}
            onClick={closeMobileMenu}
          >
            Home
          </Link>
          <Link
            to="/events"
            className={getNavLinkClass("/events")}
            onClick={closeMobileMenu}
          >
            Public Events
          </Link>
          <Link
            to="/products"
            className={getNavLinkClass("/products")}
            onClick={closeMobileMenu}
          >
            Products
          </Link>

          {user && (
            <>
              <Link
                to="/events/my-events"
                className={getNavLinkClass("/events/my-events")}
                onClick={closeMobileMenu}
              >
                <Calendar className="w-4 h-4 mr-2 inline-block" />
                My Events
              </Link>
              
              {user.role === "buyer" && (
                <Link
                  to="/events/create"
                  className={getNavLinkClass("/events/create")}
                  onClick={closeMobileMenu}
                >
                  <Gift className="w-4 h-4 mr-2 inline-block" />
                  Create Event
                </Link>
              )}

              <Link
                to="/events/create"
                className="px-3 py-2 bg-[#5551FF] text-white rounded-md flex items-center justify-center transition-colors"
                onClick={closeMobileMenu}
              >
                <Gift className="h-4 w-4 mr-2" />
                <span>Create Event</span>
              </Link>
            </>
          )}

          {/* Seller Specific Links */}
          {user && user.role === "seller" && (
            <>
              <div className="border-t border-gray-200 my-2 pt-2">
                <div className="px-3 py-1 text-xs text-gray-500 font-semibold">
                  SELLER PORTAL
                </div>

                {sellerLinks.slice(0, 3).map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={getNavLinkClass(link.path)}
                    onClick={closeMobileMenu}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                ))}
              </div>
            </>
          )}

          {/* Auth Links */}
          {!user ? (
            <div className="border-t border-gray-200 my-2 pt-2">
              <div className="grid grid-cols-2 gap-3 mt-3">
                <Link
                  to="/auth/signin"
                  className="px-3 py-2 text-center text-gray-700 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
                  onClick={closeMobileMenu}
                >
                  Sign In
                </Link>
                <Link
                  to="/auth/signup"
                  className="px-3 py-2 text-center bg-[#5551FF] text-white rounded-md hover:bg-[#4440FF] transition-colors"
                  onClick={closeMobileMenu}
                >
                  Sign Up
                </Link>
              </div>
            </div>
          ) : (
            <div className="border-t border-gray-200 my-2 pt-2">
              <button
                onClick={handleLogout}
                className="w-full px-3 py-2 rounded-md text-red-600 hover:bg-red-50 transition-colors flex items-center"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;