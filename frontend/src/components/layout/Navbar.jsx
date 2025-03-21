import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import Logo from "../../assets/Friends-gift-logo.svg";

const NavBar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

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
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setProfileDropdownOpen(false);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Stop propagation to prevent closing when clicking inside dropdown
  const handleDropdownClick = (e) => {
    e.stopPropagation();
  };

  // Check if a path is active
  const isActive = (path) => {
    return location.pathname === path ||
      location.pathname.startsWith(path + "/")
      ? "text-[#5551FF] font-medium"
      : "text-gray-600 hover:text-gray-900";
  };

  // Determine display name
  const getDisplayName = () => {
    if (!user) return "";
    if (user.businessName && user.role === "seller") return user.businessName;
    return user.name || user.phoneNumber || "User";
  };

  // Seller Navigation Links
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
      path: "/seller/events",
      icon: <Gift className="w-4 h-4 mr-2" />,
      label: "Events",
    },
    {
      path: "/seller/analytics",
      icon: <DollarSign className="w-4 h-4 mr-2" />,
      label: "Analytics",
    },
    {
      path: "/seller/profile",
      icon: <Store className="w-4 h-4 mr-2" />,
      label: "Business Profile",
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
            <Link to="/" className={isActive("/")} onClick={closeMobileMenu}>
              Home
            </Link>
            <Link
              to="/events"
              className={isActive("/events")}
              onClick={closeMobileMenu}
            >
              Public Events
            </Link>
            <Link
              to="/products"
              className={isActive("/products")}
              onClick={closeMobileMenu}
            >
              Gifts
            </Link>
            {user && (
              <Link
                to="/events/my-events"
                className={isActive("/events/my-events")}
                onClick={closeMobileMenu}
              >
                My Events
              </Link>
            )}
            {user && user.role === "seller" && (
              <>
                <Link
                  to="/seller/products"
                  className={isActive("/seller/products")}
                  onClick={closeMobileMenu}
                >
                  My Products
                </Link>
                <Link
                  to="/seller/dashboard"
                  className={isActive("/seller/dashboard")}
                  onClick={closeMobileMenu}
                >
                  Seller Dashboard
                </Link>
              </>
            )}
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                {/* Create Event Button */}
                {user && (
                  <Link
                    to="/events/create"
                    className="px-4 py-2 bg-[#5551FF] text-white rounded-lg hover:bg-[#4440FF] flex items-center"
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
                    className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#5551FF]/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-[#5551FF]" />
                    </div>
                    <span>{getDisplayName()}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        profileDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {profileDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20"
                      onClick={handleDropdownClick}
                    >
                      {user.role === "seller" && (
                        <>
                          <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                            Seller Account
                          </div>
                          <Link
                            to="/seller/dashboard"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            onClick={() => setProfileDropdownOpen(false)}
                          >
                            <Store className="h-4 w-4 mr-2" />
                            Seller Dashboard
                          </Link>
                          <Link
                            to="/seller/products"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            onClick={() => setProfileDropdownOpen(false)}
                          >
                            <Package className="h-4 w-4 mr-2" />
                            My Products
                          </Link>
                          <Link
                            to="/seller/orders"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            onClick={() => setProfileDropdownOpen(false)}
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Orders
                          </Link>
                          <div className="border-t border-gray-100 my-1"></div>
                        </>
                      )}
                      <Link
                        to="/events/my-events"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        My Events
                      </Link>
                      <Link
                        to="/dashboard/contributions"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <DollarSign className="h-4 w-4 mr-2" />
                        My Contributions
                      </Link>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
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
                  className="px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
                  onClick={closeMobileMenu}
                >
                  Sign In
                </Link>
                <Link
                  to="/auth/signup"
                  className="px-4 py-2 bg-[#5551FF] text-white rounded-lg hover:bg-[#4440FF]"
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
      {mobileMenuOpen && (
        <div className="md:hidden bg-white pt-2 pb-4 px-4 shadow-md">
          {user ? (
            <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 rounded-lg">
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
          <div className="flex flex-col space-y-3">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md ${isActive("/")}`}
              onClick={closeMobileMenu}
            >
              Home
            </Link>
            <Link
              to="/events"
              className={`px-3 py-2 rounded-md ${isActive("/events")}`}
              onClick={closeMobileMenu}
            >
              Public Events
            </Link>
            <Link
              to="/products"
              className={`px-3 py-2 rounded-md ${isActive("/products")}`}
              onClick={closeMobileMenu}
            >
              Products
            </Link>

            {user && (
              <>
                <Link
                  to="/events/my-events"
                  className={`px-3 py-2 rounded-md ${isActive(
                    "/events/my-events"
                  )}`}
                  onClick={closeMobileMenu}
                >
                  <Calendar className="w-4 h-4 mr-2 inline-block" />
                  My Events
                </Link>

                <Link
                  to="/events/create"
                  className="px-3 py-2 bg-[#5551FF] text-white rounded-md flex items-center justify-center"
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
                    SELLER ACCOUNT
                  </div>

                  {sellerLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`px-3 py-2 rounded-md flex items-center ${isActive(
                        link.path
                      )}`}
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
                    className="px-3 py-2 text-center text-gray-700 rounded-md border border-gray-300 hover:bg-gray-50"
                    onClick={closeMobileMenu}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/auth/signup"
                    className="px-3 py-2 text-center bg-[#5551FF] text-white rounded-md hover:bg-[#4440FF]"
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
                  className="w-full px-3 py-2 rounded-md text-red-600 hover:bg-red-50 flex items-center"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
