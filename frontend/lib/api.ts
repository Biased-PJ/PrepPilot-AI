import axios, { AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

export const authAPI = {
  signup: (email: string, password: string) =>
    api.post('/auth/signup', { email, password }),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  resetPassword: (email: string) =>
    api.post('/auth/reset-password', { email }),
};

export const problemsAPI = {
  getProblems: (page = 1, limit = 20, filters?: any) =>
    api.get('/problems', { params: { page, limit, ...filters } }),
  getProblem: (id: string) =>
    api.get(`/problems/${id}`),
  solveProblem: (id: string) =>
    api.post(`/problems/${id}/solve`, {}),
  unsolveProblem: (id: string) =>
    api.post(`/problems/${id}/unsolve`, {}),
  bookmarkProblem: (id: string) =>
    api.post(`/problems/${id}/bookmark`, {}),
};

export const analyticsAPI = {
  getDashboard: () =>
    api.get('/analytics/dashboard'),
  getTopicMastery: () =>
    api.get('/analytics/topic-mastery'),
  getReadiness: () =>
    api.get('/analytics/readiness'),
  getActivity: () =>
    api.get('/analytics/activity'),
};

export const platformAPI = {
  connectLeetCode: (username: string) =>
    api.post('/platforms/leetcode/connect', { username }),
  connectCodeforces: (username: string) =>
    api.post('/platforms/codeforces/connect', { username }),
  connectCodeChef: (username: string) =>
    api.post('/platforms/codechef/connect', { username }),
  disconnectPlatform: (platform: string) =>
    api.post(`/platforms/${platform}/disconnect`, {}),
  getPlatformStats: (platform: string) =>
    api.get(`/platforms/${platform}/stats`),
};

export const recommendationsAPI = {
  getRecommendations: () =>
    api.get('/recommendations'),
  getWeakTopics: () =>
    api.get('/recommendations/weak-topics'),
  getRoadmap: () =>
    api.get('/recommendations/roadmap'),
};

export const leaderboardAPI = {
  getLeaderboard: (page = 1, limit = 20) =>
    api.get('/leaderboard', { params: { page, limit } }),
};

export const profileAPI = {
  getProfile: () =>
    api.get('/profile'),
  updateProfile: (data: any) =>
    api.put('/profile', data),
  getStreak: () =>
    api.get('/profile/streak'),
};
