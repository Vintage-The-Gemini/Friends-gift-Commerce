// src/pages/admin/AdminSettings.jsx
import { useState } from 'react';
import { Save, Lock, Bell, Globe } from 'lucide-react';

const AdminSettings = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    siteName: 'Friends Gift',
    siteDescription: 'Gift giving platform',
    contactEmail: 'admin@friendsgift.com',
    maxEventsPerUser: '10',
    // Security Settings
    requireEmailVerification: true,
    twoFactorAuth: false,
    passwordMinLength: '8',
    // Notification Settings
    emailNotifications: true,
    smsNotifications: true,
    newsUpdates: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(settings)
      });
      
      if (!response.ok) throw new Error('Failed to update settings');
      
      // Show success message
      alert('Settings updated successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Settings</h1>

      <div className="bg-white rounded-lg shadow">
        {/* Settings Tabs */}
        <div className="flex border-b">
          <button
            className={`px-4 py-2 ${activeTab === 'general' ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <Globe className="inline-block w-4 h-4 mr-2" />
            General
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'security' ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <Lock className="inline-block w-4 h-4 mr-2" />
            Security
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'notifications' ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell className="inline-block w-4 h-4 mr-2" />
            Notifications
          </button>
        </div>

        {/* Settings Forms */}
        <form onSubmit={handleSubmit} className="p-6">
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Site Name</label>
                <input
                  type="text"
                  name="siteName"
                  value={settings.siteName}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Site Description</label>
                <textarea
                  name="siteDescription"
                  value={settings.siteDescription}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact Email</label>
                <input
                  type="email"
                  name="contactEmail"
                  value={settings.contactEmail}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max Events Per User</label>
                <input
                  type="number"
                  name="maxEventsPerUser"
                  value={settings.maxEventsPerUser}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="requireEmailVerification"
                    checked={settings.requireEmailVerification}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Require Email Verification
                </label>
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="twoFactorAuth"
                    checked={settings.twoFactorAuth}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Enable Two-Factor Authentication
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Minimum Password Length</label>
                <input
                  type="number"
                  name="passwordMinLength"
                  value={settings.passwordMinLength}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  min="8"
                />
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="emailNotifications"
                    checked={settings.emailNotifications}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Enable Email Notifications
                </label>
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="smsNotifications"
                    checked={settings.smsNotifications}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Enable SMS Notifications
                </label>
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="newsUpdates"
                    checked={settings.newsUpdates}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Send News and Updates
                </label>
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

export default AdminSettings;