import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 추가
api.interceptors.request.use(
  (config) => {
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

export const authAPI = {
  login: (credentials) => api.post('/users/login', credentials),
  register: (userData) => api.post('/users/register', userData),
  getUserProfile: (userId) => api.get(`/users/${userId}`),
  updatePassword: (userId, passwordData) => api.put(`/users/${userId}`, passwordData),
};

export const albumAPI = {
  getAlbums: (userId) => api.get(`/albums/user/${userId}`),
  getAlbumById: (id) => api.get(`/albums/${id}`),
  createAlbum: (formData) => {
    return api.post('/albums', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  updateAlbum: (id, albumData) => api.put(`/albums/${id}`, albumData),
  deleteAlbum: (id) => api.delete(`/albums/${id}`),
};

export const photoAPI = {
  getTimelinePhotos: (userId) => api.get(`/albums/timeline/${userId}`),
  getPhotos: (userId, albumId) => api.get(`/albums/photos/${userId}/${albumId}`),
  getPhotoById: (albumId, photoId) => api.get(`/albums/${albumId}/photos/${photoId}`),
  uploadPhoto: (userId, albumId, formData) => 
    api.post(`/albums/${userId}/${albumId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  updatePhoto: (userId, photoId, photoData) => 
    api.put(`/albums/photos/${userId}/${photoId}`, photoData),
  deletePhoto: (albumId, photoId) => 
    api.delete(`/albums/photos/${photoId}`),
};

export const userAPI = {
  getUserProfile: (userId) => api.get(`/users/${userId}`),
  updateUserProfile: (userId, userData) => api.put(`/users/${userId}`, userData),
  deleteUser: (userId) => api.delete(`/users/${userId}`),
};

export default api; 