import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import './Dashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category: 'Food',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchExpenses();
    
    // Auto-refresh every 5 seconds to see status updates from admin
    const interval = setInterval(() => {
      fetchExpenses();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await api.get('/expenses');
      setExpenses(res.data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/expenses', formData);
      setFormData({
        category: 'Food',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      setShowForm(false);
      fetchExpenses();
      alert('✅ Expense submitted! Waiting for admin approval.');
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('❌ Failed to add expense. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await api.delete(`/expenses/${id}`);
        fetchExpenses();
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  const getCategoryData = () => {
    const categories = {};
    expenses.forEach(exp => {
      categories[exp.category] = (categories[exp.category] || 0) + exp.amount;
    });

    return {
      labels: Object.keys(categories),
      datasets: [{
        data: Object.values(categories),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF'
        ]
      }]
    };
  };

  const getMonthlyData = () => {
    const monthlyExpenses = {};
    expenses.forEach(exp => {
      const month = new Date(exp.date).toLocaleDateString('en-US', { month: 'short' });
      monthlyExpenses[month] = (monthlyExpenses[month] || 0) + exp.amount;
    });

    return {
      labels: Object.keys(monthlyExpenses),
      datasets: [{
        label: 'Monthly Spending',
        data: Object.values(monthlyExpenses),
        backgroundColor: '#667eea'
      }]
    };
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Expense Dashboard</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : '+ Add Expense'}
        </button>
      </div>

      {showForm && (
        <div className="expense-form-card">
          <h3>Add New Expense</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option>Food</option>
                  <option>Transport</option>
                  <option>Entertainment</option>
                  <option>Bills</option>
                  <option>Healthcare</option>
                  <option>Shopping</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Amount</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn-primary">Add Expense</button>
          </form>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Expenses</h3>
          <p className="stat-value">${totalExpenses.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h3>Transaction Count</h3>
          <p className="stat-value">{expenses.length}</p>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Spending by Category</h3>
          {expenses.length > 0 ? (
            <Pie data={getCategoryData()} />
          ) : (
            <p>No expenses to display</p>
          )}
        </div>
        <div className="chart-card">
          <h3>Monthly Spending</h3>
          {expenses.length > 0 ? (
            <Bar data={getMonthlyData()} />
          ) : (
            <p>No expenses to display</p>
          )}
        </div>
      </div>

      <div className="expenses-list">
        <h3>Recent Expenses</h3>
        <div className="expenses-table">
          {expenses.map(expense => (
            <div key={expense._id} className="expense-row">
              <div className="expense-info">
                <span className="expense-category">{expense.category}</span>
                <span className="expense-description">{expense.description}</span>
                <span className="expense-date">
                  {new Date(expense.date).toLocaleDateString()}
                </span>
                <span className={`status-badge status-${expense.status}`}>
                  {expense.status === 'pending' && '⏳ Pending Approval'}
                  {expense.status === 'approved' && '✅ Approved'}
                  {expense.status === 'rejected' && '❌ Rejected'}
                </span>
              </div>
              <div className="expense-actions">
                <span className="expense-amount">${expense.amount.toFixed(2)}</span>
                <button onClick={() => handleDelete(expense._id)} className="btn-delete">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
