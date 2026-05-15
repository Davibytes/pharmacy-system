import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resetUrl, setResetUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const { forgotPassword } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setResetUrl('');

    if (!email) {
      setError('Email address required');
      return;
    }

    setLoading(true);
    const result = await forgotPassword(email);
    setLoading(false);

    if (result.success) {
      setSuccess(result.message);
      setResetUrl(result.resetUrl || '');
      setEmail('');
    } else {
      setError(result.error || 'Unable to send reset email');
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
              Forgot Password
            </h2>
            <p className="text-center text-textSecondary mb-8 text-sm">
              Enter your pharmacy account email to receive a password recovery link.
            </p>

            {error && (
              <div className="bg-danger bg-opacity-10 border border-danger text-danger p-4 rounded-lg mb-6 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-success bg-opacity-10 border border-success text-success p-4 rounded-lg mb-6 text-sm">
                <p>{success}</p>
                {resetUrl && (
                  <a
                    href={resetUrl}
                    className="mt-3 block font-bold underline"
                  >
                    Open reset link
                  </a>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. pharmacie@email.cm"
              />

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Sending email...' : 'Send Recovery Email'}
              </Button>
            </form>

            <div className="h-px bg-border my-6" />

            <p className="text-center text-textSecondary text-sm">
              Remembered your password?
              <Link
                to="/login"
                className="text-primary font-bold hover:text-primaryDark ml-1"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
