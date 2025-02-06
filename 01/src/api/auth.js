import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/auth"; // 백엔드 API URL

export const signup = async (name, email, password) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/signup`, { name, email, password });
        return response.data;
    } catch (error) {
        return { message: error.response?.data?.message || "회원가입 실패" };
    }
};

export const login = async (email, password) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/login`, { email, password });
        return response.data;
    } catch (error) {
        return { message: error.response?.data?.message || "로그인 실패" };
    }
};
