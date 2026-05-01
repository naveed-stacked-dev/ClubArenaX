import apiClient from "./apiClient";

const authService = {
  // SuperAdmin login
  loginSuperAdmin: (credentials) =>
    apiClient.post("/auth/superadmin/login", credentials),

  // ClubManager login
  loginClubManager: (credentials) =>
    apiClient.post("/auth/club-manager/login", credentials),

  // MatchManager login
  loginMatchManager: (credentials) =>
    apiClient.post("/auth/match-manager/login", credentials),

  // MatchManager token-based login (scorer link)
  loginMatchManagerByToken: (token) =>
    apiClient.post("/auth/match-manager/token-login", { token }),

  // Register ClubManager (SuperAdmin only)
  registerClubManager: (data) =>
    apiClient.post("/auth/club-manager/register", data),

  // Reset ClubManager password (SuperAdmin only)
  resetClubManagerPassword: (data) =>
    apiClient.post("/auth/club-manager/reset-password", data),

  // Create MatchManager (ClubManager only)
  createMatchManager: (data) =>
    apiClient.post("/auth/match-manager/create", data),

  // Common
  getMe: () => apiClient.get("/auth/me"),
  refreshToken: (refreshToken) =>
    apiClient.post("/auth/refresh-token", { refreshToken }),
  changePassword: (data) =>
    apiClient.post("/auth/change-password", data),
  updateProfile: (data) =>
    apiClient.put("/auth/update-profile", data),
};

export default authService;
