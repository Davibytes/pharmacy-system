import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email and password required');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Back Button */}
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

      {/* Content - Centered */}
      <div className="flex-1 flex justify-center items-center px-6 pb-6">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img
              src="/assets/logo-nobk.jpeg"
              alt="Logo"
              className="h-24 w-24 object-contain"
            />
          </div>

          {/* Card */}
          <div className="bg-white rounded-lg border border-border p-8 shadow-sm">
            {/* Header */}
            <h2 className="text-3xl font-bold text-text mb-2 text-center">
              Welcome Back
            </h2>
            <p className="text-center text-textSecondary mb-8 text-sm">
              Sign in to your pharmacy account
            </p>

            {/* Error Message */}
            {error && (
              <div className="bg-danger bg-opacity-10 border border-danger text-danger p-4 rounded-lg mb-6 text-sm">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. pharmacie@email.cm"
              />

              {/* Password with Show/Hide */}
              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white text-text placeholder-textLight transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3 text-primary text-sm font-semibold hover:text-primaryDark"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className="text-right mt-2">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary font-semibold hover:text-primaryDark"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              {/* Sign In Button */}
              <Button
                disabled={loading}
                onClick={handleLogin}
                className="w-full"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* Divider */}
            <div className="h-px bg-border my-6" />

            {/* Sign Up Link */}
            <p className="text-center text-textSecondary text-sm">
              Do not have an account?
              <Link
                to="/signup"
                className="text-primary font-bold hover:text-primaryDark ml-1"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
