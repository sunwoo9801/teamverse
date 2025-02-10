// import React, { useState } from 'react';
// import '../styles/LoginPage.scss';
// import { loginUser } from '../api/authApi';

// const LoginPage = () => {
//   const [loginData, setLoginData] = useState({ email: "", password: "" });
//   const [message, setMessage] = useState("");

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setLoginData({ ...loginData, [name]: value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await loginUser(loginData);
//       setMessage("로그인 성공!");
//       window.location.href = "/"; // 로그인 후 홈으로 이동
//     } catch (error) {
//       setMessage(error);
//     }
//   };

//   return (
//     <div className="login-page">
//       <div className="main-container sign-in-mode">
//         {/* 회원가입 폼 */}
//         <div className="form-container sign-up-container">
//           <form className="form" >
//             <h1>Create Account</h1>
//             <div className="social-container">
//               <a href="#" className="social"><i className="fab fa-facebook-f"></i></a>
//               <a href="#" className="social"><i className="fab fa-linkedin-in"></i></a>
//               <a href="#" className="social"><i className="fab fa-twitter"></i></a>
//             </div>
//             <span>or use your email for registration</span>
//             <input type="text" placeholder="Name" />
//             <input type="email" placeholder="Email" />
//             <input type="password" placeholder="Password" />
//             <button>Sign Up</button>
//           </form>
//         </div>
//         {/* 로그인 폼 */}
//         <div className="form-container sign-in-container">
//           <form className="form" onSubmit={handleSubmit}>
//             <h1>Sign In</h1>
//             <input
//               type="email"
//               name="email"
//               placeholder="Email"
//               value={loginData.email}
//               onChange={handleChange}
//               required
//             />
//             <input
//               type="password"
//               name="password"
//               placeholder="Password"
//               value={loginData.password}
//               onChange={handleChange}
//               required
//             />
//             <button type="submit">Sign In</button>
//           </form>
//           <p>{message}</p> {/* 로그인 메시지 표시 */}
//         </div>
//       </div>
//     </div>
//   );
// }
// export default LoginPage;


import React, { useState } from 'react';
import { useNavigate } from "react-router-dom"; // ✅ 페이지 이동을 위한 useNavigate 추가
import '../styles/LoginPage.scss';
import { loginUser, registerUser } from '../api/authApi';

const LoginPage = () => {
  // 로그인 데이터
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loginMessage, setLoginMessage] = useState("");

  // 회원가입 데이터
  const [signUpData, setSignUpData] = useState({ username: '', email: '', password: '' });
  const [signUpMessage, setSignUpMessage] = useState("");

  const navigate = useNavigate(); // ✅ 페이지 이동을 위한 useNavigate 사용

  // 로그인 입력 변경 핸들러
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };

  // 회원가입 입력 변경 핸들러
  const handleSignUpChange = (e) => {
    const { name, value } = e.target;
    setSignUpData({ ...signUpData, [name]: value });
  };

  // 로그인 폼 제출 핸들러
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      await loginUser(loginData);
      setLoginMessage("로그인 성공!");
      navigate("/dashboard"); // ✅ 로그인 성공 시 대시보드 페이지로 이동
    } catch (error) {
      setLoginMessage("로그인 실패: " + error);
    }
  };

  // 회원가입 폼 제출 핸들러
  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await registerUser(signUpData);
      setSignUpMessage("회원가입 성공! 로그인하세요.");
    } catch (error) {
      setSignUpMessage(error.response?.data || " 회원가입 실패");
    }
  };

  return (
    <div className="login-page">
      <div className="main-container sign-in-mode">
        {/* 회원가입 폼 */}
        <div className="form-container sign-up-container">
          <form className="form" onSubmit={handleSignUpSubmit}> {/* ✅ 회원가입 폼 제출 처리 */}
            <h1>Create Account</h1>
            <div className="social-container">
              <a href="#" className="social"><i className="fab fa-facebook-f"></i></a>
              <a href="#" className="social"><i className="fab fa-linkedin-in"></i></a>
              <a href="#" className="social"><i className="fab fa-twitter"></i></a>
            </div>
            <span>or use your email for registration</span>
            <input 
              type="text" 
              name="username" 
              placeholder="Username" 
              value={signUpData.username} 
              onChange={handleSignUpChange} 
              required 
            />
            <input 
              type="email" 
              name="email" 
              placeholder="Email" 
              value={signUpData.email} 
              onChange={handleSignUpChange} 
              required 
            />
            <input 
              type="password" 
              name="password" 
              placeholder="Password" 
              value={signUpData.password} 
              onChange={handleSignUpChange} 
              required 
            />
            <button type="submit">Sign Up</button> {/* ✅ 회원가입 버튼 */}
            <p>{signUpMessage}</p> {/* 회원가입 결과 메시지 */}
          </form>
        </div>

        {/* 로그인 폼 */}
        <div className="form-container sign-in-container">
          <form className="form" onSubmit={handleLoginSubmit}> {/* ✅ 로그인 폼 제출 처리 */}
            <h1>Sign In</h1>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={loginData.email}
              onChange={handleLoginChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={loginData.password}
              onChange={handleLoginChange}
              required
            />
            <button type="submit">Sign In</button> {/* ✅ 로그인 버튼 */}
            <p>{loginMessage}</p> {/* 로그인 결과 메시지 */}
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
