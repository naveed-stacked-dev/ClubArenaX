import apiClient from "./apiClient";

const clubService = {
  // Admin routes
  adminGetAll: (params) => apiClient.get("/admin/clubs", { params }),
  adminCreate: (data) => apiClient.post("/admin/create-club", data),
  createManager: (id, data) => apiClient.post(`/admin/club/${id}/manager`, data),
  updateManager: (id, managerId, data) => apiClient.put(`/admin/club/${id}/manager/${managerId}`, data),
  resetPassword: (id, data) => apiClient.put(`/admin/club/${id}/reset-password`, data),

  // Club CRUD
  getAll: (params) => apiClient.get("/clubs", { params }),
  getById: (id) => apiClient.get(`/clubs/${id}`),
  getBySlug: (slug) => apiClient.get(`/clubs/slug/${slug}`),
  create: (data) => apiClient.post("/clubs", data),
  update: (id, data) => apiClient.put(`/clubs/${id}`, data),
  remove: (id) => apiClient.delete(`/clubs/${id}`),

  // Settings & Theme
  updateTheme: (id, data) => apiClient.put(`/clubs/${id}/theme`, data),
  updateSettings: (id, data) => apiClient.put(`/clubs/${id}/settings`, data),
  updateLogo: (id, data) => apiClient.put(`/clubs/${id}/logo`, data),
};

export default clubService;
