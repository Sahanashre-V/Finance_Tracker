import React, { useState } from 'react';
import { Plus, Brain, Check, X } from 'lucide-react';
import axios from 'axios';

const TransactionForm = ({ onTransactionAdded }) => {
  const [input, setInput] = useState('');
  const [parsedTransaction, setParsedTransaction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const categories = [
    'Food', 'Transportation', 'Shopping', 'Entertainment',
    'Bills', 'Healthcare', 'Education', 'Travel',
    'Electronics', 'Gas', 'Income', 'Other'
  ];

  const handleParse = async () => {
    if (!input.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/transactions/parse', { input });
      setParsedTransaction({
        ...response.data.parsed,
        originalInput: input
      });
    } catch (error) {
      console.error('Parse error:', error);
      alert('Failed to parse transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!parsedTransaction) return;

    setSaving(true);
    try {
      const response = await axios.post('http://localhost:5000/api/transactions', {
        ...parsedTransaction,
        aiParsed: true
      });
      
      onTransactionAdded(response.data);
      setInput('');
      setParsedTransaction(null);
      setShowForm(false);
      alert('Transaction added successfully!');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save transaction. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReject = () => {
    setParsedTransaction(null);
    setInput('');
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    setSaving(true);
    try {
      const transaction = {
        amount: parseFloat(formData.get('amount')),
        description: formData.get('description'),
        category: formData.get('category'),
        type: formData.get('type'),
        aiParsed: false
      };

      const response = await axios.post('http://localhost:5000/api/transactions', transaction);
      onTransactionAdded(response.data);
      e.target.reset();
      setShowForm(false);
      alert('Transaction added successfully!');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save transaction. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Add Transaction</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Manual Entry
        </button>
      </div>

      {/* AI Natural Language Input */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Describe your transaction
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g., 'Bought coffee at Starbucks for $5.50'"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleParse()}
            />
            <button
              onClick={handleParse}
              disabled={!input.trim() || loading}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Brain className="w-4 h-4" />
              {loading ? 'Parsing...' : 'Parse'}
            </button>
          </div>
        </div>

        {/* AI Parsing Result */}
        {parsedTransaction && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-medium text-blue-900">AI Parsed Transaction</h3>
              <div className="text-sm text-blue-700">
                Confidence: {Math.round(parsedTransaction.confidence * 100)}%
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <span className="text-xs text-blue-600 uppercase tracking-wide">Amount</span>
                <div className="font-semibold text-blue-900">${parsedTransaction.amount}</div>
              </div>
              <div>
                <span className="text-xs text-blue-600 uppercase tracking-wide">Category</span>
                <div className="font-semibold text-blue-900">{parsedTransaction.category}</div>
              </div>
              <div>
                <span className="text-xs text-blue-600 uppercase tracking-wide">Type</span>
                <div className="font-semibold text-blue-900 capitalize">{parsedTransaction.type}</div>
              </div>
              <div>
                <span className="text-xs text-blue-600 uppercase tracking-wide">Description</span>
                <div className="font-semibold text-blue-900 truncate">{parsedTransaction.description}</div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleConfirm}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <Check className="w-4 h-4" />
                {saving ? 'Saving...' : 'Confirm & Save'}
              </button>
              <button
                onClick={handleReject}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <X className="w-4 h-4" />
                Reject
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Manual Entry Form */}
      {showForm && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Manual Entry</h3>
          <form onSubmit={handleManualSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <input
                type="number"
                name="amount"
                step="0.01"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                name="type"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select type</option>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                name="category"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                name="description"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Transaction description"
              />
            </div>

            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving...' : 'Add Transaction'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default TransactionForm;