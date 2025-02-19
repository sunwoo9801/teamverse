import axios from "axios";
import { getAccessToken } from "../utils/authUtils"; // ✅ accessToken 가져오기

const API_BASE_URL = "http://localhost:8082/api/auth"; // ✅ 백엔드 경로 확인

// ✅ 모든 요청에 accessToken 자동 추가
const authAxios = axios.create({
	baseURL: API_BASE_URL,
	withCredentials: true, // ✅ 쿠키 포함하여 요청 (필수)
});

authAxios.interceptors.request.use(
	(config) => {
		const token = getAccessToken();
		if (token) {
			config.headers.Authorization = `Bearer ${token}`; // ✅ Authorization 헤더 추가
		}
		return config;
	},
	(error) => Promise.reject(error)
);

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

export const login = async (email, password, rememberMe) => {
	
try {
	const response = await authAxios.post("/login", { email, password }, {
			params: { rememberMe }, // ✅ 로그인 유지 옵션 전달
			
	});
	console.log("📌 로그인 API 응답:", response.data); // ✅ 백엔드 응답 확인용 로그

	return response.data;
} catch (error) {
	return { message: error.response?.data?.message || "로그인 실패" };
}
};


