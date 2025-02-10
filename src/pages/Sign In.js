// import React, { useState } from 'react';
// import axios from 'axios';

// const SignIn = () => {
//   const [formData, setFormData] = useState({ email: '', password: '' });
//   const [message, setMessage] = useState('');

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await axios.post('http://localhost:8082/api/login', formData, { withCredentials: true });
//       setMessage(response.data);
//       setAuth(true); // 로그인 상태 업데이트
//     } catch (error) {
//       setMessage("로그인 실패: " + error.response.data);
//     }
//   };

//   const getUserInfo = async () => {
//     try {
//       const response = await axios.get('http://localhost:8082/api/user', { withCredentials: true });
//       console.log("로그인된 사용자:", response.data);
//     } catch (error) {
//       console.error("사용자 정보를 가져오는데 실패했습니다.", error);
//     }
//   };
  
//   return (
//     <div>
//       <h2>Sign In</h2>
//       <form onSubmit={handleSubmit}>
//         <input
//           type="email"
//           name="email"
//           placeholder="Email"
//           value={formData.email}
//           onChange={handleChange}
//         />
//         <input
//           type="password"
//           name="password"
//           placeholder="Password"
//           value={formData.password}
//           onChange={handleChange}
//         />
//         <button type="submit">Sign In</button>
//       </form>
//       <p>{message}</p>
//     </div>
//   );
// };

// export default SignIn;
