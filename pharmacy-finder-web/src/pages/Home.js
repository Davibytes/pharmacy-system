import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Button from '../components/Button';

export default function Home() {
  const { user } = useContext(AuthContext);

  if (user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-6 py-12">
          {/* Logo Section */}
          <div className="flex justify-center mb-12 mt-8">
            <div className="bg-white rounded-lg border border-border p-0 shadow-sm">
              <img 
                src="/assets/logo-nobk.jpeg" 
                alt="Logo" 
                className="h-32 w-32 object-contain" 
              />
            </div>
          </div>

          {/* Welcome Content */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-text mb-4">
              Welcome, {user.fullName}!
            </h1>
            <p className="text-lg text-textSecondary mb-8">
              Manage your pharmacy operations efficiently and reach more customers
            </p>
          </div>

          {/* Features Card */}
          <div className="bg-white rounded-lg border border-border p-8 mb-12 shadow-sm">
          <div className="space-y-6">
            <FeatureItem 
              title="Real-time Dashboard" 
              description="Monitor orders and sales instantly"
              />
              <FeatureItem 
                title="Manage Inventory" 
                description="Track medicines and stock levels"
              />
              <FeatureItem 
              title="Update Details" 
              description="Keep your pharmacy info current"
            />
          </div>
        </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link to="/dashboard" className="block">
              <Button className="w-full">Go to Dashboard</Button>
            </Link>
            
            <div className="h-px bg-border my-6" />

            <Link to="/pharmacy" className="block">
              <Button variant="outline" className="w-full">
                Update Pharmacy
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-6 py-12">
      {/* Logo Section */}
      <div className="flex justify-center mb-12">
        <div className="bg-white rounded-lg border border-border p-0 shadow-sm">
          <img 
            src="/assets/logo-nobk.jpeg" 
            alt="Logo" 
            className="h-40 w-40 object-contain" 
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="text-center max-w-2xl mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-text mb-4">
          Pharmacy Finder
        </h1>
        <p className="text-xl text-textSecondary mb-2">
          Pharmacy Management System
        </p>
        <p className="text-lg text-textSecondary">
          Connect with customers and manage your pharmacy efficiently
        </p>
      </div>

      {/* Features Card */}
      <div className="bg-white rounded-lg border border-border p-8 max-w-2xl w-full mb-12 shadow-sm">
        <div className="space-y-6">
          <FeatureItem 
            title="Quick Registration" 
            description="Get started in minutes with easy setup"
          />
          <FeatureItem 
            title="Customer Discovery" 
            description="Be found by customers in your area"
          />
          <FeatureItem 
            title="Easy Management" 
            description="Simple tools to run your pharmacy"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="max-w-2xl w-full space-y-4">
        <Link to="/login">
          <Button className="w-full">Sign In</Button>
        </Link>
        
        <div className="h-px bg-border my-6" />

        <Link to="/signup">
          <Button variant="outline" className="w-full">
            Sign Up
          </Button>
        </Link>
      </div>
    </div>
  );
}

function FeatureItem({ title, description }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="mt-1.5 flex-shrink-0">
        <div className="w-2 h-2 rounded-full bg-primary" />
      </div>
      <div>
        <p className="font-semibold text-text mb-1">{title}</p>
        <p className="text-sm text-textSecondary">{description}</p>
      </div>
    </div>
  );
}
