// src/pages/public/HomePage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Gift,
  ChevronRight,
  Calendar,
  Users,
  CreditCard,
  Heart,
  ArrowRight,
  Star,
  Clock,
  ShoppingBag,
} from "lucide-react";
import { eventService } from "../../services/api/event";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";
import EventCard from "../../components/events/EventCard";
import PopularProductsSection from "../../components/home/PopularProductsSection";

const HomePage = () => {
  const { user } = useAuth();
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState({
    events: true,
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFeaturedEvents();
  }, []);

  const fetchFeaturedEvents = async () => {
    try {
      const response = await eventService.getEvents({
        status: "active",
        limit: 3,
      });

      if (response.success) {
        setFeaturedEvents(response.data.slice(0, 3)); // Limit to 3 events
      }
    } catch (error) {
      console.error("Error fetching featured events:", error);
    } finally {
      setLoading((prev) => ({ ...prev, events: false }));
    }
  };

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-700 to-purple-800 text-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0 bg-repeat"
            style={{
              backgroundImage:
                'url(\'data:image/svg+xml,%3Csvg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23ffffff" fill-opacity="1" fill-rule="evenodd"%3E%3Ccircle cx="3" cy="3" r="3"/%3E%3Ccircle cx="13" cy="13" r="3"/%3E%3C/g%3E%3C/svg%3E\')',
            }}
          ></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pt-20 pb-24 md:pt-28 md:pb-32 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center px-4 py-2 mb-6 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                  <Gift className="w-5 h-5 mr-2" />
                  <span>Gift Giving Made Social</span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  Make Every Celebration{" "}
                  <span className="text-amber-300">Extraordinary</span>
                </h1>

                <p className="text-lg md:text-xl mb-8 text-white/80 max-w-xl mx-auto lg:mx-0">
                  Create events, share wishlists, and let friends contribute to
                  meaningful gifts that matter.
                </p>

                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                  <Link
                    to="/products"
                    className="inline-flex items-center px-6 py-3 bg-white text-purple-700 rounded-full font-semibold hover:bg-amber-300 hover:text-purple-800 transition-all shadow-md"
                  >
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    Explore Gifts
                  </Link>

                  <Link
                    to={user ? "/events/create" : "/auth/signin"}
                    className="inline-flex items-center px-6 py-3 bg-purple-800/30 backdrop-blur-sm text-white border border-white/20 rounded-full font-semibold hover:bg-purple-800/50 transition-all"
                  >
                    {user ? "Create Event" : "Get Started"}
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
                        <p className="text-xs">Alex contributed 5000kes</p>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="text-white/80 w-6 h-6 ml-8 mt-2 transform rotate-45" />
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
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Friends Gift makes collaborative gifting simple and fun. Follow
              these steps to create your perfect gift registry.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: <Calendar className="w-10 h-10 text-indigo-600" />,
                title: "Create an Event",
                description:
                  "Set up your special occasion with a few simple details",
              },
              {
                icon: <Gift className="w-10 h-10 text-indigo-600" />,
                title: "Add Gifts to Registry",
                description: "Browse and select products you'd love to receive",
              },
              {
                icon: <Users className="w-10 h-10 text-indigo-600" />,
                title: "Share with Friends",
                description: "Invite friends to contribute towards your gifts",
              },
            ].map((step, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-xl bg-white shadow-sm transition-shadow border border-blue-500"
              >
                <div className="w-20 h-20 mx-auto bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-16 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900">
              Featured Events
            </h2>
            <Link
              to="/events"
              className="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center"
            >
              View All Events
              <ChevronRight className="w-5 h-5 ml-1" />
            </Link>
          </div>

          {loading.events ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : featuredEvents.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <Gift className="w-16 h-16 mx-auto text-indigo-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No Active Events
              </h3>
              <p className="text-gray-600 mb-6">
                Be the first to create an exciting event!
              </p>
              {user ? (
                <Link
                  to="/events/create"
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  <Gift className="w-5 h-5 mr-2" />
                  Create Event
                </Link>
              ) : (
                <Link
                  to="/auth/signin"
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Sign In
                </Link>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {featuredEvents.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Popular Products Section */}
      <PopularProductsSection />

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-900 to-purple-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Friends Gift</h2>
            <p className="text-indigo-100 max-w-3xl mx-auto">
              Our platform offers a seamless experience for creating and
              managing gift registries for all your special occasions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Heart className="w-8 h-8 text-pink-400" />,
                title: "Perfect Gifting",
                description:
                  "Get exactly what you want, no more unwanted surprises",
              },
              {
                icon: <Users className="w-8 h-8 text-blue-400" />,
                title: "Social Collaboration",
                description: "Friends and family can team up for bigger gifts",
              },
              {
                icon: <CreditCard className="w-8 h-8 text-green-400" />,
                title: "Secure Payments",
                description: "Multiple payment options with top-grade security",
              },
              {
                icon: <Clock className="w-8 h-8 text-yellow-400" />,
                title: "Easy Management",
                description: "Track contributions and send thank-you notes",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition-colors"
              >
                <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-indigo-100">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Ready to Start Your Registry?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Create your event in minutes and share it with friends and family.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to={user ? "/events/create" : "/auth/signin"}
                className="px-8 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all text-center"
              >
                {user ? "Create Your Event" : "Get Started"}
              </Link>
              <Link
                to="/events"
                className="px-8 py-3 bg-white text-indigo-600 border border-indigo-200 rounded-full hover:bg-indigo-50 shadow-sm hover:shadow transition-all text-center"
              >
                Browse Events
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Hear from people who have used Friends Gift for their special
              occasions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                quote:
                  "Friends Gift made my wedding registry so easy to manage. We got exactly what we wanted!",
                name: "Sarah & Mike",
                role: "Newlyweds",
                rating: 5,
              },
              {
                quote:
                  "I was able to get that expensive camera I wanted for my graduation because friends could contribute together.",
                name: "Daniel K.",
                role: "Recent Graduate",
                rating: 5,
              },
              {
                quote:
                  "The platform is so intuitive. Setting up my baby shower registry took only minutes!",
                name: "Emily T.",
                role: "Expecting Mother",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="mb-4 text-amber-400 flex">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
