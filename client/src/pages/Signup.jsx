import React, { useState } from 'react'
import apiClient from '../api'
import { useNavigate } from 'react-router-dom'

function Signup() {
    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        try {
            const response = await apiClient.post(
                '/auth/signup', 
                { email, username, password } 
            )
            console.log('Signup successful! Token:', response.data.token)
            
            localStorage.setItem('token', response.data.token);
            navigate('/');
      
        } catch (err) {
          console.error('Signup failed:', err.response.data)
        }
    }
    
    return (
    <div>
      <h1>Create an Account</h1>
      
      {/* Create the form */}
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
          <label>Username</label>
          <input
            type="text"
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
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
        
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}

export default Signup;