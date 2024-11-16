import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SignUp from './SignUp.jsx';
import Login from './Login.jsx';
import LandLordDashboard from './LandLordDash.jsx'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Login />} />
        <Route path="/landlord-dashboard" element ={<LandLordDashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
const styles = {
  welcome: {
    position: 'absolute',
    top: '300px',
    left:'550px',
    fontSize: '60px', 
    fontWeight: 'bolder', 
    color: '#000000',
    textAlign: 'center',
    zIndex: 2, 
    fontFamily: 'Arial, sans-serif',
  }
};
