// src/pages/public/HomePage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Gift,
  ChevronRight,
  Heart,
  Users,
  CreditCard,
  Clock,
  Calendar,
  Plus,
} from "lucide-react";
import { eventService } from "../../services/api/event";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";
import EventCard from "../../components/events/EventCard";
import HeroSection from "../../components/home/HeroSection";
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
      <HeroSection />

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
                className="text-center p-6 rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
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
                  <Plus className="w-5 h-5 mr-2" />
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
                to="/products"
                className="px-8 py-3 bg-white text-indigo-600 border border-indigo-200 rounded-full hover:bg-indigo-50 shadow-sm hover:shadow transition-all text-center"
              >
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section (Optional) */}
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
              },
              {
                quote:
                  "I was able to get that expensive camera I wanted for my graduation because friends could contribute together.",
                name: "Daniel K.",
                role: "Recent Graduate",
              },
              {
                quote:
                  "The platform is so intuitive. Setting up my baby shower registry took only minutes!",
                name: "Emily T.",
                role: "Expecting Mother",
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
              >
                <div className="mb-4 text-indigo-500">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-xl">
                      ★
                    </span>
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
