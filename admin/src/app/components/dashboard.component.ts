import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ExpenseService, Expense } from '../services/expense.service';
import { Chart, ChartConfiguration } from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <nav class="navbar">
        <div class="nav-content">
          <h1>💼 Admin Dashboard</h1>
          <div class="nav-right">
            <span class="user-info">{{ currentUser?.name }}</span>
            <button (click)="logout()" class="btn-logout">Logout</button>
          </div>
        </div>
      </nav>

      <div class="dashboard-content">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">💰</div>
            <div class="stat-info">
              <h3>Total Expenses</h3>
              <p class="stat-value">\${{ totalAmount.toFixed(2) }}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div class="stat-info">
              <h3>Total Transactions</h3>
              <p class="stat-value">{{ expenses.length }}</p>
            </div>
          </div>
          <div class="stat-card pending">
            <div class="stat-icon">⏳</div>
            <div class="stat-info">
              <h3>Pending Review</h3>
              <p class="stat-value">{{ pendingCount }}</p>
            </div>
          </div>
          <div class="stat-card approved">
            <div class="stat-icon">✅</div>
            <div class="stat-info">
              <h3>Approved</h3>
              <p class="stat-value">{{ approvedCount }}</p>
            </div>
          </div>
        </div>

        <div class="charts-section">
          <div class="chart-card">
            <h3>Expenses by Category</h3>
            <canvas id="categoryChart"></canvas>
          </div>
          <div class="chart-card">
            <h3>Expenses by Status</h3>
            <canvas id="statusChart"></canvas>
          </div>
        </div>

        <div class="expenses-section">
          <h2>Pending Expense Approvals</h2>
          <div class="expenses-table">
            <div *ngIf="pendingExpenses.length === 0" class="no-data">
              No pending expenses to review
            </div>
            <div *ngFor="let expense of pendingExpenses" class="expense-row">
              <div class="expense-info">
                <div class="user-badge">{{ expense.user.name }}</div>
                <span class="expense-category">{{ expense.category }}</span>
                <span class="expense-description">{{ expense.description }}</span>
                <span class="expense-date">{{ formatDate(expense.date) }}</span>
              </div>
              <div class="expense-actions">
                <span class="expense-amount">\${{ expense.amount.toFixed(2) }}</span>
                <button (click)="approveExpense(expense._id)" class="btn-approve">
                  ✓ Approve
                </button>
                <button (click)="rejectExpense(expense._id)" class="btn-reject">
                  ✗ Reject
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="expenses-section">
          <h2>All Expenses</h2>
          <div class="filter-tabs">
            <button 
              [class.active]="filter === 'all'" 
              (click)="filterExpenses('all')"
              class="tab-btn">
              All ({{ expenses.length }})
            </button>
            <button 
              [class.active]="filter === 'pending'" 
              (click)="filterExpenses('pending')"
              class="tab-btn">
              Pending ({{ pendingCount }})
            </button>
            <button 
              [class.active]="filter === 'approved'" 
              (click)="filterExpenses('approved')"
              class="tab-btn">
              Approved ({{ approvedCount }})
            </button>
            <button 
              [class.active]="filter === 'rejected'" 
              (click)="filterExpenses('rejected')"
              class="tab-btn">
              Rejected ({{ rejectedCount }})
            </button>
          </div>
          <div class="expenses-table">
            <div *ngIf="filteredExpenses.length === 0" class="no-data">
              No expenses found
            </div>
            <div *ngFor="let expense of filteredExpenses" class="expense-row">
              <div class="expense-info">
                <div class="user-badge">{{ expense.user.name }}</div>
                <span class="expense-category">{{ expense.category }}</span>
                <span class="expense-description">{{ expense.description }}</span>
                <span class="expense-date">{{ formatDate(expense.date) }}</span>
              </div>
              <div class="expense-actions">
                <span class="expense-amount">\${{ expense.amount.toFixed(2) }}</span>
                <span class="status-badge" [class]="'status-' + expense.status">
                  {{ expense.status }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      min-height: 100vh;
      background: #f5f7fa;
    }

    .navbar {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1.25rem 0;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .nav-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .navbar h1 {
      margin: 0;
      font-size: 1.6rem;
    }

    .nav-right {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .user-info {
      font-weight: 500;
    }

    .btn-logout {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: 1px solid white;
      padding: 0.6rem 1.2rem;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.3s;
      font-weight: 500;
    }

    .btn-logout:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .dashboard-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: transform 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    }

    .stat-card.pending {
      border-left: 4px solid #ffa726;
    }

    .stat-card.approved {
      border-left: 4px solid #66bb6a;
    }

    .stat-icon {
      font-size: 2.5rem;
    }

    .stat-info h3 {
      margin: 0 0 0.25rem 0;
      color: #666;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .stat-value {
      margin: 0;
      font-size: 1.8rem;
      font-weight: bold;
      color: #333;
    }

    .charts-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .chart-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .chart-card h3 {
      margin: 0 0 1rem 0;
      color: #333;
    }

    .expenses-section {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      margin-bottom: 2rem;
    }

    .expenses-section h2 {
      margin: 0 0 1.5rem 0;
      color: #333;
    }

    .filter-tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }

    .tab-btn {
      padding: 0.6rem 1.2rem;
      border: 2px solid #e0e0e0;
      background: white;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s;
      font-weight: 500;
    }

    .tab-btn:hover {
      border-color: #667eea;
      color: #667eea;
    }

    .tab-btn.active {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }

    .expenses-table {
      max-height: 500px;
      overflow-y: auto;
    }

    .expense-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-bottom: 1px solid #f0f0f0;
      transition: background 0.2s;
    }

    .expense-row:hover {
      background: #f9f9f9;
    }

    .expense-info {
      display: flex;
      gap: 1rem;
      align-items: center;
      flex: 1;
      flex-wrap: wrap;
    }

    .user-badge {
      background: #e3f2fd;
      color: #1976d2;
      padding: 0.4rem 0.8rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .expense-category {
      background: #667eea;
      color: white;
      padding: 0.3rem 0.8rem;
      border-radius: 15px;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .expense-description {
      color: #333;
      flex: 1;
    }

    .expense-date {
      color: #999;
      font-size: 0.9rem;
    }

    .expense-actions {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }

    .expense-amount {
      font-weight: bold;
      color: #333;
      font-size: 1.1rem;
      min-width: 80px;
      text-align: right;
    }

    .btn-approve, .btn-reject {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
    }

    .btn-approve {
      background: #66bb6a;
      color: white;
    }

    .btn-approve:hover {
      background: #57a35b;
    }

    .btn-reject {
      background: #ef5350;
      color: white;
    }

    .btn-reject:hover {
      background: #d32f2f;
    }

    .status-badge {
      padding: 0.4rem 0.8rem;
      border-radius: 15px;
      font-size: 0.85rem;
      font-weight: 600;
      text-transform: capitalize;
    }

    .status-pending {
      background: #fff3e0;
      color: #f57c00;
    }

    .status-approved {
      background: #e8f5e9;
      color: #2e7d32;
    }

    .status-rejected {
      background: #ffebee;
      color: #c62828;
    }

    .no-data {
      text-align: center;
      padding: 2rem;
      color: #999;
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  expenses: Expense[] = [];
  filteredExpenses: Expense[] = [];
  pendingExpenses: Expense[] = [];
  filter = 'all';
  currentUser: any;
  
  totalAmount = 0;
  pendingCount = 0;
  approvedCount = 0;
  rejectedCount = 0;
  
  private refreshInterval: any;
  private categoryChart: Chart | null = null;
  private statusChart: Chart | null = null;

  constructor(
    private authService: AuthService,
    private expenseService: ExpenseService,
    private router: Router
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.loadExpenses();
    // Auto-refresh every 5 seconds to show new pending expenses
    this.refreshInterval = setInterval(() => {
      this.loadExpenses();
    }, 5000);
  }
  
  ngOnDestroy(): void {
    // Clear interval when component is destroyed
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    // Destroy charts
    if (this.categoryChart) {
      this.categoryChart.destroy();
    }
    if (this.statusChart) {
      this.statusChart.destroy();
    }
  }

  loadExpenses(): void {
    this.expenseService.getAllExpenses().subscribe({
      next: (expenses) => {
        console.log('Loaded expenses:', expenses.length);
        
        // Store all expenses
        this.expenses = expenses;
        this.pendingExpenses = expenses.filter(e => e.status === 'pending');
        
        // Calculate counts FIRST before filtering
        this.totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
        this.pendingCount = expenses.filter(e => e.status === 'pending').length;
        this.approvedCount = expenses.filter(e => e.status === 'approved').length;
        this.rejectedCount = expenses.filter(e => e.status === 'rejected').length;
        
        console.log('Counts - Pending:', this.pendingCount, 'Approved:', this.approvedCount, 'Rejected:', this.rejectedCount);
        
        // Apply current filter to update filteredExpenses
        this.filterExpenses(this.filter);
        
        // Create/update charts
        this.createCharts();
      },
      error: (error) => {
        console.error('Error loading expenses:', error);
        // Initialize empty state on error
        this.expenses = [];
        this.filteredExpenses = [];
        this.pendingExpenses = [];
        this.totalAmount = 0;
        this.pendingCount = 0;
        this.approvedCount = 0;
        this.rejectedCount = 0;
      }
    });
  }

  filterExpenses(status: string): void {
    this.filter = status;
    if (status === 'all') {
      this.filteredExpenses = [...this.expenses];
    } else {
      this.filteredExpenses = this.expenses.filter(e => e.status === status);
    }
    console.log('Filtered to', status, ':', this.filteredExpenses.length, 'expenses');
  }

  approveExpense(id: string): void {
    this.expenseService.updateExpenseStatus(id, 'approved').subscribe({
      next: () => {
        this.loadExpenses();
      },
      error: (error) => {
        console.error('Error approving expense:', error);
      }
    });
  }

  rejectExpense(id: string): void {
    if (confirm('Are you sure you want to reject this expense?')) {
      this.expenseService.updateExpenseStatus(id, 'rejected').subscribe({
        next: () => {
          this.loadExpenses();
        },
        error: (error) => {
          console.error('Error rejecting expense:', error);
        }
      });
    }
  }

  createCharts(): void {
    setTimeout(() => {
      this.createCategoryChart();
      this.createStatusChart();
    }, 100);
  }

  createCategoryChart(): void {
    const ctx = document.getElementById('categoryChart') as HTMLCanvasElement;
    if (!ctx) return;

    // Destroy existing chart before creating new one
    if (this.categoryChart) {
      this.categoryChart.destroy();
    }

    const categories: any = {};
    this.expenses.forEach(exp => {
      categories[exp.category] = (categories[exp.category] || 0) + exp.amount;
    });

    this.categoryChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: Object.keys(categories),
        datasets: [{
          data: Object.values(categories),
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
            '#9966FF', '#FF9F40', '#C9CBCF'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true
      }
    });
  }

  createStatusChart(): void {
    const ctx = document.getElementById('statusChart') as HTMLCanvasElement;
    if (!ctx) return;

    // Destroy existing chart before creating new one
    if (this.statusChart) {
      this.statusChart.destroy();
    }

    this.statusChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Pending', 'Approved', 'Rejected'],
        datasets: [{
          data: [this.pendingCount, this.approvedCount, this.rejectedCount],
          backgroundColor: ['#ffa726', '#66bb6a', '#ef5350']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true
      }
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
