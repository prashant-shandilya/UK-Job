import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './App.css';

function Forgot() {
  const [email, setEmail] = useState();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://127.0.0.1:3001/forgot', { email }).then(result => {
      navigate('/login');
    })
      .catch(err => console.log(err));
  };

  return (
    <div className="main-content">
      <div className="card" style={{ maxWidth: 400, width: '100%' }}>
        <h2 className="form-section-title" style={{ textAlign: 'center' }}>Forgot Password</h2>
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
          <p style={{ fontSize: '0.98rem', color: '#555', marginBottom: 16 }}>
            Enter your e-mail. A temporary password will be sent to this e-mail. Please enter a valid e-mail.
          </p>
          <button type="submit" className="primary-btn" style={{ width: '100%' }}>Submit</button>
        </form>
      </div>
    </div>
  );
}

export default Forgot;