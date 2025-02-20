import React from "react";
import { Link } from "react-router-dom";
import { Gift, ChevronRight } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const HeroSection = () => {
  const { user } = useAuth();

  return (
    <div className="relative bg-gradient-to-br from-[#5551FF] via-[#4440FF] to-[#FF4500] overflow-hidden">
      <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Content */}
          <div className="relative z-10 text-white max-w-xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
              Make Your Special Day
              <span className="text-[#FF4500]"> Even Better</span>
            </h1>
            <p className="text-lg mb-6 text-white/90">
              Create your perfect gift registry and let your loved ones
              contribute to your dreams.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to={user ? "/events/create" : "/auth/signin"}
                className="inline-flex items-center px-6 py-3 bg-white text-[#5551FF] rounded-full font-semibold hover:bg-[#FF4500] hover:text-white transition-all"
              >
                <Gift className="w-5 h-5 mr-2" />
                {user ? "Create Event" : "Get Started"}
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center px-6 py-3 bg-[#FF4500] text-white rounded-full font-semibold hover:bg-white hover:text-[#FF4500] transition-all"
              >
                Browse Products
                <ChevronRight className="w-5 h-5 ml-1" />
              </Link>
            </div>
          </div>

          {/* Right Content - Stats Cards */}
          <div className="relative z-10 grid grid-cols-2 gap-4">
            {[
              { title: "Active Events", value: "1,000+", color: "bg-white/20" },
              {
                title: "Happy Users",
                value: "5,000+",
                color: "bg-[#FF4500]/20",
              },
              {
                title: "Total Products",
                value: "10,000+",
                color: "bg-[#FF4500]/20",
              },
              { title: "Satisfaction", value: "95%", color: "bg-white/20" },
            ].map((stat, index) => (
              <div
                key={index}
                className={`${stat.color} backdrop-blur-sm rounded-xl p-4 text-white hover:scale-105 transition-transform`}
              >
                <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
                <p className="text-white/80 text-sm">{stat.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
