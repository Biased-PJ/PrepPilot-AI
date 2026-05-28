import axios from "axios";

export const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:5000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

const TOKEN_KEY = "preppilot_token";
const USER_KEY = "preppilot_user";

export const tokenStore = {
  get: () => (typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

export const userStore = {
  get: () => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(USER_KEY);
    try { return raw ? JSON.parse(raw) : null; } catch { return null; }
  },
  set: (u: any) => localStorage.setItem(USER_KEY, JSON.stringify(u)),
};

api.interceptors.request.use((cfg) => {
  const t = tokenStore.get();
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401 && typeof window !== "undefined") {
      tokenStore.clear();
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  },
);

// ============== API CALLS ==============
export const authApi = {
  signup: (data: { name: string; email: string; password: string }) =>
    api.post("/signup", data).then((r) => r.data),
  login: (data: { email: string; password: string }) =>
    api.post("/login", data).then((r) => r.data),
  profile: () => api.get("/profile").then((r) => r.data),
  verifyToken: () => api.get("/verify-token").then((r) => r.data),
  updatePassword: (old_password: string, new_password: string) =>
    api.put("/update-password", { old_password, new_password }).then((r) => r.data),
};

export const problemsApi = {
  all: (params: Record<string, any> = {}) =>
    api.get("/all-questions", { params }).then((r) => r.data),
  search: (q: string) => api.get("/search-questions", { params: { q } }).then((r) => r.data),
  random: () => api.get("/random-question").then((r) => r.data),
  daily: () => api.get("/daily-question").then((r) => r.data),
  company: (c: string) => api.get(`/company-questions/${c}`).then((r) => r.data),
  topics: () => api.get("/topics").then((r) => r.data),
  solve: (data: any) => api.post("/solve-question", data).then((r) => r.data),
  unsolve: (id: string) => api.delete(`/unsolve-question/${id}`).then((r) => r.data),
  myProblems: () => api.get("/my-problems").then((r) => r.data),
  analytics: () => api.get("/analytics").then((r) => r.data),
  recommendations: () => api.get("/recommendations").then((r) => r.data),
  readiness: () => api.get("/readiness-score").then((r) => r.data),
  streak: () => api.get("/streak").then((r) => r.data),
  topicProgress: () => api.get("/topic-progress").then((r) => r.data),
  leaderboard: () => api.get("/leaderboard").then((r) => r.data),
  dashboard: () => api.get("/dashboard").then((r) => r.data),
  chart: () => api.get("/generate-chart").then((r) => r.data),
};

const makePlatform = (key: "leetcode" | "codeforces" | "codechef") => ({
  start: (handle: string) =>
    api
      .post(`/${key}/start-verification`, key === "codeforces" ? { handle } : { username: handle })
      .then((r) => r.data),
  verify: () => api.post(`/${key}/verify`).then((r) => r.data),
  sync: () => api.post(`/${key}/sync`).then((r) => r.data),
  profile: () => api.get(`/${key}/profile`).then((r) => r.data),
  remove: () => api.delete(`/${key}/remove`).then((r) => r.data),
});

export const platformApi = {
  leetcode: makePlatform("leetcode"),
  codeforces: makePlatform("codeforces"),
  codechef: makePlatform("codechef"),
};