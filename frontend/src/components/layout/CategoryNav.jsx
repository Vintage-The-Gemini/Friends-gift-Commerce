// src/components/layout/CategoryNav.jsx
import { Link } from 'react-router-dom';

const categories = [
  { name: 'Groceries', path: '/groceries' },
  { name: 'Premium Fruits', path: '/premium-fruits' },
  { name: 'Home & Kitchen', path: '/home-kitchen' },
  { name: 'Fashion', path: '/fashion' },
  { name: 'Electronics', path: '/electronics' },
  { name: 'Beauty', path: '/beauty' },
  { name: 'Home Improvement', path: '/home-improvement' },
  { name: 'Sports, Toys & Luggage', path: '/sports' }
];

const CategoryNav = () => {
  return (
    <nav className="h-12 flex items-center overflow-x-auto scrollbar-hide">
      <div className="flex gap-8">
        {categories.map((category) => (
          <Link
            key={category.path}
            to={category.path}
            className="text-gray-600 hover:text-[#5551FF] whitespace-nowrap transition-colors"
          >
            {category.name}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default CategoryNav;