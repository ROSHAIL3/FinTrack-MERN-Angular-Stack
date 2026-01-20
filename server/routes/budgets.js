const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Budget = require('../models/Budget');

// @route   GET /api/budgets
// @desc    Get all budgets for logged in user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user.id }).sort({ year: -1, month: -1 });
    res.json(budgets);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/budgets/:month/:year
// @desc    Get budget for specific month/year
// @access  Private
router.get('/:month/:year', auth, async (req, res) => {
  try {
    const budget = await Budget.findOne({
      user: req.user.id,
      month: req.params.month,
      year: req.params.year
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    res.json(budget);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/budgets
// @desc    Create or update budget
// @access  Private
router.post('/', auth, async (req, res) => {
  const { month, year, totalBudget, categoryBudgets } = req.body;

  try {
    let budget = await Budget.findOne({
      user: req.user.id,
      month,
      year
    });

    if (budget) {
      budget = await Budget.findByIdAndUpdate(
        budget._id,
        { $set: { totalBudget, categoryBudgets } },
        { new: true }
      );
    } else {
      budget = new Budget({
        user: req.user.id,
        month,
        year,
        totalBudget,
        categoryBudgets
      });
      await budget.save();
    }

    res.json(budget);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/budgets/:id
// @desc    Delete budget
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    let budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    if (budget.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await Budget.findByIdAndDelete(req.params.id);
    res.json({ message: 'Budget removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
