import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { API_BASE } from '../services/api';

export default function Dashboard() {
  const { user, token } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, token]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE}/pharmacies/${user?.id}/stats`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();
      console.log('Stats:', data);

      if (response.ok) {
        setStats(data.stats);
      } else {
        setError(data.message || 'Failed to fetch stats');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Error fetching stats');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-light">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-text mb-2">Dashboard</h1>
          <p className="text-textSecondary">
            {user?.fullName} - Pharmacy Administration
          </p>
        </div>

        {error && (
          <div className="bg-danger bg-opacity-10 border border-danger text-danger p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-textSecondary">Loading dashboard...</p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="bg-white rounded-lg border border-border p-6 hover:shadow-lg transition">
                <p className="text-textSecondary text-sm font-semibold mb-3">TODAY ORDERS</p>
                <p className="text-4xl font-bold text-primary">
                  {stats?.todayOrders || 0}
                </p>
                <p className="text-textLight text-sm mt-2">Orders received today</p>
              </div>

              <div className="bg-white rounded-lg border border-border p-6 hover:shadow-lg transition">
                <p className="text-textSecondary text-sm font-semibold mb-3">REVENUE TODAY</p>
                <p className="text-4xl font-bold text-success">
                  {stats?.todayRevenue || 0} FCFA
                </p>
                <p className="text-textLight text-sm mt-2">Total sales today</p>
              </div>

              <div className="bg-white rounded-lg border border-border p-6 hover:shadow-lg transition">
                <p className="text-textSecondary text-sm font-semibold mb-3">TOTAL MEDICINES</p>
                <p className="text-4xl font-bold text-primary">
                  {stats?.totalMedicines || 0}
                </p>
                <p className="text-textLight text-sm mt-2">In inventory</p>
              </div>

              <div className="bg-white rounded-lg border border-border p-6 hover:shadow-lg transition">
                <p className="text-textSecondary text-sm font-semibold mb-3">LOW STOCK ALERT</p>
                <p className="text-4xl font-bold text-warning">
                  {stats?.lowStockItems || 0}
                </p>
                <p className="text-textLight text-sm mt-2">Items to reorder</p>
              </div>
            </div>

            {/* Info Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border border-border p-8">
                <h2 className="text-2xl font-bold text-text mb-6">Quick Actions</h2>
                <div className="space-y-4">
                  <a
                    href="/inventory"
                    className="block p-4 bg-light rounded-lg hover:bg-primary hover:text-white transition text-text font-semibold"
                  >
                    Add Medicine to Inventory
                  </a>
                  <a
                    href="/orders"
                    className="block p-4 bg-light rounded-lg hover:bg-primary hover:text-white transition text-text font-semibold"
                  >
                    View Orders
                  </a>
                  <a
                    href="/pharmacy"
                    className="block p-4 bg-light rounded-lg hover:bg-primary hover:text-white transition text-text font-semibold"
                  >
                    Update Pharmacy Details
                  </a>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-border p-8">
                <h2 className="text-2xl font-bold text-text mb-6">Business Summary</h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-textSecondary">Pharmacy Name:</span>
                    <span className="font-semibold text-text">
                      {user?.pharmacyName}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-borderLight pt-4">
                    <span className="text-textSecondary">Location:</span>
                    <span className="font-semibold text-text">
                      {user?.address || 'Not set'}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-borderLight pt-4">
                    <span className="text-textSecondary">Phone:</span>
                    <span className="font-semibold text-text">
                      {user?.phone || 'Not set'}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-borderLight pt-4">
                    <span className="text-textSecondary">Status:</span>
                    <span className="font-semibold text-text px-3 py-1 bg-success bg-opacity-10 text-success rounded-full text-sm">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
