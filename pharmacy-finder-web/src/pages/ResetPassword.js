import React, { useContext, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';

export default function ResetPassword() {
  const { resetToken } = useParams();
  const navigate = useNavigate();
  const { resetPassword } = useContext(AuthContext);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!resetToken) {
      setError('Password reset link is invalid or incomplete');
      return;
    }

    if (!password || !confirmPassword) {
      setError('Please enter and confirm your new password');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    const result = await resetPassword(resetToken, password, confirmPassword);
    setLoading(false);

    if (result.success) {
      setSuccess(result.message);
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setError(result.error || 'Unable to reset password');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="px-6 pt-6 pb-2">
        <button
          onClick={() => navigate('/login')}
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
          <span className="font-semibold text-base">Back to Login</span>
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
            <h2 className="text-3xl font-bold text-text mb-2 text-center">
              Reset Password
            </h2>
            <p className="text-center text-textSecondary mb-8 text-sm">
              Create a new password for your pharmacy account.
            </p>

            {error && (
              <div className="bg-danger bg-opacity-10 border border-danger text-danger p-4 rounded-lg mb-6 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-success bg-opacity-10 border border-success text-success p-4 rounded-lg mb-6 text-sm">
                {success} Redirecting to login...
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
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
              </div>

              <Input
                label="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />

              <Button type="submit" disabled={loading || Boolean(success)} className="w-full">
                {loading ? 'Resetting password...' : 'Reset Password'}
              </Button>
            </form>

            <div className="h-px bg-border my-6" />

            <p className="text-center text-textSecondary text-sm">
              Need a new reset link?
              <Link
                to="/forgot-password"
                className="text-primary font-bold hover:text-primaryDark ml-1"
              >
                Request one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
