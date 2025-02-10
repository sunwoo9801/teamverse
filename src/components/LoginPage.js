import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // 수정: useNavigate 추가
import { signup, login } from "../api/auth"; // ✅ API 호출 함수
import { handleLoginSuccess } from "../utils/authUtils"; // ✅ 로그인 성공 시 토큰 저장
import "../styles/Login.scss";
import FacebookIcon from "@mui/icons-material/Facebook";
import GoogleIcon from "@mui/icons-material/Google";
import TwitterIcon from "@mui/icons-material/Twitter";
import axios from "axios"; // ✅ axios import 추가


const LoginPage = () => {
	const [isSignUp, setIsSignUp] = useState(false);
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState(""); // ✅ 기존에 30으로 설정된 초기값을 빈 문자열로 변경
	const [duration, setDuration] = useState(30); // 🔹 로그인 연장 기본값: 30분 추가
	const navigate = useNavigate(); // 수정: navigate 사용

	const toggleForm = () => setIsSignUp((prev) => !prev);

	// 🔹 회원가입 요청
	const handleSignUp = async (e) => {
		e.preventDefault();
		const response = await signup(name, email, password);

		if (response.success) {
			alert("회원가입 성공! 자동 로그인됩니다.");
			await handleSignIn(e); // ✅ 회원가입 후 자동 로그인
		} else {
			alert(response.message || "회원가입 실패");
		}
	};

	// 🔹 로그인 요청
	const handleSignIn = async (e) => {
		e.preventDefault();
		const response = await login(email, password, duration); // ✅ 로그인 요청 시 duration 값을 전달

		// if (response.accessToken) {
		// 	localStorage.setItem("token", response.accessToken);
		// 	localStorage.setItem("refreshToken", response.refreshToken);
		if (response.accessToken) {
			handleLoginSuccess(response.accessToken, response.refreshToken);

			console.log("📌 저장된 accessToken:", localStorage.getItem("accessToken"));

			// ✅ 로그인한 사용자 정보 가져오기
			const userInfo = await fetchUserInfo();
			console.log(" 로그인한 사용자 정보: ", userInfo); //디버깅 로그
			if (userInfo && userInfo.id) {
				localStorage.setItem("user", JSON.stringify(userInfo));
				alert("로그인 성공!");
				navigate(`/dashboard/${userInfo.id}`); // 수정: 로그인 후 /dashboard/{사용자 ID}로 이동
			} else {
				alert("사용자 정보를 불러오는 데 실패했습니다.");
				navigate("/");
			}
		} else {
			alert(response.message || "로그인 실패");
		}
	};

	// ✅ 로그인한 사용자 정보 가져오기
	// const fetchUserInfo = async (token) => {
	// 	try {
	// 		const response = await axios.get("http://localhost:8082/api/user", {
	// 			headers: { Authorization: `Bearer ${token}` },
	// 		});
	// 		return response.data;
	// 	} catch (error) {
	// 		console.error("사용자 정보를 불러오지 못했습니다:", error);
	// 		return null;
	// 	}
	// };
	const fetchUserInfo = async () => {
		try {
			const token = localStorage.getItem("accessToken");
			if (!token) {
				console.error("❌ 토큰이 없습니다.");
				return null;
			}
	
			const response = await axios.get("http://localhost:8082/api/auth/me", {
				headers: { Authorization: `Bearer ${token}` },
			});
	
			console.log("📌 백엔드 응답 데이터:", response.data); // ✅ 추가
	
			if (!response.data.id) {
				console.error("❌ 사용자 ID 없음! 백엔드 응답 수정 필요:", response.data);
				return null;
			}
	
			return response.data;
		} catch (error) {
			console.error("❌ 사용자 정보를 불러오지 못했습니다:", error);
			return null;
		}
	};
	
	return (
		<div className="login-page">
			<div className="main">
				{/* 회원가입 폼 */}
				<div className={`container a-container ${isSignUp ? "is-hidden" : ""}`}>
					<form className="form" onSubmit={handleSignUp}>
						<h2 className="form_title title">Create Account</h2>
						<div className="form__icons">
							<FacebookIcon className="form__icon" />
							<GoogleIcon className="form__icon" />
							<TwitterIcon className="form__icon" />
						</div>
						<span className="form__span">or use email for registration</span>
						<input className="form__input" type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
						<input className="form__input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
						<input className="form__input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
						<button type="submit" className="form__button button submit">SIGN UP</button>
					</form>
				</div>

				{/* 로그인 폼 */}
				<div className={`container b-container ${isSignUp ? "" : "is-hidden"}`}>
					<form className="form" onSubmit={handleSignIn}>
						<h2 className="form_title title">Sign in to Website</h2>
						<div className="form__icons">
							<FacebookIcon className="form__icon" />
							<GoogleIcon className="form__icon" />
							<TwitterIcon className="form__icon" />
						</div>
						<span className="form__span">or use your email account</span>
						<input className="form__input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
						<input className="form__input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
						{/* 🔹 로그인 연장 선택 옵션 추가 */}

						<div>
							<label>
								<input
									type="radio"
									name="duration"
									value="30"
									checked={duration === 30}
									onChange={() => setDuration(30)}
								/> 30분
							</label>
							<label>
								<input
									type="radio"
									name="duration"
									value="forever"
									checked={duration !== 30}
									onChange={() => setDuration("forever")}
								/> 로그아웃 전까지 유지
							</label>
						</div>

						<a className="form__link" href="#">Forgot your password?</a>
						<button type="submit" className="form__button button submit">SIGN IN</button>
					</form>
				</div>

				{/* 전환 버튼 */}
				<div className="switch">
					<div className="switch__circle"></div>
					<div className="switch__circle switch__circle--t"></div>
					<div className={`switch__container ${isSignUp ? "is-hidden" : ""}`}>
						<h2 className="switch__title title">Welcome Back !</h2>
						<p className="switch__description description">
							To keep connected with us please login with your personal info
						</p>
						<button className="switch__button button switch-btn" onClick={toggleForm}>
							SIGN IN
						</button>
					</div>
					<div className={`switch__container ${isSignUp ? "" : "is-hidden"}`}>
						<h2 className="switch__title title">Hello Friend !</h2>
						<p className="switch__description description">
							Enter your personal details and start journey with us
						</p>
						<button className="switch__button button switch-btn" onClick={toggleForm}>
							SIGN UP
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LoginPage;
