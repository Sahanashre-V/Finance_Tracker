import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { Link } from "react-router-dom";

export default function SignUp() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    try {
      const id_token = credentialResponse.credential;

      const res = await fetch("http://localhost:5000/auth/google", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({ id_token, action: "signup" }),
      });

      const data = await res.json();
      
      if (res.ok) {
        // Store token securely (in a real app, consider using httpOnly cookies)
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        if (data.isNewUser) {
          alert(`Welcome ${data.user.name}! Your account has been created successfully.`);
        } else {
          alert(`Welcome back ${data.user.name}! You already have an account.`);
        }
        
        // Navigate to dashboard or home page
        // navigate('/dashboard');
      } else {
        alert(data.message || "Sign up failed. Please try again.");
      }
    } catch (error) {
      console.error("Sign up error:", error);
      alert("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    alert("Google Sign Up was cancelled or failed");
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Get Started</h2>
            <p className="text-gray-600">Create your new account</p>
          </div>

          <div className="space-y-6">
            <div className="flex justify-center">
              {isLoading ? (
                <div className="flex items-center justify-center p-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
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

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
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
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
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