const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  date: { type: Date, default: Date.now },
  aiParsed: { type: Boolean, default: false },
  confidence: { type: Number, default: 1 }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);