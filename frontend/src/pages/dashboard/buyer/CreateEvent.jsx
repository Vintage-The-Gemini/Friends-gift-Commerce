// src/pages/dashboard/buyer/CreateEvent.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const eventTypes = [
  'Birthday',
  'Wedding',
  'Baby Shower',
  'Graduation',
  'House Warming',
  'Anniversary',
  'Other'
];

const CreateEvent = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [eventData, setEventData] = useState({
    name: '',
    type: '',
    date: '',
    location: '',
    startDate: '',
    endDate: '',
    selectedProducts: []
  });

  const handleNextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle event creation
    console.log(eventData);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Create New Event</h1>

        {/* Progress Steps */}
        <div className="flex justify-between mb-8">
          <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>Event Details</div>
          <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>Product Selection</div>
        </div>

        {currentStep === 1 ? (
          /* Step 1: Event Details */
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">Event Name</label>
              <input
                type="text"
                value={eventData.name}
                onChange={(e) => setEventData({...eventData, name: e.target.value})}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Event Type</label>
              <select
                value={eventData.type}
                onChange={(e) => setEventData({...eventData, type: e.target.value})}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select Type</option>
                {eventTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Event Date</label>
              <input
                type="date"
                value={eventData.date}
                onChange={(e) => setEventData({...eventData, date: e.target.value})}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input
                type="text"
                value={eventData.location}
                onChange={(e) => setEventData({...eventData, location: e.target.value})}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Start Contribution Date</label>
                <input
                  type="date"
                  value={eventData.startDate}
                  onChange={(e) => setEventData({...eventData, startDate: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Contribution Date</label>
                <input
                  type="date"
                  value={eventData.endDate}
                  onChange={(e) => setEventData({...eventData, endDate: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleNextStep}
                className="bg-[#5551FF] text-white px-6 py-2 rounded"
              >
                Next: Add Products
              </button>
            </div>
          </form>
        ) : (
          /* Step 2: Product Selection */
          <div>
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search for products..."
                className="w-full p-2 border rounded"
              />
            </div>

            {/* Product Grid will go here */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Product cards will be mapped here */}
            </div>

            <div className="flex justify-between">
              <button
                onClick={handlePrevStep}
                className="border border-[#5551FF] text-[#5551FF] px-6 py-2 rounded"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                className="bg-[#5551FF] text-white px-6 py-2 rounded"
              >
                Create Event
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateEvent;