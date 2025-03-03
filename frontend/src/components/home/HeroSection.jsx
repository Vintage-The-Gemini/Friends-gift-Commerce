// src/components/home/HeroSection.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Gift, ChevronRight, CornerRightDown } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const HeroSection = () => {
  const { user } = useAuth();

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute top-0 left-0 w-full h-full bg-repeat"
          style={{
            backgroundImage:
              'url(\'data:image/svg+xml,%3Csvg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23ffffff" fill-opacity="1" fill-rule="evenodd"%3E%3Ccircle cx="3" cy="3" r="3"/%3E%3Ccircle cx="13" cy="13" r="3"/%3E%3C/g%3E%3C/svg%3E\')',
          }}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-16 pb-20 md:pt-24 md:pb-28 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center justify-center px-4 py-2 mb-6 rounded-full text-white bg-white/10 backdrop-blur-sm border border-white/20">
                <Gift className="w-5 h-5 mr-2" />
                <span>Gift Giving Made Social</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white leading-tight">
                Make Every Celebration{" "}
                <span className="text-amber-300">Extraordinary</span>
              </h1>

              <p className="text-lg md:text-xl mb-8 text-white/90 max-w-xl mx-auto lg:mx-0">
                Create events, share wishlists, and let friends contribute to
                meaningful gifts that matter.
              </p>

              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <Link
                  to={user ? "/events/create" : "/auth/signin"}
                  className="inline-flex items-center px-6 py-3 bg-white text-purple-700 rounded-full font-semibold hover:bg-amber-300 hover:text-purple-800 transition-all"
                >
                  <Gift className="w-5 h-5 mr-2" />
                  {user ? "Create Event" : "Get Started"}
                </Link>

                <Link
                  to="/products"
                  className="inline-flex items-center px-6 py-3 bg-purple-800/30 backdrop-blur-sm text-white border border-white/20 rounded-full font-semibold hover:bg-purple-800/50 transition-all"
                >
                  Explore Products
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Link>
              </div>

              <div className="mt-8 text-white/80 text-sm hidden md:block">
                <div className="flex items-center justify-center lg:justify-start">
                  <div className="flex -space-x-2 mr-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full ring-2 ring-purple-600 bg-purple-500 flex items-center justify-center text-xs font-bold"
                      >
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <span>Join thousands of happy users</span>
                </div>
              </div>
            </div>

            {/* Right Content - Gift Mockup */}
            <div className="relative hidden lg:block">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-400 rounded-full filter blur-3xl opacity-20"></div>

              <div className="relative bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl transform rotate-2">
                <div className="absolute -top-3 -left-3 bg-amber-400 rounded-full px-4 py-1 text-sm font-bold text-purple-900">
                  Wedding Registry
                </div>
                <div className="flex flex-col space-y-4">
                  <div className="h-48 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                    <Gift className="w-16 h-16 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl text-white font-semibold">
                      Sarah & Mike's Wedding
                    </h3>
                    <p className="text-white/80">October 15, 2025</p>
                    <div className="w-full bg-white/20 h-2.5 rounded-full">
                      <div className="bg-amber-400 h-2.5 rounded-full w-3/4"></div>
                    </div>
                    <div className="flex justify-between text-sm text-white/80">
                      <span>75% Funded</span>
                      <span>15 days left</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-10 -left-8 transform -rotate-6">
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 shadow-lg max-w-[200px]">
                  <div className="flex gap-3 items-center">
                    <Gift className="w-10 h-10 text-amber-300" />
                    <div className="text-white">
                      <p className="font-medium">New Gift!</p>
                      <p className="text-xs">Alex contributed $50</p>
                    </div>
                  </div>
                </div>
                <CornerRightDown className="text-white/80 w-6 h-6 ml-8 mt-2" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="w-full h-12 text-gray-50"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C0,0,0,0,0,0C0,0,0,0,0,0C0,0,0,0,0,0C0,0,0,0,0,0C0,0,0,0,0,0C0,0,0,0,0,0Q0,0,0,0C0,0,0,0,0,0C0,0,0,0,0,0.19c14.83,2.97,29.66,5.94,44.5,8.9C125.43,33.27,196.86,56,321.39,56.44Z"
            fill="currentColor"
          ></path>
        </svg>
      </div>
    </div>
  );
};

export default HeroSection;
