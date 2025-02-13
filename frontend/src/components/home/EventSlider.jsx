// src/components/home/EventSlider.jsx
import { Link } from 'react-router-dom';

const featuredEvents = [
  {
    id: 1,
    title: "Sarah's Wedding Registry",
    image: "/api/placeholder/400/200",
    progress: 75,
    daysLeft: 15
  },
  {
    id: 2,
    title: "Tom's Graduation Gift Pool",
    image: "/api/placeholder/400/200",
    progress: 60,
    daysLeft: 30
  }
];

const EventSlider = () => {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {featuredEvents.map(event => (
        <Link 
          key={event.id}
          to={`/events/${event.id}`}
          className="group overflow-hidden rounded-lg shadow-md hover:shadow-lg transition duration-300"
        >
          <div className="relative">
            <img 
              src={event.image} 
              alt={event.title} 
              className="w-full h-48 object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
              <h3 className="text-white font-semibold">{event.title}</h3>
            </div>
          </div>
          <div className="p-4">
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className="bg-[#5551FF] h-2 rounded-full transition-all"
                style={{ width: `${event.progress}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>{event.progress}% Funded</span>
              <span>{event.daysLeft} days left</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default EventSlider;