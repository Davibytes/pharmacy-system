import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { API_BASE } from '../services/api';

export default function Orders() {
  const { user, token } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    if (!user?.id || !token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/orders/pharmacy/${user?.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      console.log('Orders:', data);

      if (response.ok) {
        setOrders(data.orders || []);
      } else {
        setError(data.message || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Error fetching orders');
    } finally {
      setLoading(false);
    }
  }, [token, user?.id]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (response.ok) {
        fetchOrders();
        setSelectedOrder(null);
      } else {
        setError(data.message || 'Failed to update order');
      }
    } catch (err) {
      console.error('Update error:', err);
      setError('Error updating order');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-warning bg-opacity-10 text-warning';
      case 'confirmed':
        return 'bg-info bg-opacity-10 text-info';
      case 'ready':
        return 'bg-success bg-opacity-10 text-success';
      case 'completed':
        return 'bg-success bg-opacity-10 text-success';
      case 'cancelled':
        return 'bg-danger bg-opacity-10 text-danger';
      default:
        return 'bg-light text-text';
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
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-text mb-2">Orders</h1>
          <p className="text-textSecondary">View and manage customer orders</p>
        </div>

        {error && (
          <div className="bg-danger bg-opacity-10 border border-danger text-danger p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-textSecondary">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg border border-border p-12 text-center">
            <p className="text-xl text-textSecondary">No orders yet</p>
            <p className="text-textLight">Orders from customers will appear here</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-light border-b border-border">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text">
                      Order ID
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id} className="border-b border-borderLight hover:bg-light transition">
                      <td className="px-6 py-4 font-semibold text-text">
                        {order._id.slice(-8)}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-text">{order.customerName}</p>
                          <p className="text-sm text-textSecondary">{order.customerPhone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-text">
                        {order.totalAmount} FCFA
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-textSecondary">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-4 py-2 bg-primary text-white rounded text-sm font-semibold hover:bg-primaryDark transition"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-text">Order Details</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-textSecondary hover:text-text"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-semibold text-textSecondary">Order ID</p>
                    <p className="text-lg text-text">{selectedOrder._id.slice(-8)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-textSecondary">Status</p>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) =>
                        handleStatusUpdate(selectedOrder._id, e.target.value)
                      }
                      className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="ready">Ready</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-borderLight pt-6">
                  <h3 className="font-bold text-text mb-4">Customer Information</h3>
                  <p className="text-text mb-2">
                    <span className="font-semibold">Name:</span> {selectedOrder.customerName}
                  </p>
                  <p className="text-text mb-2">
                    <span className="font-semibold">Phone:</span> {selectedOrder.customerPhone}
                  </p>
                  <p className="text-text">
                    <span className="font-semibold">Total Amount:</span> {selectedOrder.totalAmount} FCFA
                  </p>
                </div>

                <div className="border-t border-borderLight pt-6">
                  <h3 className="font-bold text-text mb-4">Medicines Ordered</h3>
                  <div className="space-y-2">
                    {selectedOrder.medicines.map((item, index) => (
                      <div key={index} className="flex justify-between text-text">
                        <span>{item.name} x {item.quantity}</span>
                        <span className="font-semibold">{item.total} FCFA</span>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div className="border-t border-borderLight pt-6">
                    <h3 className="font-bold text-text mb-2">Notes</h3>
                    <p className="text-textSecondary">{selectedOrder.notes}</p>
                  </div>
                )}

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-full px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primaryDark transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
