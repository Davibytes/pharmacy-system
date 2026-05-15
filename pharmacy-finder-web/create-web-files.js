const fs = require('fs');

// Create pages directory if it doesn't exist
if (!fs.existsSync('src/pages')) {
  fs.mkdirSync('src/pages', { recursive: true });
}

// Inventory.js
const inventoryCode = `import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Input from '../components/Input';

export default function Inventory() {
  const { user, token } = useContext(AuthContext);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    unit: 'tablet',
    dosage: '',
    manufacturer: '',
    expiryDate: '',
  });

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const response = await fetch(\`http://localhost:5000/api/medicines/pharmacy/\${user?.id}\`, {
        headers: { Authorization: \`Bearer \${token}\` },
      });

      const data = await response.json();
      console.log('Medicines:', data);

      if (response.ok) {
        setMedicines(data.medicines || []);
      } else {
        setError(data.message || 'Failed to fetch medicines');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Error fetching medicines');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name || !formData.price || !formData.quantity) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const url = editingId
        ? \`http://localhost:5000/api/medicines/\${editingId}\`
        : \`http://localhost:5000/api/medicines/pharmacy/\${user?.id}\`;

      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: \`Bearer \${token}\`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          quantity: parseInt(formData.quantity),
          unit: formData.unit,
          dosage: formData.dosage,
          manufacturer: formData.manufacturer,
          expiryDate: formData.expiryDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to save medicine');
        return;
      }

      setSuccess(editingId ? 'Medicine updated successfully' : 'Medicine added successfully');
      resetForm();
      fetchMedicines();
    } catch (err) {
      console.error('Save error:', err);
      setError('Error saving medicine');
    }
  };

  const handleEditMedicine = (medicine) => {
    setFormData({
      name: medicine.name,
      description: medicine.description || '',
      price: medicine.price,
      quantity: medicine.quantity,
      unit: medicine.unit,
      dosage: medicine.dosage || '',
      manufacturer: medicine.manufacturer || '',
      expiryDate: medicine.expiryDate ? medicine.expiryDate.split('T')[0] : '',
    });
    setEditingId(medicine._id);
    setShowForm(true);
  };

  const handleDeleteMedicine = async (medicineId) => {
    if (!window.confirm('Are you sure you want to delete this medicine?')) return;

    try {
      const response = await fetch(\`http://localhost:5000/api/medicines/\${medicineId}\`, {
        method: 'DELETE',
        headers: { Authorization: \`Bearer \${token}\` },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to delete medicine');
        return;
      }

      setSuccess('Medicine deleted successfully');
      fetchMedicines();
    } catch (err) {
      console.error('Delete error:', err);
      setError('Error deleting medicine');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      quantity: '',
      unit: 'tablet',
      dosage: '',
      manufacturer: '',
      expiryDate: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-light">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-text mb-2">Inventory</h1>
            <p className="text-textSecondary">Manage your medicines and stock levels</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primaryDark transition"
          >
            {showForm ? 'Cancel' : 'Add Medicine'}
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

        {showForm && (
          <div className="bg-white rounded-lg border border-border p-8 mb-12">
            <h2 className="text-2xl font-bold text-text mb-6">
              {editingId ? 'Edit Medicine' : 'Add New Medicine'}
            </h2>

            <form onSubmit={handleAddMedicine} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Medicine Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Paracetamol"
              />

              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  Unit
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white text-text"
                >
                  <option value="tablet">Tablet</option>
                  <option value="capsule">Capsule</option>
                  <option value="liquid">Liquid</option>
                  <option value="injection">Injection</option>
                  <option value="powder">Powder</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <Input
                label="Price (FCFA)"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="e.g. 2500"
              />

              <Input
                label="Quantity in Stock"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleInputChange}
                placeholder="e.g. 50"
              />

              <Input
                label="Dosage"
                name="dosage"
                value={formData.dosage}
                onChange={handleInputChange}
                placeholder="e.g. 500mg"
              />

              <Input
                label="Manufacturer"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleInputChange}
                placeholder="e.g. Pharmaceutical Ltd"
              />

              <Input
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Medicine description"
              />

              <Input
                label="Expiry Date"
                name="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={handleInputChange}
              />

              <div className="md:col-span-2 flex gap-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primaryDark transition"
                >
                  {editingId ? 'Update Medicine' : 'Add Medicine'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-6 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primaryLight transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-textSecondary">Loading medicines...</p>
          </div>
        ) : medicines.length === 0 ? (
          <div className="bg-white rounded-lg border border-border p-12 text-center">
            <p className="text-xl text-textSecondary mb-4">No medicines added yet</p>
            <p className="text-textLight mb-6">Start by adding your first medicine to inventory</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primaryDark transition"
            >
              Add Your First Medicine
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-light border-b border-border">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text">
                      Medicine Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text">
                      Dosage
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text">
                      Stock
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {medicines.map((medicine) => (
                    <tr key={medicine._id} className="border-b border-borderLight hover:bg-light transition">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-text">{medicine.name}</p>
                          <p className="text-sm text-textSecondary">{medicine.manufacturer}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-text">{medicine.dosage || '-'}</td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-text">{medicine.price} FCFA</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-text">{medicine.quantity} {medicine.unit}s</p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={\`px-3 py-1 rounded-full text-sm font-semibold \${
                            medicine.inStock
                              ? 'bg-success bg-opacity-10 text-success'
                              : 'bg-danger bg-opacity-10 text-danger'
                          }\`}
                        >
                          {medicine.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditMedicine(medicine)}
                            className="px-4 py-2 bg-primary text-white rounded text-sm font-semibold hover:bg-primaryDark transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteMedicine(medicine._id)}
                            className="px-4 py-2 bg-danger text-white rounded text-sm font-semibold hover:bg-red-700 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}`;

fs.writeFileSync('src/pages/Inventory.js', inventoryCode);
console.log('✓ Created src/pages/Inventory.js');

// Orders.js
const ordersCode = `import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Orders() {
  const { user, token } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(\`http://localhost:5000/api/orders/pharmacy/\${user?.id}\`, {
        headers: { Authorization: \`Bearer \${token}\` },
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
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const response = await fetch(\`http://localhost:5000/api/orders/\${orderId}/status\`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: \`Bearer \${token}\`,
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
                          className={\`px-3 py-1 rounded-full text-sm font-semibold \${getStatusColor(
                            order.status
                          )}\`}
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
}`;

fs.writeFileSync('src/pages/Orders.js', ordersCode);
console.log('✓ Created src/pages/Orders.js');

console.log('\n✓ All web app files created successfully!');