// ✅ `getAccessTokenFromCookie` 함수 추가 (쿠키에서 accessToken 가져오기)
export const getAccessTokenFromCookie = () => {
  const cookies = document.cookie.split("; ").reduce((acc, cookie) => {
    const [key, value] = cookie.split("=");
    acc[key] = value;
    return acc;
  }, {});

  return cookies.accessToken || null; // `accessToken` 쿠키가 없으면 `null` 반환
};
