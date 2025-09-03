const express = require('express');
const Transaction = require('../models/Transaction');
const verifyToken = require('../middleware/auth');

const router = express.Router();

// Summary
router.get('/summary', verifyToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = { userId: req.user.userId };

    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.$gte = new Date(startDate);
      if (endDate) dateFilter.date.$lte = new Date(endDate);
    }

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

    const income = incomeResult[0]?.total || 0;
    const expenses = expenseResult[0]?.total || 0;
    const savings = income - expenses;
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;

    res.json({ 
      income, 
      expenses, 
      savings, 
      savingsRate 
    });
  } catch (error) {
    console.error('Summary error:', error);
    res.status(500).json({ message: 'Failed to fetch summary' });
  }
});

// Categories
router.get('/categories', verifyToken, async (req, res) => {
  try {
    const { startDate, endDate, type = 'expense' } = req.query;
    const dateFilter = { userId: req.user.userId, type };

    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.$gte = new Date(startDate);
      if (endDate) dateFilter.date.$lte = new Date(endDate);
    }

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

    const result = categories.map(cat => ({ 
      category: cat._id, 
      amount: cat.total, 
      count: cat.count 
    }));

    res.json(result);
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
});

// Trends
router.get('/trends', verifyToken, async (req, res) => {
  try {
    const { period = 'daily', days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

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

    const trends = await Transaction.aggregate([
      { 
        $match: { 
          userId: req.user.userId, 
          date: { $gte: startDate } 
        } 
      },
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

    res.json(trends);
  } catch (error) {
    console.error('Trends error:', error);
    res.status(500).json({ message: 'Failed to fetch trends' });
  }
});

module.exports = router;