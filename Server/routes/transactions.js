const express = require('express');
const Transaction = require('../models/Transaction');
const { parseTransaction } = require('../services/aiService');
const verifyToken = require('../middleware/auth');

const router = express.Router();

// Parse transaction with Gemini AI
router.post('/transactions/parse', verifyToken, async (req, res) => {
  try {
    const { input } = req.body;
    console.log("Received parse request:", { input, userId: req.user.userId });
    
    if (!input?.trim()) {
      return res.status(400).json({ 
        success: false,
        message: 'Transaction description is required' 
      });
    }

    // Get user's recent transactions for context (helps AI learn patterns)
    const recentTransactions = await Transaction.find({ 
      userId: req.user.userId 
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .select('description category amount type')
    .lean();

    console.log(`Found ${recentTransactions.length} recent transactions for context`);

    // Parse with Gemini AI
    const parsed = await parseTransaction(input.trim(), recentTransactions);
    
    console.log("Parsed result:", parsed);

    res.json({ 
      success: true,
      parsed: parsed,
      originalInput: input
    });
    
  } catch (error) {
    console.error('Parse error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to parse transaction. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Create transaction
router.post('/transactions', verifyToken, async (req, res) => {
  try {
    const { 
      amount, 
      description, 
      category, 
      type, 
      date, 
      aiParsed, 
      confidence, 
      merchant,
      originalInput 
    } = req.body;
    
    console.log("Creating transaction:", { amount, description, category, type, aiParsed });
    
    // Validate required fields
    if (!amount || !description || !category || !type) {
      return res.status(400).json({ 
        success: false,
        message: 'Required fields missing: amount, description, category, type' 
      });
    }

    // Validate amount
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number'
      });
    }

    // Validate category
    const validCategories = [
      'Food', 'Transportation', 'Shopping', 'Entertainment', 
      'Bills', 'Healthcare', 'Education', 'Travel', 
      'Electronics', 'Gas', 'Income', 'Other'
    ];
    
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${validCategories.join(', ')}`
      });
    }

    // Validate type
    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be either "income" or "expense"'
      });
    }

    const transaction = await Transaction.create({
      userId: req.user.userId,
      amount: Math.abs(numAmount),
      description: description.trim(),
      category,
      type,
      date: date ? new Date(date) : new Date(),
      aiParsed: aiParsed || false,
      confidence: confidence || 1,
      merchant: merchant || null,
      originalInput: originalInput || null
    });
    
    console.log("Created transaction:", transaction._id);
    
    res.status(201).json({
      success: true,
      transaction: transaction
    });
    
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create transaction',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get transactions with filtering
router.get('/transactions', verifyToken, async (req, res) => {
  try {
    const { 
      category, 
      type, 
      startDate, 
      endDate, 
      page = 1, 
      limit = 50,
      search 
    } = req.query;
    
    const query = { userId: req.user.userId };

    // Add filters
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (type && type !== 'all') {
      query.type = type;
    }
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Add search functionality
    if (search && search.trim()) {
      query.$or = [
        { description: { $regex: search.trim(), $options: 'i' } },
        { merchant: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const transactions = await Transaction.find(query)
      .sort({ date: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Transaction.countDocuments(query);

    console.log(`Found ${transactions.length} transactions (${total} total) for user ${req.user.userId}`);

    res.json({ 
      success: true,
      transactions, 
      pagination: { 
        page: parseInt(page), 
        limit: parseInt(limit), 
        total, 
        pages: Math.ceil(total / parseInt(limit)) 
      } 
    });
    
  } catch (error) {
    console.error('Fetch transactions error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch transactions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update transaction
router.put('/transactions/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, description, category, type, date, merchant } = req.body;

    // Validate MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid transaction ID format' 
      });
    }

    // Validate required fields
    if (!amount || !description || !category || !type) {
      return res.status(400).json({
        success: false,
        message: 'Required fields missing: amount, description, category, type'
      });
    }

    const transaction = await Transaction.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      { 
        amount: Math.abs(parseFloat(amount)), 
        description: description.trim(), 
        category, 
        type, 
        date: date ? new Date(date) : new Date(),
        merchant: merchant || null,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({ 
        success: false,
        message: 'Transaction not found or you do not have permission to update it' 
      });
    }
    
    console.log("Updated transaction:", transaction._id);
    
    res.json({
      success: true,
      transaction: transaction
    });
    
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update transaction',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete transaction
router.delete('/transactions/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid transaction ID format' 
      });
    }

    const transaction = await Transaction.findOneAndDelete({ 
      _id: id, 
      userId: req.user.userId 
    });

    if (!transaction) {
      return res.status(404).json({ 
        success: false,
        message: 'Transaction not found or you do not have permission to delete it' 
      });
    }
    
    console.log("Deleted transaction:", transaction._id);
    
    res.json({ 
      success: true,
      message: 'Transaction deleted successfully' 
    });
    
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete transaction',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;