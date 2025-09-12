import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import SignIn from "./pages/SignIn";
import AboutPage from "./pages/About"; 
import './index.css';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function App() {
  // Add error handling for missing client ID
  if (!clientId) {
    console.error('Google Client ID is not configured');
    return <div>Configuration Error: Google Client ID is missing</div>;
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/about" element={<AboutPage />} />
            
            {/* Protected routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Redirect any unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}