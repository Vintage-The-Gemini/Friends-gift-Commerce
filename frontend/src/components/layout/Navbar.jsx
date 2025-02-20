// src/components/layout/Navbar.jsx
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom"; // Changed from "react" to "react-router-dom"
import { useAuth } from "../../hooks/useAuth";
import {
  Menu,
  Plus,
  Heart,
  Calendar,
  LogOut,
  Settings,
  Gift,
  ChevronDown,
  User,
  ShoppingBag,
  Store, // Added missing Store icon
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
    if (!name) return "?";
    const names = name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const mainNavItems = [
    { label: "Events", path: "/events", icon: Gift },
    { label: "Products", path: "/products", icon: ShoppingBag },
  ];

  const userNavItems = [
    { label: "Create Event", path: "/events/create", icon: Plus },
    { label: "My Events", path: "/buyer/dashboard", icon: Calendar },
    { label: "Settings", path: "/profile/settings", icon: Settings },
  ];

  return (
    <nav className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <img src={Logo} alt="Friends Gift" className="h-8" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Main Navigation Items */}
            {mainNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="text-gray-700 hover:text-[#5551FF] flex items-center space-x-1"
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            ))}

            {/* Seller Dashboard Link */}
            {user?.role === "seller" && (
              <Link
                to="/seller/dashboard"
                className="text-gray-700 hover:text-[#5551FF] flex items-center space-x-1"
              >
                <Store className="w-4 h-4" />
                <span>Seller Dashboard</span>
              </Link>
            )}
          </div>

          {/* Right side buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {/* Wishlist Button */}
                <Link
                  to="/favorites"
                  className="p-2 text-gray-700 hover:text-[#5551FF] rounded-full hover:bg-gray-100"
                >
                  <Heart className="w-5 h-5" />
                </Link>

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#5551FF] text-white flex items-center justify-center font-medium">
                      {getInitial(user.name)}
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-2 border">
                      <div className="px-4 py-3 border-b">
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">
                          {user.phoneNumber}
                        </p>
                      </div>

                      {userNavItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50"
                        >
                          <item.icon className="w-4 h-4 mr-3" />
                          {item.label}
                        </Link>
                      ))}

                      <div className="border-t mt-2">
                        <button
                          onClick={logout}
                          className="flex w-full items-center px-4 py-2 text-red-600 hover:bg-gray-50"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                to="/auth/signin"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-[#5551FF] hover:bg-[#4440FF]"
              >
                Sign in
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {showMobileMenu && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {mainNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#5551FF] hover:bg-gray-50"
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            ))}

            {user &&
              userNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#5551FF] hover:bg-gray-50"
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              ))}

            {!user && (
              <Link
                to="/auth/signin"
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#5551FF] hover:bg-gray-50"
              >
                <User className="w-5 h-5 mr-3" />
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
