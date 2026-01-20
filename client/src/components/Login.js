import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './Login.css';

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const { login, register } = useContext(AuthContext);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    let result;
    if (isLogin) {
      result = await login(formData.email, formData.password);
    } else {
      result = await register(formData.name, formData.email, formData.password);
    }

    if (!result.success) {
      setError(result.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>{isLogin ? 'Login' : 'Register'}</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn-primary">
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>
        <p className="toggle-text">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <span onClick={() => setIsLogin(!isLogin)} className="toggle-link">
            {isLogin ? 'Register' : 'Login'}
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;
