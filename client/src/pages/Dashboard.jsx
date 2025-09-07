import React, { useState, useEffect, useCallback } from 'react';
import { Auth } from '../context/AuthContext';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import Charts from '../components/Charts';
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, LogOut, User } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">FinanceAI</h1>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 3 months</option>
                <option value="365">Last year</option>
              </select>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {user?.picture && (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Income</p>
                <p className="text-2xl font-bold text-green-600">
                  ${(analytics.summary.income || 0).toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">
                  ${(analytics.summary.expenses || 0).toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Savings</p>
                <p className={`text-2xl font-bold ${(analytics.summary.savings || 0) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  ${(analytics.summary.savings || 0).toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <PiggyBank className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Savings Rate</p>
                <p className={`text-2xl font-bold ${(analytics.summary.savingsRate || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {(analytics.summary.savingsRate || 0).toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        <TransactionForm onTransactionAdded={handleTransactionAdded} />
        <Charts analytics={analytics} />
        <TransactionList
          transactions={transactions}
          onTransactionUpdated={handleTransactionUpdated}
          onTransactionDeleted={handleTransactionDeleted}
        />
      </div>
    </div>
  );
};

export default Dashboard;