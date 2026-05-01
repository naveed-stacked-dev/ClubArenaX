import apiClient from "./apiClient";

const matchService = {
  create: (data) => apiClient.post("/matches", data),
  getAll: (params) => apiClient.get("/matches", { params }),
  getLive: (clubId) => apiClient.get(`/matches/live/${clubId}`),
  getByTournament: (tournamentId, params) => apiClient.get(`/matches/tournament/${tournamentId}`, { params }),
  getById: (id) => apiClient.get(`/matches/${id}`),
  update: (id, data) => apiClient.put(`/matches/${id}`, data),
  remove: (id) => apiClient.delete(`/matches/${id}`),

  // Management
  schedule: (id, data) => apiClient.put(`/matches/${id}/schedule`, data),
  assignManager: (id, data) => apiClient.post(`/matches/${id}/assign-manager`, data),
  generateToken: (id) => apiClient.post(`/matches/${id}/generate-token`),
  getScorerLink: (id) => apiClient.get(`/matches/${id}/scorer-link`),

  // Streaming
  updateStreamUrl: (id, data) => apiClient.put(`/matches/${id}/stream-url`, data),
  getStreamUrl: (id) => apiClient.get(`/matches/${id}/stream-url`),
};

export default matchService;
