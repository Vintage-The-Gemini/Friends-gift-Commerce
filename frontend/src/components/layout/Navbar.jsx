import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Menu, X, User, Gift, ShoppingBag, LogOut } from "lucide-react";

const NavBar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMobileMenu();
  };

  const isActive = (path) => {
    return location.pathname === path
      ? "text-[#5551FF] font-medium"
      : "text-gray-600 hover:text-gray-900";
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              to="/"
              className="flex items-center"
              onClick={closeMobileMenu}
            >
              <Gift className="h-8 w-8 text-[#5551FF]" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                FriendsGift
              </span>
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
              Products
            </Link>

            {/* My Events link for authenticated users */}
            {user && (
              <Link
                to="/events/my-events"
                className={isActive("/events/my-events")}
                onClick={closeMobileMenu}
              >
                My Events
              </Link>
            )}
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="relative group">
                  <button className="flex items-center text-gray-700 hover:text-gray-900">
                    <User className="h-5 w-5 mr-1" />
                    <span>{user.name || user.phoneNumber}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block">
                    {/* Seller specific links */}
                    {user.role === "seller" && (
                      <Link
                        to="/seller/products"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={closeMobileMenu}
                      >
                        <div className="flex items-center">
                          <ShoppingBag className="h-4 w-4 mr-2" />
                          My Products
                        </div>
                      </Link>
                    )}

                    {/* Logout button */}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <div className="flex items-center">
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </div>
                    </button>
                  </div>
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
              aria-label="Toggle menu"
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
          <div className="flex flex-col space-y-4">
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

            {/* My Events link for authenticated users */}
            {user && (
              <Link
                to="/events/my-events"
                className={`px-3 py-2 rounded-md ${isActive(
                  "/events/my-events"
                )}`}
                onClick={closeMobileMenu}
              >
                My Events
              </Link>
            )}

            {/* Seller specific links */}
            {user && user.role === "seller" && (
              <Link
                to="/seller/products"
                className={`px-3 py-2 rounded-md ${isActive(
                  "/seller/products"
                )}`}
                onClick={closeMobileMenu}
              >
                My Products
              </Link>
            )}

            {/* Authentication */}
            {!user ? (
              <>
                <div className="border-t border-gray-200 my-2"></div>
                <div className="flex flex-col space-y-2">
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
              </>
            ) : (
              <>
                <div className="border-t border-gray-200 my-2"></div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-red-600 hover:bg-red-50 w-full text-left flex items-center"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
