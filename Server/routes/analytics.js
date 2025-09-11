const express = require('express');
const Transaction = require('../models/Transaction');
const verifyToken = require('../middleware/auth');

const router = express.Router();

router.get('/analytics/summary', verifyToken, async (req, res) => {
  try {
    // console.log('Summary request with raw queries:', {
    //   userId: req.user.userId,
    //   query: req.query
    // });

    const { startDate, endDate } = req.query;
    let dateFilter = { userId: req.user.userId };

    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) {
        dateFilter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.date.$lte = new Date(endDate);
      }
    }

    // console.log('Date filter:', dateFilter);

    // Raw queries instead of aggregation
    const incomeTransactions = await Transaction.find({ 
      ...dateFilter, 
      type: 'income' 
    });
    
    const expenseTransactions = await Transaction.find({ 
      ...dateFilter, 
      type: 'expense' 
    });

    // console.log('Found income transactions:', incomeTransactions.length);
    // console.log('Found expense transactions:', expenseTransactions.length);

    // Calculate totals manually
    const income = incomeTransactions.reduce((total, transaction) => {
      return total + (transaction.amount || 0);
    }, 0);

    const expenses = expenseTransactions.reduce((total, transaction) => {
      return total + (transaction.amount || 0);
    }, 0);

    const savings = income - expenses;
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;

    const result = { 
      income, 
      expenses, 
      savings, 
      savingsRate 
    };

    // console.log('Summary result from raw queries:', result);
    res.json(result);
  } catch (error) {
    console.error('Summary error:', error);
    res.status(500).json({ message: 'Failed to fetch summary', error: error.message });
  }
});

// Categories - Using raw database queries
router.get('/analytics/categories', verifyToken, async (req, res) => {
  try {
    // console.log('Categories request with raw queries');

    const { startDate, endDate, type = 'expense' } = req.query;
    let categoryFilter = { userId: req.user.userId, type };

    if (startDate || endDate) {
      categoryFilter.date = {};
      if (startDate) categoryFilter.date.$gte = new Date(startDate);
      if (endDate) categoryFilter.date.$lte = new Date(endDate);
    }

    // console.log('Categories filter:', categoryFilter);

    // Get all transactions of the specified type
    const transactions = await Transaction.find(categoryFilter);
    // console.log('Found transactions for categories:', transactions.length);

    // Group by category manually
    const categoryMap = {};
    
    transactions.forEach(transaction => {
      const category = transaction.category || 'Other';
      
      if (!categoryMap[category]) {
        categoryMap[category] = {
          category: category,
          amount: 0,
          count: 0
        };
      }
      
      categoryMap[category].amount += transaction.amount || 0;
      categoryMap[category].count += 1;
    });

    // Convert to array and sort by amount
    const result = Object.values(categoryMap)
      .sort((a, b) => b.amount - a.amount);

    // console.log('Categories result from raw queries:', result);
    res.json(result);
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({ message: 'Failed to fetch categories', error: error.message });
  }
});

// Trends - Using raw database queries
router.get('/analytics/trends', verifyToken, async (req, res) => {
  try {
    // console.log('Trends request with raw queries');

    const { period = 'daily', days = 30 } = req.query;
    const endDate = new Date();
    const startDate = new Date();
    const daysNum = parseInt(days);
    startDate.setDate(startDate.getDate() - daysNum);

    // console.log('Trends date range:', {
    //   startDate,
    //   endDate,
    //   days: daysNum
    // });

    const trendsFilter = { 
      userId: req.user.userId, 
      date: { $gte: startDate, $lte: endDate } 
    };

    // Get all transactions in the date range
    const transactions = await Transaction.find(trendsFilter);
    // console.log('Found transactions for trends:', transactions.length);

    // Group by date and type manually
    const trendsMap = {};

    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      
      // Create date key based on period
      let dateKey;
      if (period === 'daily') {
        dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      } else {
        dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      const type = transaction.type;
      const key = `${dateKey}_${type}`;

      if (!trendsMap[key]) {
        trendsMap[key] = {
          _id: {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            ...(period === 'daily' ? { day: date.getDate() } : {}),
            type: type
          },
          total: 0
        };
      }

      trendsMap[key].total += transaction.amount || 0;
    });

    // Convert to array and sort by date
    const result = Object.values(trendsMap)
      .sort((a, b) => {
        if (a._id.year !== b._id.year) return a._id.year - b._id.year;
        if (a._id.month !== b._id.month) return a._id.month - b._id.month;
        if (period === 'daily' && a._id.day !== b._id.day) return a._id.day - b._id.day;
        return 0;
      });

    // console.log('Trends result from raw queries:', result);
    res.json(result);
  } catch (error) {
    console.error('Trends error:', error);
    res.status(500).json({ message: 'Failed to fetch trends', error: error.message });
  }
});

module.exports = router;