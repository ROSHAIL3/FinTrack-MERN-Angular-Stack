const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');

// @route   GET /api/reports/summary
// @desc    Get expense summary for logged in user
// @access  Private
router.get('/summary', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = { user: req.user.id };
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const expenses = await Expense.find(query);

    const summary = {
      totalExpenses: expenses.length,
      totalAmount: expenses.reduce((sum, exp) => sum + exp.amount, 0),
      byCategory: {},
      byStatus: {
        pending: 0,
        approved: 0,
        rejected: 0
      }
    };

    expenses.forEach(exp => {
      if (!summary.byCategory[exp.category]) {
        summary.byCategory[exp.category] = { count: 0, amount: 0 };
      }
      summary.byCategory[exp.category].count++;
      summary.byCategory[exp.category].amount += exp.amount;
      summary.byStatus[exp.status]++;
    });

    res.json(summary);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/reports/budget-comparison
// @desc    Compare expenses vs budget for a specific month
// @access  Private
router.get('/budget-comparison', auth, async (req, res) => {
  try {
    const { month, year } = req.query;

    const budget = await Budget.findOne({
      user: req.user.id,
      month: parseInt(month),
      year: parseInt(year)
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found for this month' });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const expenses = await Expense.find({
      user: req.user.id,
      date: { $gte: startDate, $lte: endDate }
    });

    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const categorySpending = {};

    expenses.forEach(exp => {
      if (!categorySpending[exp.category]) {
        categorySpending[exp.category] = 0;
      }
      categorySpending[exp.category] += exp.amount;
    });

    const comparison = {
      totalBudget: budget.totalBudget,
      totalSpent,
      remaining: budget.totalBudget - totalSpent,
      categories: {}
    };

    Object.keys(budget.categoryBudgets).forEach(category => {
      comparison.categories[category] = {
        budget: budget.categoryBudgets[category],
        spent: categorySpending[category] || 0,
        remaining: budget.categoryBudgets[category] - (categorySpending[category] || 0)
      };
    });

    res.json(comparison);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/reports/export
// @desc    Export expense data (CSV format)
// @access  Private
router.get('/export', auth, async (req, res) => {
  try {
    const { startDate, endDate, format } = req.query;

    const query = { user: req.user.id };
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const expenses = await Expense.find(query).sort({ date: -1 });

    if (format === 'csv') {
      let csv = 'Date,Category,Description,Amount,Status\n';
      expenses.forEach(exp => {
        csv += `${exp.date.toISOString().split('T')[0]},${exp.category},"${exp.description}",${exp.amount},${exp.status}\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=expenses.csv');
      res.send(csv);
    } else {
      res.json(expenses);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
