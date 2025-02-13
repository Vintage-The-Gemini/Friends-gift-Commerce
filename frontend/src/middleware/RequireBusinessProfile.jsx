// src/middleware/RequireBusinessProfile.jsx
import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const RequireBusinessProfile = ({ children }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    const checkBusinessProfile = async () => {
      try {
        const response = await fetch('/api/seller/business-profile', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          setHasProfile(true);
        }
      } catch (error) {
        console.error('Error checking business profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'seller') {
      checkBusinessProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user?.role === 'seller' && !hasProfile) {
    return <Navigate to="/seller/setup" replace />;
  }

  return children;
};

export default RequireBusinessProfile;