import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

function Register() {
  const [name, setName] = useState();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [link, setLink] = useState();
  const navigate = useNavigate();

  const handleClick = async (e) => {
    e.preventDefault();
    await axios.get('http://127.0.0.1:3001/outh_page').then(url => setLink(url.data));
    window.open(link);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://127.0.0.1:3001/register', { name, email, password }).then(result => {
      navigate('/login');
    })
      .catch(err => console.log(err));
  };

  return (
    <div className="main-content">
      <div className="card" style={{ maxWidth: 400, width: '100%' }}>
        <h2 className="form-section-title" style={{ textAlign: 'center' }}>Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter Name"
              name="name"
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
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
          </div>
          <button type="submit" className="primary-btn" style={{ width: '100%', marginBottom: 12 }}>Register</button>
        </form>
        <button onClick={handleClick} style={{ width: '100%', background: '#fff', border: '1px solid #cfd8dc', borderRadius: 6, padding: '10px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16, marginTop: 4, cursor: 'pointer' }}>
          <img src="https://img.icons8.com/color/48/000000/google-logo.png" alt="google logo" style={{ width: 20, height: 20 }} />
          <span style={{ color: '#333', fontWeight: 500 }}>Signup with Google</span>
        </button>
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <span>Already have an account? </span>
          <Link to="/login" style={{ color: '#1976d2', fontWeight: 500 }}>Login</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
