import axios from "axios";

const STORAGE_KEY = "ep-auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

api.interceptors.request.use(config => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const { userId, companyId, companyCode, dbName } = JSON.parse(stored);
      if (userId      != null) config.headers["userid"]      = String(userId);
      if (companyId   != null) config.headers["companyid"]   = String(companyId);
      if (companyCode != null) config.headers["companycode"] = String(companyCode);
      if (dbName      != null) config.headers["dbname"]      = String(dbName);
    }
  } catch {}
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    const status = err.response?.status;
    const url    = err.config?.url || "";
    if (status === 401 && !url.includes("/auth/login")) {
      localStorage.removeItem(STORAGE_KEY);
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
