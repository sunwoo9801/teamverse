// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <Router>
      <div>
        <Navbar />
        <Routes>
          <Route path="/dashboard" element={<div>Dashboard Page</div>} />
          <Route path="/files" element={<div>Files Page</div>} />
          <Route path="/roles" element={<div>Roles Page</div>} />
          <Route path="/settings" element={<div>Settings Page</div>} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
