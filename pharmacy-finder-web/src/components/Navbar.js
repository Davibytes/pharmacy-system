import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Button from './Button';

export default function Navbar() {
  const { user } = useContext(AuthContext);

  if (!user) {
    return (
      <nav className="bg-white border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/">
            <img src="/assets/logo-nobk.jpeg" alt="Logo" className="h-10" />
          </Link>
          <div className="flex gap-4">
            <Link to="/login">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white border-b border-border">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/">
          <img src="/assets/logo-nobk.jpeg" alt="Logo" className="h-10" />
        </Link>

        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="text-text hover:text-primary transition font-semibold">
            Dashboard
          </Link>
          <Link to="/pharmacy" className="text-text hover:text-primary transition font-semibold">
            Pharmacy
          </Link>
          <Link to="/inventory" className="text-text hover:text-primary transition font-semibold">
            Inventory
          </Link>
          <Link to="/profile" className="text-text hover:text-primary transition font-semibold">
            Profile
          </Link>
        </div>
      </div>
    </nav>
  );
}
