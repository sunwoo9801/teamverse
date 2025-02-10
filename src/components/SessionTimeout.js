import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const SessionTimeout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const timeout = setTimeout(() => {
            handleRefreshToken();
        }, 55 * 60 * 1000); // 55분 후 실행

        return () => clearTimeout(timeout);
    }, []);

    const handleRefreshToken = async () => {
        try {
            const refreshToken = localStorage.getItem("refreshToken");
            const response = await axios.post("/api/auth/refresh", { refreshToken });
            localStorage.setItem("accessToken", response.data.accessToken);
            localStorage.setItem("refreshToken", response.data.refreshToken);
        } catch (error) {
            if (window.confirm("로그인 유지할까요?")) {
                navigate("/login");
            } else {
                handleLogout();
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        alert("자동 로그아웃되었습니다.");
        navigate("/login");
    };

    return null;
};

export default SessionTimeout;
