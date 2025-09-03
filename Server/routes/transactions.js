const express = require('express');
const Transaction = require('../models/Transaction');
const { parseTransaction } = require('../services/aiService');
const verifyToken = require('../middleware/auth');

const router = express.Router();

// Parse transaction with AI
router.post('/transactions/parse', verifyToken, async (req, res) => {
  try {
    const { input } = req.body;
    console.log("Parsing input:", input);
    if (!input?.trim()) {
      return res.status(400).json({ message: 'Input is required' });
    }

    const parsed = await parseTransaction(input.trim());
    res.json({ parsed, originalInput: input });
  } catch (error) {
    console.error('Parse error:', error);
    res.status(500).json({ message: 'Failed to parse transaction' });
  }
});

// Create transaction
router.post('/transactions', verifyToken, async (req, res) => {
  try {
    const { amount, description, category, type, date, aiParsed, confidence } = req.body;
    
    if (!amount || !description || !category || !type) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const transaction = await Transaction.create({
      userId: req.user.userId,
      amount: Math.abs(parseFloat(amount)),
      description: description.trim(),
      category,
      type,
      date: date || new Date(),
      aiParsed: aiParsed || false,
      confidence: confidence || 1
    });
    console.log("Created transaction:", transaction);
    res.status(201).json(transaction);
  } catch (error) {
    console.error('Create error:', error);
    res.status(500).json({ message: 'Failed to create transaction' });
  }
});

// Get transactions
router.get('/transactions', verifyToken, async (req, res) => {
  try {
    const { category, type, startDate, endDate, page = 1, limit = 50 } = req.query;
    const query = { userId: req.user.userId };

    if (category) query.category = category;
    if (type) query.type = type;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query)
      .sort({ date: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Transaction.countDocuments(query);

    res.json({ 
      transactions, 
      pagination: { 
        page: parseInt(page), 
        limit: parseInt(limit), 
        total, 
        pages: Math.ceil(total / parseInt(limit)) 
      } 
    });
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
});

// Update transaction
router.put('/transactions/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, description, category, type, date } = req.body;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid transaction ID' });
    }

    const transaction = await Transaction.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      { 
        amount: Math.abs(parseFloat(amount)), 
        description: description.trim(), 
        category, 
        type, 
        date: date || new Date() 
      },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: 'Failed to update transaction' });
  }
});

// Delete transaction
router.delete('/transactions/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid transaction ID' });
    }

    const transaction = await Transaction.findOneAndDelete({ 
      _id: id, 
      userId: req.user.userId 
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Failed to delete transaction' });
  }
});

module.exports = router;