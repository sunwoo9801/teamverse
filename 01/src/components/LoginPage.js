import React, { useState } from "react";
import { signup, login } from "../api/auth"; // API 호출 함수 추가
import { handleLoginSuccess } from "../utils/authUtils"; // 로그인 성공 시 토큰 저장
import "../styles/Login.scss"; 
import FacebookIcon from "@mui/icons-material/Facebook";
import GoogleIcon from "@mui/icons-material/Google";
import TwitterIcon from "@mui/icons-material/Twitter";

const LoginPage = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [name, setName] = useState(""); // 회원가입용 이름
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const toggleForm = () => setIsSignUp((prev) => !prev);

    // 🔹 회원가입 요청 (SIGN UP 버튼 클릭 시)
    const handleSignUp = async (e) => {
        e.preventDefault();
        const response = await signup(name, email, password);
        
        if (response.user) {
            alert("회원가입 성공! 로그인 페이지로 이동합니다.");
            setIsSignUp(false); // 로그인 폼으로 전환
        } else {
            alert(response.message || "회원가입 실패");
        }
    };

    // 🔹 로그인 요청 (SIGN IN 버튼 클릭 시)
    const handleSignIn = async (e) => {
        e.preventDefault();
        const response = await login(email, password);

        if (response.accessToken) {
            handleLoginSuccess(response.accessToken, response.refreshToken);
            window.location.href = "/dashboard"; // 로그인 후 이동
        } else {
            alert(response.message || "로그인 실패");
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
                        <input className="form__input" type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
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
                        <input className="form__input" type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
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
