import React, { useState } from "react";
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
    const [password, setPassword] = useState("");

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
    const response = await login(email, password);

    if (response.accessToken) {
        localStorage.setItem("token", response.accessToken);
        localStorage.setItem("refreshToken", response.refreshToken);

        // ✅ 로그인한 사용자 정보 가져오기
        const userInfo = await fetchUserInfo(response.accessToken);
        if (userInfo) {
            localStorage.setItem("user", JSON.stringify(userInfo));
        }

        alert("로그인 성공!");
        window.location.href = "/"; // ✅ 메인 페이지 이동
    } else {
        alert(response.message || "로그인 실패");
    }
};

// ✅ 로그인한 사용자 정보 가져오기
const fetchUserInfo = async (token) => {
    try {
        const response = await axios.get("http://localhost:8082/api/user", {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        console.error("사용자 정보를 불러오지 못했습니다:", error);
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
