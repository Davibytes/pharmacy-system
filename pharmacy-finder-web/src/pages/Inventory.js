import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import Input from '../components/Input';
import { API_BASE } from '../services/api';

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
    imageUrl: '',
  });

  const fetchMedicines = useCallback(async () => {
    if (!user?.id || !token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/medicines/pharmacy/${user?.id}`, {
        headers: { Authorization: `Bearer ${token}` },
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
  }, [token, user?.id]);

  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file');
      return;
    }

    if (file.size > 1024 * 1024) {
      setError('Medicine image must be 1MB or smaller');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((current) => ({ ...current, imageUrl: reader.result || '' }));
      setError('');
    };
    reader.readAsDataURL(file);
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
        ? `${API_BASE}/medicines/${editingId}`
        : `${API_BASE}/medicines/pharmacy/${user?.id}`;

      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
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
          imageUrl: formData.imageUrl,
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
      imageUrl: medicine.imageUrl || '',
    });
    setEditingId(medicine._id);
    setShowForm(true);
  };

  const handleDeleteMedicine = async (medicineId) => {
    if (!window.confirm('Are you sure you want to delete this medicine?')) return;

    try {
      const response = await fetch(`${API_BASE}/medicines/${medicineId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
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
      imageUrl: '',
    });
    setEditingId(null);
    setShowForm(false);
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

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-text mb-2">
                  Medicine Picture
                </label>
                <div className="flex flex-col md:flex-row gap-4 md:items-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white text-text"
                  />
                  {formData.imageUrl && (
                    <div className="flex items-center gap-3">
                      <img
                        src={formData.imageUrl}
                        alt="Medicine preview"
                        className="w-20 h-20 rounded-lg object-cover border border-border"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, imageUrl: '' })}
                        className="px-4 py-2 border border-danger text-danger rounded-lg text-sm font-semibold hover:bg-danger hover:bg-opacity-10 transition"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-sm text-textLight mt-2">
                  Upload a clear package photo. Maximum size: 1MB.
                </p>
              </div>

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
                        <div className="flex items-center gap-3">
                          {medicine.imageUrl ? (
                            <img
                              src={medicine.imageUrl}
                              alt={medicine.name}
                              className="w-12 h-12 rounded-lg object-cover border border-border"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-light border border-border" />
                          )}
                          <div>
                            <p className="font-semibold text-text">{medicine.name}</p>
                            <p className="text-sm text-textSecondary">{medicine.manufacturer}</p>
                          </div>
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
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            medicine.inStock
                              ? 'bg-success bg-opacity-10 text-success'
                              : 'bg-danger bg-opacity-10 text-danger'
                          }`}
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
}
