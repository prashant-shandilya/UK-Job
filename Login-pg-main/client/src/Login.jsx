import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

function Login() {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [msg] = useState('The password is incorrect');
  const navigate = useNavigate();
  const [flg, setFlg] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://127.0.0.1:3001/login', { email, password }).then(result => {
      if (result.data.msg === 'Success') {
        localStorage.setItem('email', email);
        localStorage.setItem('token', result.data.token);
        navigate('/home');
      } else if (result.data === 'navigate to setPswrd') {
        localStorage.setItem('email', email);
        navigate('/setPswrd');
      } else if (result.data === 'the password is incorrect') setFlg(true);
    })
      .catch(err => console.log(err));
  };

  return (
    <div className="main-content">
      <div className="card" style={{ maxWidth: 400, width: '100%' }}>
        <h2 className="form-section-title" style={{ textAlign: 'center' }}>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="Enter Email"
              name="email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter Password"
              name="password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {flg && <p style={{ color: 'red', fontSize: '1rem', marginTop: 8 }}>{msg}</p>}
          </div>
          <button type="submit" className="primary-btn" style={{ width: '100%', marginBottom: 12 }}>Login</button>
          <Link to="/forgot" style={{ display: 'block', textAlign: 'center', color: '#1976d2', marginBottom: 12 }}>Forgot password?</Link>
        </form>
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <span>Don't have an account? </span>
          <Link to="/register" style={{ color: '#1976d2', fontWeight: 500 }}>Register</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
