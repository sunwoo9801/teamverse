// import React, { useState } from 'react';
// import { registerUser } from '../api/authApi';

// const SignUp = () => {
//   const [formData, setFormData] = useState({ username: '', email: '', password: '' });
//   const [message, setMessage] = useState('');

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault(); // 기본 동작 방지 (새로고침 방지)
//     console.log("🔵 회원가입 요청 보냄:", formData); // 콘솔에 출력

//     try {
//       const response = await axios.post('http://localhost:8082/api/register', formData, { withCredentials: true });
//       console.log("🟢 회원가입 성공:", response.data);
//       setMessage("회원가입 성공" + response.data);
//     } catch (error) {
//       console.error("🔴 회원가입 실패:", error.response ? error.response.data : error.message);
//       setMessage(error.response?.data || " 회원가입 실패");
//     }
//   };

//   return (
//     <div>
//       <h2>Sign Up</h2>
//       {/* ✅ `handleSubmit`이 실행되도록 form에 `onSubmit` 연결 */}
//       <form id="signup-form" onSubmit={handleSubmit}>
//         <input
//           type="text"
//           name="username"
//           placeholder="Username" // ✅ 백엔드에서 username을 요구하므로 name 변경
//           value={formData.username}
//           onChange={handleChange}
//         />
//         <input
//           type="email"
//           name="email"
//           placeholder="Email"
//           value={formData.email}
//           onChange={handleChange}
//           required
//         />
//         <input
//           type="password"
//           name="password"
//           placeholder="Password"
//           value={formData.password}
//           onChange={handleChange}
//           required
//         />
//         <button type="submit">Sign Up</button>
//       </form>
//       <p>{message}</p>
//     </div>
//   );
// };

// export default SignUp;
