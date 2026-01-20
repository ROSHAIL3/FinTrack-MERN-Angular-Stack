const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true
  },
  totalBudget: {
    type: Number,
    required: true
  },
  categoryBudgets: {
    Food: { type: Number, default: 0 },
    Transport: { type: Number, default: 0 },
    Entertainment: { type: Number, default: 0 },
    Bills: { type: Number, default: 0 },
    Healthcare: { type: Number, default: 0 },
    Shopping: { type: Number, default: 0 },
    Other: { type: Number, default: 0 }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Budget', BudgetSchema);
