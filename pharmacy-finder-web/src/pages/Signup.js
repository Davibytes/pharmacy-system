import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = React.useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [location, setLocation] = useState({ latitude: '', longitude: '' });

  const [formData, setFormData] = useState({
    fullName: '',
    pharmacyName: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    phone: '',
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({
            latitude: latitude.toFixed(6),
            longitude: longitude.toFixed(6),
          });
        },
        (error) => {
          console.error('Location error:', error);
          setLocation({
            latitude: '3.8480',
            longitude: '11.5021',
          });
        }
      );
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (
      !formData.fullName ||
      !formData.pharmacyName ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.address ||
      !formData.phone
    ) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const result = await signup(
        formData.fullName,
        formData.pharmacyName,
        formData.email,
        formData.password,
        formData.confirmPassword,
        formData.address,
        formData.phone,
        location.latitude,
        location.longitude
      );

      if (result.success) {
        setSuccess('Pharmacy registered successfully. Redirecting...');
        setTimeout(() => navigate('/dashboard'), 2000);
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="px-6 pt-6 pb-2">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-primary hover:text-primaryDark transition"
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
          <span className="font-semibold text-base">Back</span>
        </button>
      </div>

      <div className="flex-1 flex justify-center items-center px-6 pb-6">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8">
            <img
              src="/assets/logo-nobk.jpeg"
              alt="Logo"
              className="h-24 w-24 object-contain"
            />
          </div>

          <div className="bg-white rounded-lg border border-border p-8 shadow-sm">
            <h1 className="text-3xl font-bold text-text mb-2 text-center">
              Create Pharmacy Account
            </h1>
            <p className="text-center text-textSecondary mb-8 text-sm">
              Register your pharmacy to get started
            </p>

            {error && (
              <div className="bg-danger bg-opacity-10 border border-danger text-danger p-4 rounded-lg mb-6 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-success bg-opacity-10 border border-success text-success p-4 rounded-lg mb-6 text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Jean Marie Nkondock"
              />

              <Input
                label="Pharmacy Name"
                name="pharmacyName"
                value={formData.pharmacyName}
                onChange={handleInputChange}
                placeholder="Pharmacie du Centre"
              />

              <Input
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Simbock, Yaounde"
              />

              <Input
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+237 6 12 34 56 78"
              />

              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  Location
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={location.latitude}
                    disabled
                    aria-label="Latitude"
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-textSecondary"
                  />
                  <input
                    type="text"
                    value={location.longitude}
                    disabled
                    aria-label="Longitude"
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-textSecondary"
                  />
                </div>
              </div>

              <Input
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="pharmacie@email.cm"
              />

              <Input
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
              />

              <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
              />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            <div className="h-px bg-border my-6" />

            <p className="text-center text-textSecondary text-sm">
              Already have an account?
              <Link to="/login" className="text-primary font-bold hover:text-primaryDark ml-1">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
