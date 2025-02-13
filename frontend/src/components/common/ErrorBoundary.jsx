// src/components/common/ErrorBoundary.jsx
import { useRouteError, Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function ErrorBoundary() {
  const error = useRouteError();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {error.status === 404 ? "Page Not Found" : "Oops! Something went wrong"}
          </h1>
          <p className="text-gray-600 mb-8">
            {error.status === 404 
              ? "The page you're looking for doesn't exist."
              : "We're having trouble loading this page. Please try again later."}
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-[#5551FF] hover:bg-[#4440FF]"
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}