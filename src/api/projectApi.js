import axios from "axios";

const API_BASE_URL = "http://localhost:8082/api/user/projects";

// 모든 프로젝트 가져오기
export const getProjects = async () => {
  try {
    const response = await axios.get(API_BASE_URL, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error("프로젝트 목록을 가져오는데 실패했습니다.", error);
    throw error;
  }
};

// 특정 프로젝트의 작업 목록 가져오기
export const getTasksByProject = async (projectId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${projectId}/tasks`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("작업 목록을 가져오는데 실패했습니다.", error);
    throw error;
  }
};