// src/pages/seller/SellerSettings.jsx
import React, { useState, useEffect } from 'react';
import { Save, Bell, Clock, Store } from 'lucide-react';

const SellerSettings = () => {
  const [activeTab, setActiveTab] = useState('notifications');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      sms: true,
      orderUpdates: true,
      marketingEmails: false
    },
    businessHours: {
      monday: { open: '09:00', close: '17:00' },
      tuesday: { open: '09:00', close: '17:00' },
      wednesday: { open: '09:00', close: '17:00' },
      thursday: { open: '09:00', close: '17:00' },
      friday: { open: '09:00', close: '17:00' },
      saturday: { open: '10:00', close: '15:00' },
      sunday: { open: 'closed', close: 'closed' }
    },
    business: {
      name: '',
      description: '',
      address: '',
      phone: '',
      email: ''
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/seller/business-profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        // Update settings with fetched data
        setSettings(prevSettings => ({
          ...prevSettings,
          business: data.data
        }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/seller/business-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(settings)
      });
      
      if (!response.ok) throw new Error('Failed to update settings');
      
      alert('Settings updated successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="bg-white rounded-lg shadow">
        {/* Settings Tabs */}
        <div className="flex border-b">
          <button
            className={`px-4 py-2 flex items-center ${
              activeTab === 'notifications' ? 'border-b-2 border-blue-500' : ''
            }`}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </button>
          <button
            className={`px-4 py-2 flex items-center ${
              activeTab === 'hours' ? 'border-b-2 border-blue-500' : ''
            }`}
            onClick={() => setActiveTab('hours')}
          >
            <Clock className="w-4 h-4 mr-2" />
            Business Hours
          </button>
          <button
            className={`px-4 py-2 flex items-center ${
              activeTab === 'business' ? 'border-b-2 border-blue-500' : ''
            }`}
            onClick={() => setActiveTab('business')}
          >
            <Store className="w-4 h-4 mr-2" />
            Business Information
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.notifications.email}
                    onChange={(e) => handleChange('notifications', 'email', e.target.checked)}
                    className="mr-2"
                  />
                  Email Notifications
                </label>
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.notifications.sms}
                    onChange={(e) => handleChange('notifications', 'sms', e.target.checked)}
                    className="mr-2"
                  />
                  SMS Notifications
                </label>
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.notifications.orderUpdates}
                    onChange={(e) => handleChange('notifications', 'orderUpdates', e.target.checked)}
                    className="mr-2"
                  />
                  Order Updates
                </label>
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.notifications.marketingEmails}
                    onChange={(e) => handleChange('notifications', 'marketingEmails', e.target.checked)}
                    className="mr-2"
                  />
                  Marketing Emails
                </label>
              </div>
            </div>
          )}

          {activeTab === 'hours' && (
            <div className="space-y-4">
              {Object.entries(settings.businessHours).map(([day, hours]) => (
                <div key={day} className="grid grid-cols-3 gap-4 items-center">
                  <div className="text-sm font-medium text-gray-700 capitalize">
                    {day}
                  </div>
                  <input
                    type="time"
                    value={hours.open}
                    onChange={(e) => handleChange('businessHours', day, { 
                      ...hours, 
                      open: e.target.value 
                    })}
                    className="w-full p-2 border rounded"
                  />
                  <input
                    type="time"
                    value={hours.close}
                    onChange={(e) => handleChange('businessHours', day, { 
                      ...hours, 
                      close: e.target.value 
                    })}
                    className="w-full p-2 border rounded"
                  />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'business' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Business Name</label>
                <input
                  type="text"
                  value={settings.business.name}
                  onChange={(e) => handleChange('business', 'name', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={settings.business.description}
                  onChange={(e) => handleChange('business', 'description', e.target.value)}
                  className="w-full p-2 border rounded"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <input
                  type="text"
                  value={settings.business.address}
                  onChange={(e) => handleChange('business', 'address', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  value={settings.business.phone}
                  onChange={(e) => handleChange('business', 'phone', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={settings.business.email}
                  onChange={(e) => handleChange('business', 'email', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
          )}

          <div className="mt-6">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellerSettings;