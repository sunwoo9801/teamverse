import axios from "axios";


export const handleLoginSuccess = (accessToken, refreshToken, rememberMe) => {
    console.log("✅ Login Success - rememberMe:", rememberMe);
    console.log("✅ accessToken:", accessToken);
    console.log("✅ refreshToken:", refreshToken);
    
    if (rememberMe) {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        
    } else {
        sessionStorage.setItem("accessToken", accessToken);
        sessionStorage.setItem("refreshToken", refreshToken); // ✅ rememberMe가 false여도 refreshToken 저장
    }

    console.log("🔍 localStorage refreshToken:", localStorage.getItem("refreshToken"));
    console.log("🔍 sessionStorage refreshToken:", sessionStorage.getItem("refreshToken"));
};

// 로그아웃 처리
export const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    window.location.href = "/login";
};

// 현재 저장된 accessToken 가져오기 (localStorage 우선, 없으면 sessionStorage 확인)
export const getAccessToken = () => {
    return localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
};
// 현재 저장된 refreshToken 가져오기 (세션/로컬 체크)
export const getRefreshToken = () => {
    return localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken");
};
// ✅ refreshToken을 사용하여 새로운 accessToken 요청
export const refreshAccessToken = async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return null;
  
    try {
      const response = await axios.post("http://localhost:8082/api/auth/refresh", {
        refreshToken,
      });
  
      const newAccessToken = response.data.accessToken;
      if (newAccessToken) {
        localStorage.setItem("accessToken", newAccessToken);
        sessionStorage.setItem("accessToken", newAccessToken); // ✅ sessionStorage에도 저장
        console.log("✅ 새 accessToken 발급:", newAccessToken);
        return newAccessToken;
      }
    } catch (error) {
      console.error("🚨 refreshToken 만료! 다시 로그인 필요:", error);
      return null;
    }
  };