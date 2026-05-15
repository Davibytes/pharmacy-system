import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Pharmacy from './pages/Pharmacy';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
          
          <Route 
            path="/dashboard" 
            element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
          />
          <Route 
            path="/pharmacy" 
            element={<ProtectedRoute><Pharmacy /></ProtectedRoute>} 
          />
          <Route 
            path="/inventory" 
            element={<ProtectedRoute><Inventory /></ProtectedRoute>} 
          />
          <Route 
            path="/orders" 
            element={<ProtectedRoute><Orders /></ProtectedRoute>} 
          />
          <Route 
            path="/profile" 
            element={<ProtectedRoute><Profile /></ProtectedRoute>} 
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
