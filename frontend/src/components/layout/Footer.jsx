// frontend/src/components/layout/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Mail,
  Globe,
} from "lucide-react";

import Logo from "../../assets/Friends-gift-logo2.png";

const Footer = () => {
  // Current year for copyright
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#5551FF] text-white py-0 mt-0">
      <div className="container mx-auto px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12 justify-items-center text-center md:text-left pt-8">
          {/* Categories Column */}
          <div className="w-full max-w-xs">
            <h3 className="text-base font-semibold text-white mb-6 uppercase tracking-wide">
              Categories
            </h3>
            <ul className="space-y-4 text-base">
              <li>
                <Link to="/products" className="text-white/80 hover:text-white">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-white/80 hover:text-white">
                  Electronics
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-white/80 hover:text-white">
                  Fashion
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-white/80 hover:text-white">
                  Home & Kitchen
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-white/80 hover:text-white">
                  Beauty
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-white/80 hover:text-white">
                  Gifts
                </Link>
              </li>
            </ul>
          </div>

          {/* For Gift Givers Column */}
          <div className="w-full max-w-xs">
            <h3 className="text-base font-semibold text-white mb-6 uppercase tracking-wide">
              For Gift Givers
            </h3>
            <ul className="space-y-4 text-base">
              <li>
                <Link to="/" className="text-white/80 hover:text-white">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/" className="text-white/80 hover:text-white">
                  My Dashboard
                </Link>
              </li>
              <li>
                <Link to="/" className="text-white/80 hover:text-white">
                  My Events
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-white/80 hover:text-white">
                  Browse Events
                </Link>
              </li>
              <li>
                <Link
                  to="/events/create"
                  className="text-white/80 hover:text-white"
                >
                  Create Event
                </Link>
              </li>
            </ul>
          </div>

          {/* Account Column */}
          <div className="w-full max-w-xs">
            <h3 className="text-base font-semibold text-white mb-6 uppercase tracking-wide">Account</h3>
            <ul className="space-y-4 text-base">
              <li>
                <Link
                  to="/auth/signin"
                  className="text-white/80 hover:text-white"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  to="/auth/signup"
                  className="text-white/80 hover:text-white"
                >
                  Sign Up
                </Link>
              </li>
              <li>
                <Link to="/help-support" className="text-white/80 hover:text-white">
                  Help & Support
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-white/80 hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="text-white/80 hover:text-white">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-white/40 pt-6 pb-6 flex flex-col md:flex-row justify-between items-center">
          {/* Logo and Copyright */}
          <div className="flex items-center mb-6 md:mb-0">
            <Link to="/" className="mr-6">
              <img src={Logo} alt="Friends Gift Logo" className="h-50" />
            </Link>
            <span className="text-base text-white/90">
              © Friends Gift Ltd. {currentYear}
            </span>
          </div>

          {/* Social Icons and Language Selector */}
          <div className="flex items-center space-x-8">
            {/* Social Media Icons */}
            <Link
              to="/"
              aria-label="Facebook"
              className="text-white/80 hover:text-white"
            >
              <Facebook size={22} />
            </Link>
            <Link
              to="/"
              aria-label="Instagram"
              className="text-white/80 hover:text-white"
            >
              <Instagram size={22} />
            </Link>
            <Link
              to="/"
              aria-label="Twitter"
              className="text-white/80 hover:text-white"
            >
              <Twitter size={22} />
            </Link>
            <Link
              to="/"
              aria-label="LinkedIn"
              className="text-white/80 hover:text-white"
            >
              <Linkedin size={22} />
            </Link>
            <Link
              to="/"
              aria-label="Email"
              className="text-white/80 hover:text-white"
            >
              <Mail size={22} />
            </Link>

            {/* Language and Currency */}
            <div className="flex items-center text-base">
              <button className="text-white/80 hover:text-white mr-6 flex items-center">
                <Globe size={18} className="mr-2" /> English
              </button>
              <button className="text-white/80 hover:text-white">KES</button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;