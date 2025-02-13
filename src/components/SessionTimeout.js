// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { handleLogout } from "../utils/authUtils"; // ✅ 로그아웃 함수 사용

// const SessionTimeout = () => {
//     const navigate = useNavigate();
//     const [showWarning, setShowWarning] = useState(false); // 🔹 경고창 상태 추가
//     const warningTimeout = 55 * 60 * 1000; // 55분 후 경고창 표시
//     const logoutTimeout = warningTimeout + 5 * 60 * 1000; // 🔹 경고창 후 5분 내 응답 없으면 자동 로그아웃


//     useEffect(() => {
//         // 🔹 55분 후 경고창 표시
//         const warningTimer = setTimeout(() => {
//             setShowWarning(true);
//         }, warningTimeout);

//         // 🔹 60분 후 자동 로그아웃
//         const logoutTimer = setTimeout(() => {
//             if (showWarning) {
//                 handleLogout();
//                 alert("로그인 세션이 만료되었습니다.");
//                 navigate("/login");
//             }
//         }, logoutTimeout);

//         return () => {
//             clearTimeout(warningTimer);
//             clearTimeout(logoutTimer);
//         };
//     }, [showWarning, navigate]);

//         // 🔹 사용자가 "확인" 버튼을 누르면 토큰 갱신
//     const handleRefreshToken = async () => {
//         setShowWarning(false); // 경고창 닫기
//         try {
//             const refreshToken = localStorage.getItem("refreshToken");
//             const response = await axios.post("/api/auth/refresh", { refreshToken });
//             localStorage.setItem("accessToken", response.data.accessToken);
//             localStorage.setItem("refreshToken", response.data.refreshToken);
//             alert("세션이 연장되었습니다.");
//         } catch (error) {
//             // if (window.confirm("로그인 유지할까요?")) {
//             //     navigate("/login");
//             // } else {
//             //     handleLogout();
//             // }
//             handleLogout();
//             alert("세션 연장 실패. 다시 로그인하세요.");
//             navigate("/login");
//         }
//     };

//     const handleLogout = () => {
//         localStorage.removeItem("accessToken");
//         localStorage.removeItem("refreshToken");
//         alert("자동 로그아웃되었습니다.");
//         navigate("/login");
//     };

//     return null;
// };

// export default SessionTimeout;
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { handleLogout } from "../utils/authUtils"; // ✅ 로그아웃 함수 사용

const SessionTimeout = () => {
    const navigate = useNavigate();
    const [showWarning, setShowWarning] = useState(false); // 🔹 경고창 상태 추가
    const [logoutCountdown, setLogoutCountdown] = useState(5 * 60); // 🔹 로그아웃까지 남은 시간 (5분)
    const [showLogoutMessage, setShowLogoutMessage] = useState(false); // 🔹 자동 로그아웃 메시지 표시 여부
    const warningTimeout = 55 * 60 * 1000; // 55분 후 경고창 표시
    const logoutTimeout = warningTimeout + 5 * 60 * 1000; // 🔹 경고창 후 5분 내 응답 없으면 자동 로그아웃

    useEffect(() => {
        // 🔹 55분 후 경고창 표시
        const warningTimer = setTimeout(() => {
            setShowWarning(true);
        }, warningTimeout);

        // 🔹 60분 후 자동 로그아웃
        const logoutTimer = setTimeout(() => {
            if (showWarning) {
                handleLogout();
                setShowLogoutMessage(true); // 자동 로그아웃 메시지 표시
                setTimeout(() => navigate("/login"), 2000); // 2초 후 로그인 페이지로 이동
            }
        }, logoutTimeout);

        // 🔹 경고창이 표시되면 남은 시간 감소 시작
        let countdownInterval;
        if (showWarning) {
            countdownInterval = setInterval(() => {
                setLogoutCountdown((prev) => (prev > 0 ? prev - 1 : 0));
            }, 1000);
        }

        return () => {
            clearTimeout(warningTimer);
            clearTimeout(logoutTimer);
            clearInterval(countdownInterval);
        };
    }, [showWarning, navigate]);

    // 🔹 사용자가 "확인" 버튼을 누르면 토큰 갱신
    const handleRefreshToken = async () => {
        setShowWarning(false); // 경고창 닫기
        setLogoutCountdown(5 * 60); // 타이머 초기화
        try {
            const refreshToken = localStorage.getItem("refreshToken");
            const response = await axios.post("/api/auth/refresh", { refreshToken });

            localStorage.setItem("accessToken", response.data.accessToken);
            sessionStorage.setItem("accessToken", response.data.accessToken);
            alert("세션이 연장되었습니다.");
        } catch (error) {
            handleLogout();
            setShowLogoutMessage(true);
            setTimeout(() => navigate("/login"), 2000);
        }
    };

    return (
        <>
            {showWarning && (
                <div className="session-warning">
                    <p>로그인을 유지할까요?</p>
                    <p>남은 시간: {Math.floor(logoutCountdown / 60)}분 {logoutCountdown % 60}초</p>
                    <button onClick={handleRefreshToken}>확인</button>
                </div>
            )}

            {showLogoutMessage && (
                <div className="session-logout-message">
                    <p>자동 로그아웃되었습니다.</p>
                </div>
            )}
        </>
    );
};

export default SessionTimeout;
