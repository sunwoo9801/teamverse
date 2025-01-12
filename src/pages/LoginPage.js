// src/pages/LoginPage.js
import React, { useState } from 'react';
import '../styles/LoginPage.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({ id: '', password: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = () => {
    alert(`Logging in with ID: ${formData.id}`);
    // 로그인 API 호출 로직 추가 가능
  };

  const handleSignUp = () => {
    alert('Redirecting to Sign Up page');
    // 회원가입 페이지로 이동 로직 추가 가능
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Login</h2>
        <div className="input-group">
          <label>ID</label>
          <input
            type="text"
            name="id"
            value={formData.id}
            onChange={handleChange}
            placeholder="Enter your ID"
          />
        </div>
        <div className="input-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
          />
        </div>
        <button onClick={handleLogin} className="btn login-btn">Login</button>
        <button onClick={handleSignUp} className="btn signup-btn">Sign Up</button>
      </div>
    </div>
  );
};

export default LoginPage;
