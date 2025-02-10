import axios from "axios";

const API_BASE_URL = "http://localhost:8082/api/auth"; // ✅ 백엔드 경로 확인

export const signup = async (name, email, password) => {
    try {
        const response = await axios.post("http://localhost:8082/api/auth/register", {
            username: name,
            email,
            password
        }, { withCredentials: true });

        // ✅ 백엔드에서 성공 응답 시 message 필드가 존재하면 성공 처리
        if (response.status === 200) {
            return { success: true, message: response.data };
        } else {
            return { success: false, message: "회원가입 실패" };
        }
    } catch (error) {
        return { 
            success: false, 
            message: error.response?.data || "회원가입 실패" 
        };
    }
};


// export const login = async (email, password) => {
//     try {
//         const response = await axios.post(`${API_BASE_URL}/login`, { email, password }, { withCredentials: true });
//         return response.data;
//     } catch (error) {
//         return { message: error.response?.data?.message || "로그인 실패" };
//     }
export const login = async (email, password, duration = 30) => {
    try {
        const response = await axios.post("http://localhost:8082/api/auth/login", { email, password }, {
            params: { duration }, // 🔹 로그인 연장 옵션 전달
            withCredentials: true 
        });
        return response.data;
    } catch (error) {
        return { message: error.response?.data?.message || "로그인 실패" };
    }
};

