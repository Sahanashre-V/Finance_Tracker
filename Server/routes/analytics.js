const express = require('express');
const Transaction = require('../models/Transaction');
const verifyToken = require('../middleware/auth');

const router = express.Router();

// Summary
router.get('/analytics/summary', verifyToken, async (req, res) => {
  try {
    console.log('Summary request:', {
      userId: req.user.userId,
      query: req.query
    });

    const { startDate, endDate } = req.query;
    const dateFilter = { userId: req.user.userId };

    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) {
        dateFilter.date.$gte = new Date(startDate);
        console.log('Start date filter:', new Date(startDate));
      }
      if (endDate) {
        dateFilter.date.$lte = new Date(endDate);
        console.log('End date filter:', new Date(endDate));
      }
    }

    console.log('Date filter:', dateFilter);

    // Check if user has any transactions
    const totalTransactions = await Transaction.countDocuments({ userId: req.user.userId });
    console.log('Total transactions for user:', totalTransactions);

    const [incomeResult, expenseResult] = await Promise.all([
      Transaction.aggregate([
        { $match: { ...dateFilter, type: 'income' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Transaction.aggregate([
        { $match: { ...dateFilter, type: 'expense' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    console.log('Income result:', incomeResult);
    console.log('Expense result:', expenseResult);

    const income = incomeResult[0]?.total || 0;
    const expenses = expenseResult[0]?.total || 0;
    const savings = income - expenses;
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;

    const result = { 
      income, 
      expenses, 
      savings, 
      savingsRate 
    };

    console.log('Summary result:', result);
    res.json(result);
  } catch (error) {
    console.error('Summary error:', error);
    res.status(500).json({ message: 'Failed to fetch summary', error: error.message });
  }
});

// Categories
router.get('/analytics/categories', verifyToken, async (req, res) => {
  try {
    console.log('Categories request:', {
      userId: req.user.userId,
      query: req.query
    });

    const { startDate, endDate, type = 'expense' } = req.query;
    const dateFilter = { userId: req.user.userId, type };

    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.$gte = new Date(startDate);
      if (endDate) dateFilter.date.$lte = new Date(endDate);
    }

    console.log('Categories date filter:', dateFilter);

    const categories = await Transaction.aggregate([
      { $match: dateFilter },
      { 
        $group: { 
          _id: '$category', 
          total: { $sum: '$amount' }, 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { total: -1 } }
    ]);

    console.log('Categories raw result:', categories);

    const result = categories.map(cat => ({ 
      category: cat._id, 
      amount: cat.total, 
      count: cat.count 
    }));

    console.log('Categories result:', result);
    res.json(result);
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({ message: 'Failed to fetch categories', error: error.message });
  }
});

// Trends
router.get('/analytics/trends', verifyToken, async (req, res) => {
  try {
    console.log('Trends request:', {
      userId: req.user.userId,
      query: req.query
    });

    const { period = 'daily', days = 30 } = req.query;
    const startDate = new Date();
    const daysNum = parseInt(days);
    startDate.setDate(startDate.getDate() - daysNum);

    console.log('Trends date range:', {
      startDate,
      endDate: new Date(),
      days: daysNum
    });

    const groupBy = period === 'daily'
      ? { 
          year: { $year: '$date' }, 
          month: { $month: '$date' }, 
          day: { $dayOfMonth: '$date' } 
        }
      : { 
          year: { $year: '$date' }, 
          month: { $month: '$date' } 
        };

    const matchFilter = { 
      userId: req.user.userId, 
      date: { $gte: startDate } 
    };

    console.log('Trends match filter:', matchFilter);

    const trends = await Transaction.aggregate([
      { $match: matchFilter },
      { 
        $group: { 
          _id: { ...groupBy, type: '$type' }, 
          total: { $sum: '$amount' } 
        } 
      },
      { 
        $sort: { 
          '_id.year': 1, 
          '_id.month': 1, 
          '_id.day': 1 
        } 
      }
    ]);

    console.log('Trends result:', trends);
    res.json(trends);
  } catch (error) {
    console.error('Trends error:', error);
    res.status(500).json({ message: 'Failed to fetch trends', error: error.message });
  }
});

module.exports = router;