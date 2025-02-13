// src/components/home/CategoryGrid.jsx
import { Link } from 'react-router-dom';

const categories = [
  {
    name: 'Electronics',
    image: '/api/placeholder/64/64',
    slug: 'electronics'
  },
  {
    name: 'Fashion',
    image: '/api/placeholder/64/64',
    slug: 'fashion'
  },
  {
    name: 'Home & Kitchen',
    image: '/api/placeholder/64/64',
    slug: 'home-kitchen'
  },
  {
    name: 'Beauty',
    image: '/api/placeholder/64/64',
    slug: 'beauty'
  },
  {
    name: 'Sports',
    image: '/api/placeholder/64/64',
    slug: 'sports'
  },
  {
    name: 'Premium Fruits',
    image: '/api/placeholder/64/64',
    slug: 'premium-fruits'
  }
];

const CategoryGrid = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {categories.map((category) => (
        <Link 
          key={category.slug}
          to={`/shop/${category.slug}`}
          className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition duration-300"
        >
          <img 
            src={category.image} 
            alt={category.name}
            className="w-16 h-16 object-contain mb-2"
          />
          <span className="text-sm font-medium text-gray-700">
            {category.name}
          </span>
        </Link>
      ))}
    </div>
  );
};

export default CategoryGrid;