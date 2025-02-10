import axios from "axios";

const API_BASE_URL = "http://localhost:8082";

export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/register`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || "회원가입 실패";
  }
};

//로그인 후 Access Token을 localStorage에 저장
export const login = async (email, password) => {
  try {
    const response = await axios.post("http://localhost:8082/api/user/login", { email, password });
    
    // ✅ 로그인 성공 후 Access Token을 localStorage에 저장
    localStorage.setItem("accessToken", response.data.accessToken);
    
    return response.data;
  } catch (error) {
    console.error("❌ 로그인 실패:", error);
    return null;
  }
};


export const loginUser = async (loginData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, loginData, {
      withCredentials: true, // ✅ 쿠키 기반 인증 사용
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || "로그인 실패";
  }
};

/** 로그인 상태를 서버에서 직접 조회하는 방식 */
export const getUserInfo = async () => {
  try {
    // ✅ 쿠키에서 accessToken 추출
    const cookies = document.cookie.split("; ").reduce((acc, cookie) => {
      const [key, value] = cookie.split("=");
      acc[key] = value;
      return acc;
    }, {});

    if (!cookies.accessToken) {
      console.warn("⛔️ accessToken 없음: 사용자 정보 요청 안 함");
      return null;
    }

    // ✅ Authorization 헤더에 JWT 포함
    const response = await axios.get(`${API_BASE_URL}/api/user`, {
      withCredentials: true, 
      headers: {
        Authorization: `Bearer ${cookies.accessToken}`
      }
    });
    return response.data; // ✅ 로그인된 사용자 정보 반환
  } catch (error) {
    if (error.response && error.response.status === 403) {
      console.warn("⛔️ 로그인되지 않음: 사용자 정보 요청을 중단합니다.");
      return null;
    }
    console.error("🔴 사용자 정보 조회 실패:", error.response?.data || error);
    return null;
  }

};



// export const logoutUser = async () => {
//   try {
//     await axios.post(`${API_BASE_URL}/api/user/logout`, {}, { withCredentials: true });
//   } catch (error) {
//     console.error("로그아웃 실패", error);
//   }
// }
export const logoutUser = async () => {
  try {
    await axios.post("http://localhost:8082/api/user/logout", {}, { withCredentials: true });

    // Access Token 쿠키 삭제 (쿠키 강제 만료)
    document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

    return true; // 로그아웃 성공
  } catch (error) {
    console.error("로그아웃 실패", error);
    return false;
  }
};


export const refreshToken = async () => {
  try {
    // 쿠키에서 refreshToken이 있는지 확인 후 요청
    const cookies = document.cookie.split("; ").reduce((acc, cookie) => {
      const [key, value] = cookie.split("=");
      acc[key] = value;
      return acc;
    }, {});

    if (!cookies.refreshToken) {
      console.warn("⛔️ refreshToken 없음: 토큰 갱신 요청하지 않음");
      return null; // 요청하지 않고 종료
    }

    // refreshToken이 있는 경우에만 요청
    const response = await axios.post(`${API_BASE_URL}/api/user/token/refresh`, {}, { withCredentials: true });
    console.log("🟢 토큰 갱신 성공:", response.data.accessToken);
    return response.data.accessToken;
  } catch (error) {
    console.error("🔴 토큰 갱신 실패:", error.response?.data || error);
    return null;
  }

  
};
