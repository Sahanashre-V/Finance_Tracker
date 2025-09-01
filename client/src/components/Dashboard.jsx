import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Finance Tracker</h1>
          <div className="flex items-center space-x-4">
            <img src={user?.picture} alt={user?.name} className="w-8 h-8 rounded-full" />
            <span className="text-sm">{user?.name}</span>
            <button
              onClick={logout}
              className="text-sm text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Welcome, {user?.name}!</h2>
          <p className="text-gray-600">Your dashboard is ready!</p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;