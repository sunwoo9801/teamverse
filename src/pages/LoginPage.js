import React from 'react';
import '../styles/LoginPage.scss';

const LoginPage = () => {
  return (
    <div className="login-page">
      <div className="main-container sign-in-mode">
        <div className="form-container sign-up-container">
          <form className="form">
            <h1>Create Account</h1>
            <div className="social-container">
              <a href="#" className="social"><i className="fab fa-facebook-f"></i></a>
              <a href="#" className="social"><i className="fab fa-linkedin-in"></i></a>
              <a href="#" className="social"><i className="fab fa-twitter"></i></a>
            </div>
            <span>or use your email for registration</span>
            <input type="text" placeholder="Name" />
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Password" />
            <button>Sign Up</button>
          </form>
        </div>
        <div className="form-container sign-in-container">
          <form className="form">
            <h1>Sign In</h1>
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Password" />
            <button>Sign In</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
