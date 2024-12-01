import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('landlord'); 
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'http://localhost:3001/login',
        { username, password },
        { headers: { 'Content-Type': 'application/json' } }
      );
  
      const { token, role, landlordId, managerId } = response.data;
  
      localStorage.setItem('token', token);
      localStorage.setItem(`${role.toLowerCase()}Id`, role === 'Landlord' ? landlordId : managerId);
  
      if (role === 'Landlord') {
        navigate(`/landlord-dashboard`, { state: { landlordId } });
      } else if (role === 'Manager') {
        navigate(`/manager-dashboard`, { state: { managerId, landlordId } });
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Login failed');
    }
  };
  
  const handleSignUpRedirect = () => {
    navigate('/signup');
  };

  return (
    <div style={styles.bgimage}>
      <h1 style={styles.welcome}>WELCOME TO KHAITI KHAATA</h1>
      <form onSubmit={handleLogin} style={styles.form}>
        <h2 style={styles.title}>Login</h2>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={styles.select}
        >
          <option value="landlord">Landlord</option>
          <option value="manager">Manager</option>
        </select>
        <input
          type="text"
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Login</button>
        <p style={styles.signupText}>
          Not registered?{' '}
          <span style={styles.signupLink} onClick={handleSignUpRedirect}>
            Sign Up
          </span>
        </p>
      </form>
    </div>
  );
};

const styles = {
  ...{
    bgimage: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      width: '100vw',
      backgroundImage: 'url(/log.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      position: 'relative',
      margin: 0,
    },
    welcome: {
      position: 'absolute',
      top: '25px',
      fontSize: '42px',
      fontWeight: 'bolder',
      color: '#000000',
      textAlign: 'center',
      zIndex: 2,
      fontFamily: 'Arial, sans-serif',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '400px',
      height: '400px',
      padding: '30px',
      border: '1px solid #ccc',
      borderRadius: '8px',
      boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
      backgroundColor: '#fff',
    },
    title: {
      fontSize: '30px',
      marginBottom: '10px',
      color: '#333',
    },
    input: {
      width: '100%',
      padding: '10px',
      marginBottom: '20px',
      borderRadius: '5px',
      border: '2px solid #ddd',
      fontSize: '18px',
    },
    select: {
      width: '100%',
      padding: '10px',
      marginBottom: '20px',
      borderRadius: '5px',
      border: '2px solid #ddd',
      fontSize: '18px',
      backgroundColor: '#f9f9f9',
    },
    button: {
      padding: '10px 30px',
      fontSize: '20px',
      color: '#fff',
      marginTop: '25px',
      backgroundColor: '#007BFF',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
    },
    signupText: {
      marginTop: '10px',
      fontSize: '20px',
      color: '#555',
    },
    signupLink: {
      color: '#007BFF',
      cursor: 'pointer',
      textDecoration: 'underline',
    },
  },
};

export default Login;
