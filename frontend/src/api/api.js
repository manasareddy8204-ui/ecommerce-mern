import axios from "axios";

const api = axios.create({
  // ✅ Use localhost / 127.0.0.1 instead of LAN IP
  baseURL: "http://127.0.0.1:5000/api",
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Logout if token expired
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/";
    }
    return Promise.reject(err);
  }
);

export default api;