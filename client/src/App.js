import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import './App.css';

function PrivateRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return user ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  const { user, logout } = useContext(AuthContext);

  return (
    <Router>
      <div className="App">
        {user && (
          <nav className="navbar">
            <h1>💰 Expense Tracker</h1>
            <div className="nav-right">
              <span>Welcome, {user.name}</span>
              <button onClick={logout} className="btn-logout">Logout</button>
            </div>
          </nav>
        )}
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;

