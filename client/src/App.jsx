import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function App() {
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-4xl mx-auto px-4 py-4">
              <div className="flex justify-between items-center">
                <h1 className="text-xl font-bold text-gray-800">MyApp</h1>
                <div className="flex gap-4">
                  <Link 
                    to="/signin" 
                    className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/signup" 
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
            </div>
          </nav>
          
          <Routes>
            <Route path="/" element={<Navigate to="/signin" replace />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
          </Routes>
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
}