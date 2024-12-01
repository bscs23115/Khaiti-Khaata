import React, { useState } from 'react';
import axios from 'axios';
import './SignUp.css'; 
import { useNavigate } from 'react-router-dom';

const SignUp = () => 
{
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [contactInformation, setContactInformation] = useState('');

const navigate=useNavigate();
  const handleSignUp = async (e) => 
  {
    e.preventDefault();
    try 
    {
      const response = await axios.post('http://localhost:3001/signup', 
      {
        username,
        password,
        email,
        name,
        contactInformation,
      });
      alert(response.data.message);
      navigate('/login');
    } 
    catch (error) 
    {
      alert(error.response?.data?.error || 'Signup failed');
    }
  };

  return(
    <div className="background-container">
      <h1 className='welcome'>WELCOME TO KHAITI KHAATA</h1>
      <form onSubmit={handleSignUp} className="form">
        <h2>Sign Up as Landlord</h2>
        <input 
          type="text" 
          placeholder="Username" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <input 
          type="email" 
          placeholder="Email (optional)" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
        />
        <input 
          type="text" 
          placeholder="Full Name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
        />
        <input 
          type="text" 
          placeholder="Contact Information" 
          value={contactInformation} 
          onChange={(e) => setContactInformation(e.target.value)} 
          required 
        />
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default SignUp;
