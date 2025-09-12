import React, { useState, useEffect, useCallback } from 'react';
import { Auth } from '../context/AuthContext';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import Charts from '../components/Charts';
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, LogOut, User, Wallet, Sparkles, Github, Linkedin } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, token, logout } = Auth();
  const [transactions, setTransactions] = useState([]);
  const [analytics, setAnalytics] = useState({
    summary: { income: 0, expenses: 0, savings: 0, savingsRate: 0 },
    categories: [],
    trends: []
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      
      const days = parseInt(dateRange);
      startDate.setDate(startDate.getDate() - days);

      if (!token) {
        throw new Error('No authentication token found');
      }

      const [transactionsRes, summaryRes, categoriesRes, trendsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/transactions`, {
          params: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            limit: 100
          }
        }),
        axios.get(`${API_BASE_URL}/api/analytics/summary`, {
          params: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          }
        }),
        axios.get(`${API_BASE_URL}/api/analytics/categories`, {
          params: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            type: 'expense'
          }
        }),
        axios.get(`${API_BASE_URL}/api/analytics/trends`, {
          params: {
            period: 'daily',
            days: dateRange
          }
        })
      ]);

      setTransactions(transactionsRes.data.transactions || transactionsRes.data || []);
      setAnalytics({
        summary: summaryRes.data || { income: 0, expenses: 0, savings: 0, savingsRate: 0 },
        categories: categoriesRes.data || [],
        trends: trendsRes.data || []
      });
    } catch (error) {
      console.error('Failed to fetch data:', error);
      
      if (error.response) {
        if (error.response.status === 401) {
          alert('Your session has expired. Please log in again.');
          logout();
          navigate('/signin');
          return;
        }
        alert(`Server error: ${error.response.data.message || error.response.status}`);
      } else if (error.request) {
        alert('Unable to connect to server. Please check if the server is running.');
      } else {
        alert(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [dateRange, token, logout, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTransactionAdded = useCallback((newTransaction) => {
    setTransactions(prev => [newTransaction, ...prev]);
    fetchData();
  }, [fetchData]);

  const handleTransactionUpdated = useCallback((updatedTransaction) => {
    setTransactions(prev => 
      prev.map(t => t._id === updatedTransaction._id ? updatedTransaction : t)
    );
    fetchData();
  }, [fetchData]);

  const handleTransactionDeleted = useCallback((deletedId) => {
    setTransactions(prev => prev.filter(t => t._id !== deletedId));
    fetchData();
  }, [fetchData]);

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/auth/logout`);
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      logout();
      navigate('/signin');
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center" style={{fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"}}>
        {/* Background decorations */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
        
        <div className="text-center relative z-10">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Background decorations */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
      
      <header className="bg-white/95 backdrop-blur-xl shadow-lg relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  WealthWise
                </span>
              </div>
              
              <div className="ml-6 inline-flex items-center bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full px-4 py-2 border border-emerald-200">
                <Sparkles className="w-4 h-4 text-emerald-600 mr-2" />
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="bg-transparent text-emerald-700 font-semibold text-sm border-none outline-none cursor-pointer"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 3 months</option>
                  <option value="365">Last year</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-xl px-4 py-2 border border-gray-200">
                {user?.picture && (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border-2 border-emerald-200"
                  />
                )}
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200 hover:bg-white/90 transition-all group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Income</p>
                <p className="text-2xl font-bold text-green-600">
                  ${(analytics.summary.income || 0).toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200 hover:bg-white/90 transition-all group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">
                  ${(analytics.summary.expenses || 0).toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full group-hover:scale-110 transition-transform">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200 hover:bg-white/90 transition-all group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Savings</p>
                <p className={`text-2xl font-bold ${(analytics.summary.savings || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  ${(analytics.summary.savings || 0).toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-full group-hover:scale-110 transition-transform">
                <PiggyBank className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200 hover:bg-white/90 transition-all group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Savings Rate</p>
                <p className={`text-2xl font-bold ${(analytics.summary.savingsRate || 0) >= 0 ? 'text-teal-600' : 'text-red-600'}`}>
                  {(analytics.summary.savingsRate || 0).toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-teal-100 rounded-full group-hover:scale-110 transition-transform">
                <DollarSign className="w-6 h-6 text-teal-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Transaction Form Container */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-6">
            <TransactionForm onTransactionAdded={handleTransactionAdded} />
          </div>

          {/* Charts Container */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-6">
            <Charts analytics={analytics} />
          </div>

          {/* Transaction List Container */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-6">
            <TransactionList
              transactions={transactions}
              onTransactionUpdated={handleTransactionUpdated}
              onTransactionDeleted={handleTransactionDeleted}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          {/* Text */}
          <p className="text-gray-300 font-bold text-lg">
            © 2025 WealthWise. All rights reserved.
          </p>
          <p className="text-gray-400 text-base mt-2">
            Made with <span className="text-emerald-400">❤️</span> for better
            financial wellness
          </p>

          {/* Socials */}
          <div className="flex space-x-4 mt-6">
            <a
              href="https://github.com/Sahanashre-V/"
              className="w-11 h-11 bg-gray-800 rounded-lg flex items-center justify-center text-gray-300 hover:text-white hover:bg-emerald-600 transition-all"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="https://www.linkedin.com/in/sahanashre-v/"
              className="w-11 h-11 bg-gray-800 rounded-lg flex items-center justify-center text-gray-300 hover:text-white hover:bg-emerald-600 transition-all"
            >
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;