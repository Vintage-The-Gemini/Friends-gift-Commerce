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
        {/* Main Footer Content - Reduced vertical spacing */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-4 justify-items-center text-center md:text-left pt-8">
          {/* Categories Column */}
          <div className="w-full max-w-xs">
            <h3 className="text-base font-semibold text-white mb-3 uppercase tracking-wide">
              Categories
            </h3>
            <ul className="space-y-2 text-base">
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
            <h3 className="text-base font-semibold text-white mb-3 uppercase tracking-wide">
              For Gift Givers
            </h3>
            <ul className="space-y-2 text-base">
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
            <h3 className="text-base font-semibold text-white mb-3 uppercase tracking-wide">Account</h3>
            <ul className="space-y-2 text-base">
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
              <li>
                <a
                  href="https://friends-gifts-commerce-67e63--testing-wu87kkga.web.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-white"
                >
                  Test Environment
                </a>
              </li>
            </ul>
          </div>

          {/* Developer & Testing Column - Removed */}
        </div>

        {/* Footer Bottom - Fixed height for logo container */}
        <div className="border-t border-white/40 pt-3 pb-3">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Logo and Copyright - Taller fixed height container */}
            <div className="flex items-center mb-3 md:mb-0">
              <div className="mr-6 h-16 flex items-center">
                <img 
                  src={Logo} 
                  alt="Friends Gift Logo" 
                  className="h-30" 
                />
              </div>
              <div className="flex flex-col">
                <span className="text-base text-white/90">
                  © Friends Gift Ltd. {currentYear}
                </span>
                <span className="text-xs text-white/70">
                  Gift giving made simple and meaningful
                </span>
              </div>
            </div>

            {/* Social Icons and Language Selector */}
            <div className="flex items-center space-x-6">
              {/* Social Media Icons */}
              <Link
                to="/"
                aria-label="Facebook"
                className="text-white/80 hover:text-white transition-colors"
              >
                <Facebook size={20} />
              </Link>
              <Link
                to="/"
                aria-label="Instagram"
                className="text-white/80 hover:text-white transition-colors"
              >
                <Instagram size={20} />
              </Link>
              <Link
                to="/"
                aria-label="Twitter"
                className="text-white/80 hover:text-white transition-colors"
              >
                <Twitter size={20} />
              </Link>
              <Link
                to="/"
                aria-label="LinkedIn"
                className="text-white/80 hover:text-white transition-colors"
              >
                <Linkedin size={20} />
              </Link>
              <Link
                to="/"
                aria-label="Email"
                className="text-white/80 hover:text-white transition-colors"
              >
                <Mail size={20} />
              </Link>

              {/* Language and Currency */}
              <div className="flex items-center text-base">
                <button className="text-white/80 hover:text-white mr-6 flex items-center transition-colors">
                  <Globe size={16} className="mr-2" /> English
                </button>
                <button className="text-white/80 hover:text-white transition-colors">KES</button>
              </div>
            </div>
          </div>

          {/* Additional Footer Info */}
          <div className="mt-2 pt-2 border-t border-white/20 text-center">
            <div className="flex flex-col md:flex-row justify-center items-center gap-4 text-xs text-white/60">
              <span>Version 1.0.0</span>
              <span className="hidden md:inline">•</span>
              <span>Made with ❤️ in Kenya</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
    
  );
};

export default Footer;