import axios from "axios";

const api = axios.create({
  baseURL:import.meta.env.VITE_BACK_END_SERVER_URL ,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// If the server says the token is bad/expired, log out and go to sign in
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRequest = error.config?.url?.startsWith("/auth");
    if (error.response?.status === 401 && !isAuthRequest && localStorage.getItem("token")) {
      localStorage.removeItem("token");
      window.location.href = "/sign-in";
    }
    return Promise.reject(error);
  }
);

export default api;