import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SignUp from './SignUp.jsx';
import Login from './Login.jsx';
import LandLordDashboard from './LandLordDash.jsx'
import ManagerDashboard from './ManagerDash.jsx'
import LandlordReports from './LandlordReports.jsx'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Login />} />
        <Route path="/landlord-dashboard" element ={<LandLordDashboard />} />
        <Route path="/manager-dashboard" element={<ManagerDashboard/>}/>
        <Route path="/landlord-reports" element={<LandlordReports/>}/>
      </Routes>
    </Router>
  );
};

export default App;
