import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Expense {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  category: string;
  amount: number;
  description: string;
  date: string;
  status: string;
  createdAt: string;
}

export interface ExpenseSummary {
  totalExpenses: number;
  totalAmount: number;
  byCategory: any;
  byStatus: {
    pending: number;
    approved: number;
    rejected: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'x-auth-token': token || ''
    });
  }

  getAllExpenses(): Observable<Expense[]> {
    return this.http.get<Expense[]>(`${this.apiUrl}/expenses/all`, {
      headers: this.getHeaders()
    });
  }

  updateExpenseStatus(id: string, status: string): Observable<Expense> {
    return this.http.put<Expense>(
      `${this.apiUrl}/expenses/${id}/status`,
      { status },
      { headers: this.getHeaders() }
    );
  }

  getExpenseSummary(startDate?: string, endDate?: string): Observable<ExpenseSummary> {
    let url = `${this.apiUrl}/reports/summary`;
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    return this.http.get<ExpenseSummary>(url, {
      headers: this.getHeaders()
    });
  }
}
