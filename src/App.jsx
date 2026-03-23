import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Home from './home/Home';
import ParentsDashboard from './ParentsDashboard';

// 1. Create a wrapper component that checks auth dynamically
const ProtectedRoute = ({ children }) => {
  // This now runs EVERY time someone tries to access a protected route
  const isAuth = !!localStorage.getItem('token'); 
  return isAuth ? children : <Navigate to="/login" replace />;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* 2. Wrap the Home component inside the ProtectedRoute */}
        <Route 
          path="/home" 
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } 
        />

        {/* Parents dashboard route */}
        <Route
          path="/ParentsDashboard"
          element={
            <ProtectedRoute>
              <ParentsDashboard />
            </ProtectedRoute>
          }
        />

        {/* Default Route */}
        <Route 
          path="*" 
          element={<Navigate to="/login" replace />} 
        />
      </Routes>
    </Router>
  );
};

export default App;