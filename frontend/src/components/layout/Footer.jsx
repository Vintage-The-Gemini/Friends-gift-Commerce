import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle,
  ExternalLink,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import Logo from "../../assets/Friends-gift-logo.svg";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);

  const handleSubscribe = (e) => {
    e.preventDefault();
    // In production, this would call an API
    if (email && /^\S+@\S+\.\S+$/.test(email)) {
      setSubscribed(true);
      setEmail("");
      // In production, add a timer to reset this after a few seconds
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const isExpanded = (section) => expandedSection === section;

  // Current year for copyright
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#5551FF] text-white">
      <div className="mx-4 md:mx-8 lg:mx-16 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <img src={Logo} alt="Friends Gift Logo" className="h-10 mb-4" />
            <p className="text-white/90 leading-relaxed">
              Making gift-giving easier and more meaningful. Create events,
              share wishlists, and celebrate special moments together.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links - Desktop */}
          <div className="hidden md:block">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="hover:text-white/80 transition-colors inline-flex items-center"
                >
                  <span>Home</span>
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

          {/* Mobile Accordion Sections */}
          <div className="md:hidden space-y-2">
            {/* Quick Links - Mobile */}
            <div className="border-b border-white/10 pb-2">
              <button
                onClick={() => toggleSection("links")}
                className="flex justify-between items-center w-full py-2"
                aria-expanded={isExpanded("links")}
              >
                <h3 className="text-lg font-semibold">Quick Links</h3>
                {isExpanded("links") ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>

              {isExpanded("links") && (
                <ul className="space-y-3 py-2 pl-2">
                  <li>
                    <Link
                      to="/"
                      className="hover:text-white/80 transition-colors"
                    >
                      Home
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
              )}
            </div>

            {/* Categories - Mobile */}
            <div className="border-b border-white/10 pb-2">
              <button
                onClick={() => toggleSection("categories")}
                className="flex justify-between items-center w-full py-2"
                aria-expanded={isExpanded("categories")}
              >
                <h3 className="text-lg font-semibold">Categories</h3>
                {isExpanded("categories") ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>

              {isExpanded("categories") && (
                <ul className="space-y-3 py-2 pl-2">
                  <li>
                    <Link
                      to="/products"
                      className="hover:text-white/80 transition-colors"
                    >
                      Electronics
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/products"
                      className="hover:text-white/80 transition-colors"
                    >
                      Fashion
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/products"
                      className="hover:text-white/80 transition-colors"
                    >
                      Home & Kitchen
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/products"
                      className="hover:text-white/80 transition-colors"
                    >
                      Beauty
                    </Link>
                  </li>
                </ul>
              )}
            </div>

            {/* Contact - Mobile */}
            <div className="border-b border-white/10 pb-2">
              <button
                onClick={() => toggleSection("contact")}
                className="flex justify-between items-center w-full py-2"
                aria-expanded={isExpanded("contact")}
              >
                <h3 className="text-lg font-semibold">Contact Us</h3>
                {isExpanded("contact") ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>

              {isExpanded("contact") && (
                <ul className="space-y-3 py-2 pl-2">
                  <li className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 opacity-80" />
                    <a
                      href="tel:+254712345678"
                      className="hover:text-white/80 transition-colors"
                    >
                      +254 712 345 678
                    </a>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 opacity-80" />
                    <a
                      href="mailto:support@friendsgift.com"
                      className="hover:text-white/80 transition-colors"
                    >
                      support@friendsgift.com
                    </a>
                  </li>
                  <li className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 opacity-80" />
                    <span>Nairobi, Kenya</span>
                  </li>
                </ul>
              )}
            </div>
          </div>

          {/* Categories - Desktop */}
          <div className="hidden md:block">
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/products"
                  className="hover:text-white/80 transition-colors"
                >
                  Electronics
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="hover:text-white/80 transition-colors"
                >
                  Fashion
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="hover:text-white/80 transition-colors"
                >
                  Home & Kitchen
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="hover:text-white/80 transition-colors"
                >
                  Beauty
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="hover:text-white/80 transition-colors inline-flex items-center"
                >
                  <span>All Categories</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-75" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter & Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Stay Updated</h3>
            <p className="text-white/80 mb-3">
              Subscribe to our newsletter for the latest updates and offers.
            </p>
            {subscribed ? (
              <div className="bg-white/10 p-3 rounded-lg flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                <span>Thank you for subscribing!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                  required
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-lg p-2 transition-colors"
                  aria-label="Subscribe"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Business Hours - Desktop only */}
            <div className="hidden md:block mt-6">
              <div className="flex items-center mb-2">
                <Clock className="w-5 h-5 mr-2 opacity-80" />
                <h4 className="font-medium">Business Hours</h4>
              </div>
              <ul className="space-y-1 text-sm text-white/80">
                <li>Monday - Friday: 9am - 6pm</li>
                <li>Saturday: 10am - 4pm</li>
                <li>Sunday: Closed</li>
              </ul>
            </div>

            {/* Contact Info - Desktop only */}
            <div className="hidden md:block mt-6">
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-white/80" />
                  <a
                    href="tel:+254712345678"
                    className="hover:text-white/80 transition-colors"
                  >
                    +254 712 345 678
                  </a>
                </li>
                <li className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-white/80" />
                  <a
                    href="mailto:support@friendsgift.com"
                    className="hover:text-white/80 transition-colors"
                  >
                    support@friendsgift.com
                  </a>
                </li>
                <li className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-white/80" />
                  <span>Nairobi, Kenya</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-white/80">
              © {currentYear} Friends Gift. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link
                to="/"
                className="text-white/80 hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/"
                className="text-white/80 hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                to="/"
                className="text-white/80 hover:text-white transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
