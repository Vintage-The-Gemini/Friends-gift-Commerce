// src/pages/admin/AdminEvents.jsx
import { useState, useEffect } from 'react';
import { Search, Calendar, DollarSign, Users } from 'lucide-react';

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/admin/events', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setEvents(data.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Events Management</h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Search events..."
            className="pl-10 pr-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div key={event._id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
              
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <Calendar className="w-4 h-4 mr-2" />
                {formatDate(event.eventDate)}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2 text-blue-500" />
                    <span>Creator:</span>
                  </div>
                  <span className="font-medium">{event.creator.name}</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-2 text-green-500" />
                    <span>Target Amount:</span>
                  </div>
                  <span className="font-medium">${event.targetAmount}</span>
                </div>

                <div className="pt-4">
                  <div className="text-sm text-gray-500 mb-1">Progress</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ 
                        width: `${(event.currentAmount / event.targetAmount) * 100}%` 
                      }}
                    />
                  </div>
                  <div className="text-sm text-right mt-1">
                    {Math.round((event.currentAmount / event.targetAmount) * 100)}%
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <button 
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                  onClick={() => {/* Handle view details */}}
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminEvents;