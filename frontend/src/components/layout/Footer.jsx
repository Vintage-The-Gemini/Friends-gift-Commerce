import React from "react";
import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

import Logo from "../../assets/Friends-gift-logo.svg";

const Footer = () => {
  return (
    <footer className="bg-[#5551FF] text-white">
      <div className="mx-4 md:mx-8 lg:mx-16 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <img src={Logo} alt="Friends Gift Logo" className="h-10 mb-4" />
            <p className="text-white/80 leading-relaxed">
              Making gift-giving easier and more meaningful. Create events,
              share wishlists, and celebrate special moments together.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-white/80 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-white/80 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-white/80 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about"
                  className="hover:text-white/80 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/events"
                  className="hover:text-white/80 transition-colors"
                >
                  Browse Events
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="hover:text-white/80 transition-colors"
                >
                  Shop Products
                </Link>
              </li>
              <li>
                <Link
                  to="/auth/signup"
                  className="hover:text-white/80 transition-colors"
                >
                  Create Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/products/electronics"
                  className="hover:text-white/80 transition-colors"
                >
                  Electronics
                </Link>
              </li>
              <li>
                <Link
                  to="/products/fashion"
                  className="hover:text-white/80 transition-colors"
                >
                  Fashion
                </Link>
              </li>
              <li>
                <Link
                  to="/products/home-kitchen"
                  className="hover:text-white/80 transition-colors"
                >
                  Home & Kitchen
                </Link>
              </li>
              <li>
                <Link
                  to="/products/beauty"
                  className="hover:text-white/80 transition-colors"
                >
                  Beauty
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5" />
                <span>+254 712 345 678</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5" />
                <span>support@friendsgift.com</span>
              </li>
              <li className="flex items-center space-x-3">
                <MapPin className="w-5 h-5" />
                <span>Nairobi, Kenya</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-white/80">
              © {new Date().getFullYear()} Friends Gift. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link
                to="/privacy"
                className="text-white/80 hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="text-white/80 hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
