import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { Link, useNavigate } from "react-router-dom";
import { Auth } from '../context/AuthContext';
import axios from 'axios';
import "../App.css";

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = Auth();

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    try {
      const id_token = credentialResponse.credential;

      const res = await axios.post("http://localhost:5000/api/auth/google", {
        id_token,
        action: "signin"
      });

      const data = res.data;
      
      if (res.status === 200) {
        login(data.user, data.accessToken);
        navigate('/dashboard');
      }
      localStorage.setItem('token', data.accessToken);
    } catch (error) {
      console.error("Sign in error:", error);
      const message = error.response?.data?.message || "Network error. Please check your connection and try again.";
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    alert("Google Sign In was cancelled or failed");
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          <div className="space-y-6">
            <div className="flex justify-center">
              {isLoading ? (
                <div className="flex items-center justify-center p-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Signing in...</span>
                </div>
              ) : (
                <GoogleLogin 
                  onSuccess={handleGoogleSuccess} 
                  onError={handleGoogleError}
                  theme="outline"
                  size="large"
                  text="signin_with"
                  shape="rectangular"
                  width="300"
                />
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link 
                  to="/signup" 
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Sign up here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}