import apiClient from "./apiClient";

const authService = {
  login: (credentials) => apiClient.post("/auth/user/login", credentials),
  register: (data) => apiClient.post("/auth/user/register", data),
  getMe: () => apiClient.get("/auth/me"),
  refreshToken: (refreshToken) => apiClient.post("/auth/refresh-token", { refreshToken }),
  changePassword: (data) => apiClient.post("/auth/change-password", data),
};

export default authService;
