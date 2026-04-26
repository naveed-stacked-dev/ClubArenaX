import apiClient from "./apiClient";

const leagueService = {
  // Admin routes
  adminGetAll: (params) => apiClient.get("/admin/leagues", { params }),
  adminCreate: (data) => apiClient.post("/admin/create-league", data),
  createManager: (id, data) => apiClient.post(`/admin/league/${id}/manager`, data),
  updateManager: (id, managerId, data) => apiClient.put(`/admin/league/${id}/manager/${managerId}`, data),
  resetPassword: (id, data) => apiClient.put(`/admin/league/${id}/reset-password`, data),

  // League CRUD
  getAll: (params) => apiClient.get("/leagues", { params }),
  getById: (id) => apiClient.get(`/leagues/${id}`),
  getBySlug: (slug) => apiClient.get(`/leagues/slug/${slug}`),
  create: (data) => apiClient.post("/leagues", data),
  update: (id, data) => apiClient.put(`/leagues/${id}`, data),
  remove: (id) => apiClient.delete(`/leagues/${id}`),

  // Settings & Theme
  updateTheme: (id, data) => apiClient.put(`/leagues/${id}/theme`, data),
  updateSettings: (id, data) => apiClient.put(`/leagues/${id}/settings`, data),
  updateLogo: (id, data) => apiClient.put(`/leagues/${id}/logo`, data),
};

export default leagueService;
