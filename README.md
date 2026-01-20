# Smart Expense & Budget Tracking Platform

A comprehensive multi-application platform for expense tracking and budget management featuring separate user and admin interfaces.

## 🏗️ Architecture

This project consists of three main applications:

- **Client (React)**: User-facing budgeting app with interactive visualizations
- **Admin (Angular)**: Financial admin dashboard for expense review and analytics
- **Server (Node.js)**: RESTful API with JWT authentication and MongoDB integration

## 🚀 Features

### User Features (React Client)
- ✅ User authentication (register/login)
- ✅ Add, edit, and delete expenses
- ✅ Visual analytics with Chart.js (Pie & Bar charts)
- ✅ Expense categorization
- ✅ Real-time dashboard updates

### Admin Features (Angular Dashboard)
- 🔹 Review and approve/reject user expenses
- 🔹 Advanced analytics and reporting
- 🔹 User management
- 🔹 Export reports (PDF/CSV)

### Backend Features
- ✅ RESTful API with Express.js
- ✅ JWT-based authentication
- ✅ MongoDB database integration
- ✅ Role-based access control (User/Admin)
- ✅ Expense CRUD operations
- ✅ Budget management
- ✅ Report generation and export

## 📦 Tech Stack

### Client (React)
- React 18
- React Router DOM
- Chart.js & react-chartjs-2
- Axios for API calls
- Context API for state management

### Admin (Angular)
- Angular 21
- ng2-charts
- RxJS
- Angular Router

### Server (Node.js)
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- express-validator
- CORS enabled

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd "Smart Expense & Budget Tracking Platform"
```

### 2. Server Setup
```bash
cd server
npm install

# Configure environment variables
# Edit .env file with your settings:
# PORT=5000
# MONGODB_URI=mongodb://localhost:27017/expense-tracker
# JWT_SECRET=your_secret_key

# Start MongoDB locally (if not using Atlas)
# mongod

# Start the server
npm run dev
```

The server will run on `http://localhost:5000`

### 3. Client Setup
```bash
cd client
npm install

# Configure API URL (already set in .env)
# REACT_APP_API_URL=http://localhost:5000/api

# Start the React app
npm start
```

The client will run on `http://localhost:3000`

### 4. Admin Setup
```bash
cd admin
npm install

# Start the Angular app
npm start
```

The admin dashboard will run on `http://localhost:4200`

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Expense Endpoints (Requires Authentication)

#### Get User Expenses
```http
GET /api/expenses
Headers: x-auth-token: <jwt-token>
```

#### Add Expense
```http
POST /api/expenses
Headers: x-auth-token: <jwt-token>
Content-Type: application/json

{
  "category": "Food",
  "amount": 50.00,
  "description": "Grocery shopping",
  "date": "2026-01-20"
}
```

#### Update Expense
```http
PUT /api/expenses/:id
Headers: x-auth-token: <jwt-token>
Content-Type: application/json

{
  "category": "Transport",
  "amount": 30.00,
  "description": "Uber ride"
}
```

#### Delete Expense
```http
DELETE /api/expenses/:id
Headers: x-auth-token: <jwt-token>
```

### Budget Endpoints

#### Get User Budgets
```http
GET /api/budgets
Headers: x-auth-token: <jwt-token>
```

#### Create/Update Budget
```http
POST /api/budgets
Headers: x-auth-token: <jwt-token>
Content-Type: application/json

{
  "month": 1,
  "year": 2026,
  "totalBudget": 2000,
  "categoryBudgets": {
    "Food": 500,
    "Transport": 200,
    "Entertainment": 150
  }
}
```

### Report Endpoints

#### Get Expense Summary
```http
GET /api/reports/summary?startDate=2026-01-01&endDate=2026-01-31
Headers: x-auth-token: <jwt-token>
```

#### Export to CSV
```http
GET /api/reports/export?format=csv&startDate=2026-01-01&endDate=2026-01-31
Headers: x-auth-token: <jwt-token>
```

## 📁 Project Structure

```
Smart Expense & Budget Tracking Platform/
├── client/                    # React user application
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── Login.js
│   │   │   ├── Dashboard.js
│   │   │   └── *.css
│   │   ├── context/           # Context providers
│   │   │   └── AuthContext.js
│   │   ├── services/          # API services
│   │   │   └── api.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── admin/                     # Angular admin dashboard
│   ├── src/
│   │   ├── app/
│   │   └── ...
│   └── package.json
│
├── server/                    # Node.js backend
│   ├── models/                # MongoDB schemas
│   │   ├── User.js
│   │   ├── Expense.js
│   │   └── Budget.js
│   ├── routes/                # API routes
│   │   ├── auth.js
│   │   ├── expenses.js
│   │   ├── budgets.js
│   │   └── reports.js
│   ├── middleware/            # Auth & Admin middleware
│   │   ├── auth.js
│   │   └── admin.js
│   ├── index.js               # Server entry point
│   └── package.json
│
└── README.md
```

## 🔐 Security Features

- Passwords hashed with bcryptjs (10 salt rounds)
- JWT tokens with 7-day expiration
- Protected routes with authentication middleware
- Role-based access control for admin features
- CORS configured for API security

## 🎨 Expense Categories

- Food
- Transport
- Entertainment
- Bills
- Healthcare
- Shopping
- Other

## 📊 Data Models

### User Schema
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (user/admin),
  createdAt: Date
}
```

### Expense Schema
```javascript
{
  user: ObjectId (ref: User),
  category: String,
  amount: Number,
  description: String,
  date: Date,
  status: String (pending/approved/rejected),
  createdAt: Date
}
```

### Budget Schema
```javascript
{
  user: ObjectId (ref: User),
  month: Number (1-12),
  year: Number,
  totalBudget: Number,
  categoryBudgets: Object,
  createdAt: Date
}
```

## 🚦 Running in Production

### Server
```bash
cd server
npm start
```

### Client
```bash
cd client
npm run build
# Serve the build folder with a static server
```

### Admin
```bash
cd admin
npm run build
# Serve the dist folder with a static server
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Chart.js for beautiful visualizations
- MongoDB for flexible data storage
- Express.js for robust API development
- React and Angular teams for amazing frameworks
