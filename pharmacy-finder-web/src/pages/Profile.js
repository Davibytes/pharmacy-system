import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Profile() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    const confirmLogout = window.confirm('Are you sure you want to logout?');
    if (confirmLogout) {
      logout();
      navigate('/');
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-light">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-text mb-2">My Profile</h1>
          <p className="text-textSecondary">Manage your account settings</p>
        </div>

        <div className="bg-white rounded-lg border border-border p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-text mb-6">Account Information</h2>
            
            <div className="space-y-6">
              <div className="border-b border-borderLight pb-4">
                <p className="text-sm font-semibold text-textSecondary mb-1">
                  Full Name
                </p>
                <p className="text-lg text-text">{user?.fullName}</p>
              </div>

              <div className="border-b border-borderLight pb-4">
                <p className="text-sm font-semibold text-textSecondary mb-1">
                  Pharmacy Name
                </p>
                <p className="text-lg text-text">{user?.pharmacyName}</p>
              </div>

              <div className="border-b border-borderLight pb-4">
                <p className="text-sm font-semibold text-textSecondary mb-1">
                  Email Address
                </p>
                <p className="text-lg text-text">{user?.email}</p>
              </div>

              <div className="border-b border-borderLight pb-4">
                <p className="text-sm font-semibold text-textSecondary mb-1">
                  Phone Number
                </p>
                <p className="text-lg text-text">{user?.phone || 'Not set'}</p>
              </div>

              <div className="border-b border-borderLight pb-4">
                <p className="text-sm font-semibold text-textSecondary mb-1">
                  Address
                </p>
                <p className="text-lg text-text">{user?.address || 'Not set'}</p>
              </div>

              <div className="border-b border-borderLight pb-4">
                <p className="text-sm font-semibold text-textSecondary mb-1">
                  Location
                </p>
                <p className="text-lg text-text">
                  {user?.location?.coordinates 
                    ? `${user.location.coordinates[1].toFixed(6)}, ${user.location.coordinates[0].toFixed(6)}`
                    : 'Not set'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Logout Section */}
          <div className="border-t border-borderLight pt-8 mt-8">
            <h3 className="text-lg font-bold text-text mb-4">Logout</h3>
            <p className="text-textSecondary text-sm mb-6">
              Sign out of your pharmacy account
            </p>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-danger text-white rounded-lg font-semibold hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}