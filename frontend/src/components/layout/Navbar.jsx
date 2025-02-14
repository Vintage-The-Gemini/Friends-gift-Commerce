// src/components/layout/Navbar.jsx
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  Menu,
  Plus,
  Heart,
  Calendar,
  LogOut,
  Settings,
  Gift,
} from "lucide-react";
import Logo from "../../assets/Friends-gift-logo.svg";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showEventsMenu, setShowEventsMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef(null);
  const eventsDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (
        eventsDropdownRef.current &&
        !eventsDropdownRef.current.contains(event.target)
      ) {
        setShowEventsMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          {/* Left section with Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img src={Logo} alt="Friends Gift" className="h-8" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {user && (
              <div className="relative" ref={eventsDropdownRef}>
                <button
                  onClick={() => setShowEventsMenu(!showEventsMenu)}
                  className="text-gray-700 hover:text-[#5551FF] flex items-center"
                >
                  <Gift className="w-4 h-4 mr-1" />
                  My Events
                </button>

                {showEventsMenu && (
                  <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50 border">
                    <Link
                      to="/events/create"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Plus className="w-4 h-4 mr-3" />
                      Create Event
                    </Link>
                    <Link
                      to="/my-events"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Calendar className="w-4 h-4 mr-3" />
                      My Events
                    </Link>
                    <Link
                      to="/events/invited"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Gift className="w-4 h-4 mr-3" />
                      Events I'm Invited To
                    </Link>
                  </div>
                )}
              </div>
            )}

            <Link to="/events" className="text-gray-700 hover:text-[#5551FF]">
              All Events
            </Link>
            <Link to="/products" className="text-gray-700 hover:text-[#5551FF]">
              Products
            </Link>
            {user?.role === "seller" && (
              <Link
                to="/seller/dashboard"
                className="text-gray-700 hover:text-[#5551FF]"
              >
                Seller Dashboard
              </Link>
            )}
          </div>

          {/* Right section */}
          <div className="hidden md:flex items-center space-x-4">
            {user && (
              <Link
                to="/favorites"
                className="text-gray-700 hover:text-[#5551FF]"
              >
                <Heart className="w-6 h-6" />
              </Link>
            )}

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="w-10 h-10 rounded-full bg-[#5551FF] text-white flex items-center justify-center font-semibold hover:bg-[#4440FF] transition-colors"
                >
                  {getInitial(user.name)}
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50 border">
                    <div className="px-4 py-3 border-b">
                      <p className="text-sm font-semibold text-gray-900">
                        {user.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {user.phoneNumber}
                      </p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        Settings
                      </Link>

                      <div className="border-t mt-2 pt-2">
                        <button
                          onClick={logout}
                          className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/auth/signin"
                className="bg-[#5551FF] text-white px-4 py-2 rounded-lg hover:bg-[#4440FF] transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-4">
              {user && (
                <>
                  <Link
                    to="/events/create"
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    <Plus className="w-4 h-4 mr-3" />
                    Create Event
                  </Link>
                  <Link
                    to="/my-events"
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    <Calendar className="w-4 h-4 mr-3" />
                    My Events
                  </Link>
                </>
              )}

              <Link
                to="/events"
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                All Events
              </Link>
              <Link
                to="/products"
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Products
              </Link>
              {user?.role === "seller" && (
                <Link
                  to="/seller/dashboard"
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Seller Dashboard
                </Link>
              )}

              {!user && (
                <Link
                  to="/auth/signin"
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
