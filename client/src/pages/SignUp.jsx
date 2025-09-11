import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { Link, useNavigate } from "react-router-dom";
import { Auth } from '../context/AuthContext';
import { Wallet, Sparkles } from 'lucide-react';
import axios from 'axios';

export default function SignUp() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = Auth();

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    try {
      const id_token = credentialResponse.credential;

      const res = await axios.post("http://localhost:5000/api/auth/google", {
        id_token,
        action: "signup"
      });

      const data = res.data;
      
      if (res.status === 200) {
        login(data.user, data.accessToken);
        
        localStorage.setItem('token', data.accessToken);

        if (data.isNewUser) {
          alert(`Welcome ${data.user.name}! Your account has been created successfully.`);
        } else {
          alert(`Welcome back ${data.user.name}! You already have an account.`);
        }
        
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Sign up error:", error);
      const message = error.response?.data?.message || "Network error. Please check your connection and try again.";
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    alert("Google Sign Up was cancelled or failed");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4" style={{fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"}}>
      {/* Background decorations */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <Wallet className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              WealthWise
            </span>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-200">
          <div className="text-center mb-8">
            <div className="mb-4 inline-flex items-center bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full px-4 py-2 border border-emerald-200">
              <Sparkles className="w-4 h-4 text-emerald-600 mr-2" />
              <span className="text-emerald-700 font-semibold text-sm">Join WealthWise</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Get Started</h2>
            <p className="text-gray-600">Create your financial dashboard today</p>
          </div>

          <div className="space-y-6">
            <div className="flex justify-center">
              {isLoading ? (
                <div className="flex items-center justify-center p-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
                  <span className="ml-2 text-gray-600">Creating account...</span>
                </div>
              ) : (
                <GoogleLogin 
                  onSuccess={handleGoogleSuccess} 
                  onError={handleGoogleError}
                  theme="outline"
                  size="large"
                  text="signup_with"
                  shape="rectangular"
                  width="300"
                />
              )}
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-emerald-700">
                    By signing up, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </div>
              </div>
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
                Already have an account?{" "}
                <Link 
                  to="/signin" 
                  className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}