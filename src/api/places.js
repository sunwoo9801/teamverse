import axios from "axios";
import { getAccessToken } from "../utils/authUtils"; // 토큰 포함 가능

export const searchPlaces = async (query) => {
  try {
    const token = getAccessToken();
    
    const response = await axios.get(`https://teamverse.onrender.com/api/places/search`, {
      params: { query },
      headers: {
        Authorization: `Bearer ${token}`, // 인증 필요시 추가
      },
    });

    return response.data.results || [];
  } catch (error) {
    console.error("❌ 장소 검색 실패:", error);
    return [];
  }
};
