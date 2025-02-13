// src/pages/admin/AdminSellers.jsx
import { useState, useEffect } from 'react';
import { Edit, Trash2, Search, CheckCircle, XCircle } from 'lucide-react';

const AdminSellers = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      const response = await fetch('/api/admin/sellers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setSellers(data.data);
    } catch (error) {
      console.error('Error fetching sellers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sellers Management</h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Search sellers..."
            className="pl-10 pr-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Business Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Owner Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sellers.map((seller) => (
              <tr key={seller._id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium">
                  {seller.businessName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {seller.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {seller.phoneNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {seller.isActive ? (
                    <span className="px-2 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      <CheckCircle className="w-4 h-4 mr-1" /> Active
                    </span>
                  ) : (
                    <span className="px-2 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      <XCircle className="w-4 h-4 mr-1" /> Inactive
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button 
                    className="text-blue-600 hover:text-blue-900 mr-3"
                    onClick={() => {/* Handle edit */}}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    className="text-red-600 hover:text-red-900"
                    onClick={() => {/* Handle delete */}}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminSellers;