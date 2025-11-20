import React, { useState } from 'react';
import apiClient from '../api'
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post(
        '/auth/login', 
        { email, password } 
      )
      
      console.log('Login successful! Token:', response.data.token)
      
      localStorage.setItem('token', response.data.token)
      navigate('/')
      
    } catch (err) {
      console.error('Login failed:', err.response.data)
    }
  };

  return (
    <div>
      <h1>Login to Your Account</h1>
      
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        
        <button type="submit">Log In</button>
      </form>
    </div>
  );
}

export default Login;