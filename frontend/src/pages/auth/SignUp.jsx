// src/pages/auth/SignUp.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import Logo from '../../assets/images/Friends-gift-logo.svg';

const SignUp = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('buyer');
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    businessName: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (role === 'seller' && !formData.businessName.trim()) {
      setError('Business name is required for sellers');
      return;
    }

    if (!formData.phoneNumber.match(/^\+254[0-9]{9}$/)) {
      setError('Please enter a valid Kenyan phone number (+254...)');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const requestData = {
        name: formData.name.trim(),
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        role
      };

      if (role === 'seller') {
        requestData.businessName = formData.businessName.trim();
      }

      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      navigate('/auth/signin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-lg shadow">
        <div className="flex flex-col items-center">
          <img src={Logo} alt="Friends Gift Logo" className="h-8 w-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">
            Create your account
          </h2>
        </div>

        <div className="flex justify-center gap-4">
          <button
            type="button"
            onClick={() => setRole('buyer')}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              role === 'buyer'
                ? 'bg-[#5551FF] text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            As Buyer
          </button>
          <button
            type="button"
            onClick={() => setRole('seller')}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              role === 'seller'
                ? 'bg-[#5551FF] text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            As Seller
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              autoComplete="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#5551FF] focus:border-[#5551FF]"
              required
            />
          </div>

          {role === 'seller' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Business Name
              </label>
              <input
                type="text"
                name="businessName"
                autoComplete="organization"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#5551FF] focus:border-[#5551FF]"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              name="phoneNumber"
              autoComplete="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              placeholder="+254"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#5551FF] focus:border-[#5551FF]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#5551FF] focus:border-[#5551FF]"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#5551FF] focus:border-[#5551FF]"
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#5551FF] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5551FF] disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>

          <p className="text-sm text-center">
            Already have an account?{' '}
            <Link to="/auth/signin" className="text-[#5551FF] hover:text-opacity-90">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignUp;