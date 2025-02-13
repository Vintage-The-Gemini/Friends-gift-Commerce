// src/pages/public/HomePage.jsx
import EventSlider from '../../components/home/EventSlider';
import CategoryGrid from '../../components/home/CategoryGrid';
import FeaturesSection from '../../components/home/FeaturesSection';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative h-[500px] bg-[#5551FF] overflow-hidden">
        <div className="container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl text-white">
            <h1 className="text-5xl font-bold mb-6">
              Create Memorable Events Together
            </h1>
            <p className="text-xl opacity-90 mb-8">
              Start your event, share with friends, and make dreams come true together
            </p>
            <Link
              to="/signup"
              className="bg-white text-[#5551FF] px-8 py-3 rounded-full font-semibold hover:bg-opacity-90 transition"
            >
              Create Your Event
            </Link>
          </div>
        </div>
      </section>

      {/* Active Events */}
      <section className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold">Featured Events</h2>
          <Link to="/events" className="text-[#5551FF] hover:underline">
            View All Events
          </Link>
        </div>
        <EventSlider />
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-8">Shop by Category</h2>
        <CategoryGrid />
      </section>

      {/* Features */}
      <FeaturesSection />

      {/* Create Event CTA */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Event?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of people who have successfully created and managed their events on Friends Gift
          </p>
          <Link
            to="/signup"
            className="bg-[#5551FF] text-white px-8 py-3 rounded-full font-semibold hover:bg-opacity-90 transition"
          >
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;