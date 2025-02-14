import React from "react";
import { Link } from "react-router-dom";
import { Gift, ChevronRight } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const Hero = () => {
  const { user } = useAuth();

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#5551FF] to-[#3F3D99] text-white">
      <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center py-16 md:py-24">
          {/* Left Content */}
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Make Gift-Giving
              <span className="text-yellow-300"> Memorable</span>
            </h1>
            <p className="text-lg md:text-xl mb-8 text-white/90 leading-relaxed">
              Create your perfect gift registry, share with loved ones, and make
              your special moments even more meaningful.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to={user ? "/events/create" : "/auth/signin"}
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-[#5551FF] rounded-full font-semibold hover:bg-opacity-90 transition-all group"
              >
                {user ? "Create Event" : "Get Started"}
                <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/events"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white rounded-full font-semibold hover:bg-white/10 transition-colors"
              >
                Browse Events
              </Link>
            </div>
          </div>

          {/* Right Content - Stats */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <Gift className="w-8 h-8 mb-4 text-yellow-300" />
                <h3 className="text-2xl font-bold mb-2">1,000+</h3>
                <p className="text-white/80">Happy Events</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <Users className="w-8 h-8 mb-4 text-yellow-300" />
                <h3 className="text-2xl font-bold mb-2">5,000+</h3>
                <p className="text-white/80">Active Users</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <ShoppingBag className="w-8 h-8 mb-4 text-yellow-300" />
                <h3 className="text-2xl font-bold mb-2">10,000+</h3>
                <p className="text-white/80">Products</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <Heart className="w-8 h-8 mb-4 text-yellow-300" />
                <h3 className="text-2xl font-bold mb-2">95%</h3>
                <p className="text-white/80">Satisfaction</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
