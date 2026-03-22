import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Home from './Home'; // <-- Now importing Home

const App = () => {
  // Check if user is logged in (your seniors will likely set a token in localStorage)
  const isAuthenticated = !!localStorage.getItem('token'); 

  return (
    <Router>
      <Routes>
        {/* Route 1: The Login Page */}
        <Route path="/login" element={<Login />} />

        {/* Route 2: The Main Application (Protected) */}
        <Route 
          path="/home" 
          element={
            isAuthenticated ? <Home /> : <Navigate to="/login" replace />
          } 
        />

        {/* Default Route: Redirect to Home if logged in, else login */}
        <Route 
          path="*" 
          element={<Navigate to={isAuthenticated ? "/home" : "/login"} replace />} 
        />
      </Routes>
    </Router>
  );
};

export default App;