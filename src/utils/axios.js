import axios from 'axios';

// axios 인스턴스 생성
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8081/api', // 기본 서버 URL
  timeout: 30000, // 30초
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    // 토큰이 필요한 경우 헤더에 추가
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // 에러 처리
    if (error.response) {
      // 인증 에러 (401)
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        // 로그인 페이지로 리다이렉트 등의 처리
      }
      return Promise.reject(error.response.data);
    }
    return Promise.reject(error);
  }
);

export default api; 