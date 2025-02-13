// src/pages/public/EventsPage.jsx
import { Link } from 'react-router-dom';

const EventsPage = () => {
  const events = [
    {
      id: 1,
      title: "Sarah's Wedding Registry",
      type: "Wedding",
      date: "2024-03-20",
      progress: 75
    },
    {
      id: 2,
      title: "Tom's Graduation",
      type: "Graduation",
      date: "2024-04-15",
      progress: 60
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Public Events</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2">{event.title}</h2>
              <p className="text-gray-600 mb-4">
                {event.type} • {new Date(event.date).toLocaleDateString()}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div 
                  className="bg-[#5551FF] h-2 rounded-full"
                  style={{ width: `${event.progress}%` }}
                />
              </div>
              <Link
                to={`/events/${event.id}`}
                className="bg-[#5551FF] text-white px-4 py-2 rounded block text-center"
              >
                View Event
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventsPage;