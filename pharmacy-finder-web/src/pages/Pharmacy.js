import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { API_BASE } from '../services/api';

export default function Pharmacy() {
  const { user, token, updateUser } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    pharmacyName: user?.pharmacyName || '',
    address: user?.address || '',
    phone: user?.phone || '',
    openingHours: user?.openingHours || { open: '08:00', close: '20:00' },
    openingDays: user?.openingDays || {
      Monday: true,
      Tuesday: true,
      Wednesday: true,
      Thursday: true,
      Friday: true,
      Saturday: true,
      Sunday: false,
    },
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    setFormData({
      pharmacyName: user.pharmacyName || '',
      address: user.address || '',
      phone: user.phone || '',
      openingHours: user.openingHours || { open: '08:00', close: '20:00' },
      openingDays: user.openingDays || {
        Monday: true,
        Tuesday: true,
        Wednesday: true,
        Thursday: true,
        Friday: true,
        Saturday: true,
        Sunday: false,
      },
    });
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDayChange = (day) => {
    setFormData({
      ...formData,
      openingDays: {
        ...formData.openingDays,
        [day]: !formData.openingDays[day],
      },
    });
  };

  const handleHourChange = (field, value) => {
    setFormData({
      ...formData,
      openingHours: {
        ...formData.openingHours,
        [field]: value,
      },
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await fetch(
        `${API_BASE}/pharmacies/${user?.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            pharmacyName: formData.pharmacyName,
            address: formData.address,
            phone: formData.phone,
            openingHours: formData.openingHours,
            openingDays: formData.openingDays,
          }),
        }
      );

      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json')
        ? await response.json()
        : { message: `Request failed with status ${response.status}` };

      if (!response.ok) {
        throw new Error(data.message || `Failed to update pharmacy details (${response.status})`);
      }

      const updatedPharmacy = data.pharmacy || data;
      updateUser(updatedPharmacy);
      setSuccess('Pharmacy details updated successfully!');
      setIsEditing(false);
    } catch (err) {
      console.error('Update error:', err);
      setError(err.message || 'Error updating pharmacy details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-light">
      {/* Back Button */}
      <div className="px-6 pt-4">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-primary hover:text-primaryDark transition mb-6"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="font-semibold">Back</span>
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-text mb-2">Pharmacy Details</h1>
            <p className="text-textSecondary">Manage your pharmacy information</p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primaryDark transition"
          >
            {isEditing ? 'Cancel' : 'Edit Details'}
          </button>
        </div>

        {error && (
          <div className="bg-danger bg-opacity-10 border border-danger text-danger p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-success bg-opacity-10 border border-success text-success p-4 rounded-lg mb-6">
            {success}
          </div>
        )}

        {!isEditing ? (
          // View Mode
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="bg-white rounded-lg border border-border p-8">
              <h2 className="text-2xl font-bold text-text mb-6">Basic Information</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-textSecondary">Pharmacy Name:</span>
                  <span className="font-semibold text-text">
                    {user?.pharmacyName}
                  </span>
                </div>
                <div className="flex justify-between border-t border-borderLight pt-4">
                  <span className="text-textSecondary">Owner:</span>
                  <span className="font-semibold text-text">
                    {user?.fullName}
                  </span>
                </div>
                <div className="flex justify-between border-t border-borderLight pt-4">
                  <span className="text-textSecondary">Address:</span>
                  <span className="font-semibold text-text">
                    {user?.address}
                  </span>
                </div>
                <div className="flex justify-between border-t border-borderLight pt-4">
                  <span className="text-textSecondary">Phone:</span>
                  <span className="font-semibold text-text">
                    {user?.phone}
                  </span>
                </div>
                <div className="flex justify-between border-t border-borderLight pt-4">
                  <span className="text-textSecondary">Email:</span>
                  <span className="font-semibold text-text">
                    {user?.email}
                  </span>
                </div>
              </div>
            </div>

            {/* Opening Information */}
            <div className="bg-white rounded-lg border border-border p-8">
              <h2 className="text-2xl font-bold text-text mb-6">Opening Information</h2>
              
              {/* Hours */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-text mb-4">Opening Hours</h3>
                <div className="flex justify-between">
                  <div>
                    <p className="text-textSecondary text-sm">Opens:</p>
                    <p className="font-semibold text-text">
                      {user?.openingHours?.open || '08:00'}
                    </p>
                  </div>
                  <div>
                    <p className="text-textSecondary text-sm">Closes:</p>
                    <p className="font-semibold text-text">
                      {user?.openingHours?.close || '20:00'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Days */}
              <div>
                <h3 className="text-lg font-semibold text-text mb-4">Operating Days</h3>
                <div className="grid grid-cols-2 gap-3">
                  {user?.openingDays && Object.entries(user.openingDays).map(([day, isOpen]) => (
                    <div
                      key={day}
                      className={`p-3 rounded-lg text-center font-medium ${
                        isOpen
                          ? 'bg-success bg-opacity-10 text-success'
                          : 'bg-danger bg-opacity-10 text-danger'
                      }`}
                    >
                      {day}
                      <p className="text-xs mt-1">
                        {isOpen ? 'Open' : 'Closed'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Edit Mode
          <div className="bg-white rounded-lg border border-border p-8">
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-8">
              {/* Basic Info Form */}
              <div>
                <h3 className="text-2xl font-bold text-text mb-6">Edit Basic Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-text mb-2">
                      Pharmacy Name
                    </label>
                    <input
                      type="text"
                      name="pharmacyName"
                      value={formData.pharmacyName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                      placeholder="+237 6 12 34 56 78"
                    />
                  </div>
                </div>
              </div>

              {/* Opening Hours */}
              <div>
                <h3 className="text-2xl font-bold text-text mb-6">Edit Opening Hours</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-text mb-2">
                      Opens At
                    </label>
                    <input
                      type="time"
                      value={formData.openingHours.open}
                      onChange={(e) => handleHourChange('open', e.target.value)}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text mb-2">
                      Closes At
                    </label>
                    <input
                      type="time"
                      value={formData.openingHours.close}
                      onChange={(e) => handleHourChange('close', e.target.value)}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Opening Days */}
              <div>
                <h3 className="text-2xl font-bold text-text mb-6">Operating Days</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {Object.keys(formData.openingDays).map((day) => (
                    <label
                      key={day}
                      className="flex items-center gap-3 p-3 bg-light border border-border rounded-lg cursor-pointer hover:bg-primaryLight transition"
                    >
                      <input
                        type="checkbox"
                        checked={formData.openingDays[day]}
                        onChange={() => handleDayChange(day)}
                        className="w-5 h-5 accent-primary"
                      />
                      <span className="text-text font-medium">{day}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-6 border-t border-borderLight">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primaryDark transition disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-6 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primaryLight transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
