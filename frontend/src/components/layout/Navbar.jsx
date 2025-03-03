// src/components/layout/Navbar.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  Menu,
  X,
  Search,
  Gift,
  Heart,
  User,
  LogOut,
  Settings,
  Calendar,
  ChevronDown,
  ShoppingBag,
  Store,
  Bell,
  ChevronRight,
} from "lucide-react";
import Logo from "../../assets/Friends-gift-logo.svg";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
    setSearchTerm("");
    setIsSearchExpanded(false);
  };

  // Format user initials for avatar
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Navigation links
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Events", path: "/events" },
    { name: "Products", path: "/products" },
  ];

  return (
    <nav className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and main nav (desktop) */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <img className="h-8 w-auto" src={Logo} alt="Friends Gift" />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:ml-6 md:flex md:space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    location.pathname === link.path
                      ? "text-indigo-600"
                      : "text-gray-700 hover:text-indigo-600"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Search and action buttons */}
          <div className="flex items-center">
            {/* Search - desktop */}
            <div
              className={`hidden md:flex items-center ${
                isSearchExpanded ? "w-64" : "w-40"
              } transition-all duration-300`}
            >
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full pl-10 pr-3 py-1.5 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsSearchExpanded(true)}
                    onBlur={() => setIsSearchExpanded(false)}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </form>
            </div>

            {/* Action buttons */}
            <div className="flex items-center md:ml-6 space-x-2">
              {/* Create Event Button */}
              {user && (
                <Link
                  to="/events/create"
                  className="hidden sm:flex items-center text-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors px-3 py-1.5 rounded-full"
                >
                  <Gift className="h-4 w-4 mr-1" />
                  <span>Create Event</span>
                </Link>
              )}

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Heart className="h-5 w-5" />
              </Link>

              {/* User Menu */}
              {user ? (
                <div className="relative" ref={profileDropdownRef}>
                  <button
                    className="flex items-center space-x-1 p-1 border-transparent rounded-full text-gray-500 hover:text-indigo-600 focus:outline-none"
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-medium">
                      {getInitials(user.name)}
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {/* Dropdown menu */}
                  {profileDropdownOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.phoneNumber}
                        </p>
                      </div>

                      {user.role === "buyer" && (
                        <Link
                          to="/buyer/dashboard"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                          My Events
                        </Link>
                      )}

                      {user.role === "seller" && (
                        <Link
                          to="/seller/dashboard"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <Store className="h-4 w-4 mr-2 text-gray-500" />
                          Seller Dashboard
                        </Link>
                      )}

                      <Link
                        to="/profile/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <Settings className="h-4 w-4 mr-2 text-gray-500" />
                        Settings
                      </Link>

                      <div className="border-t border-gray-100">
                        <button
                          onClick={logout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/auth/signin"
                  className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800"
                >
                  <User className="h-5 w-5 mr-1" />
                  <span>Sign In</span>
                </Link>
              )}

              {/* Mobile menu button */}
              <button
                className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-indigo-600 hover:bg-gray-100"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${isMenuOpen ? "block" : "hidden"}`}>
        <div className="pt-2 pb-3 space-y-1 px-4">
          {/* Mobile search */}
          <form onSubmit={handleSearch} className="pb-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </form>

          {/* Navigation items */}
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location.pathname === link.path
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
              }`}
            >
              {link.name}
            </Link>
          ))}

          {/* Create Event (Mobile) */}
          {user && (
            <Link
              to="/events/create"
              className="flex items-center justify-between px-3 py-2 rounded-md text-base font-medium text-indigo-600 hover:bg-indigo-50"
            >
              <div className="flex items-center">
                <Gift className="h-5 w-5 mr-2" />
                Create Event
              </div>
              <ChevronRight className="h-5 w-5" />
            </Link>
          )}

          {/* Wishlist (Mobile) */}
          <Link
            to="/wishlist"
            className="flex items-center justify-between px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
          >
            <div className="flex items-center">
              <Heart className="h-5 w-5 mr-2" />
              My Wishlist
            </div>
            <ChevronRight className="h-5 w-5" />
          </Link>

          {/* Authentication links (Mobile) */}
          {user ? (
            <>
              {user.role === "buyer" && (
                <Link
                  to="/buyer/dashboard"
                  className="flex items-center justify-between px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                >
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    My Events
                  </div>
                  <ChevronRight className="h-5 w-5" />
                </Link>
              )}

              {user.role === "seller" && (
                <Link
                  to="/seller/dashboard"
                  className="flex items-center justify-between px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                >
                  <div className="flex items-center">
                    <Store className="h-5 w-5 mr-2" />
                    Seller Dashboard
                  </div>
                  <ChevronRight className="h-5 w-5" />
                </Link>
              )}

              <Link
                to="/profile/settings"
                className="flex items-center justify-between px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
              >
                <div className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Settings
                </div>
                <ChevronRight className="h-5 w-5" />
              </Link>

              <div className="border-t border-gray-200 mt-2 pt-2">
                <button
                  onClick={logout}
                  className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Sign out
                </button>
              </div>
            </>
          ) : (
            <Link
              to="/auth/signin"
              className="flex items-center justify-between px-3 py-2 rounded-md text-base font-medium bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
            >
              <div className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Sign In
              </div>
              <ChevronRight className="h-5 w-5" />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
