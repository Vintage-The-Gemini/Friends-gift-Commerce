// src/pages/dashboard/buyer/BuyerDashboard.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

const BuyerDashboard = ({ tab = 'created' }) => {
  const [activeTab, setActiveTab] = useState(tab);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Events</h1>
        <Link
          to="/events/create"
          className="bg-[#5551FF] text-white px-4 py-2 rounded-lg flex items-center hover:bg-[#4440FF]"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Event
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b mb-6">
        <nav className="flex gap-6">
          <button
            className={`pb-4 px-2 ${
              activeTab === 'created'
                ? 'border-b-2 border-[#5551FF] text-[#5551FF]'
                : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('created')}
          >
            My Created Events
          </button>
          <button
            className={`pb-4 px-2 ${
              activeTab === 'invited'
                ? 'border-b-2 border-[#5551FF] text-[#5551FF]'
                : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('invited')}
          >
            Events I'm Invited To
          </button>
        </nav>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* This will be populated with actual events */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Sample Event</h3>
          <p className="text-gray-600 mb-4">This is a placeholder event card</p>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;