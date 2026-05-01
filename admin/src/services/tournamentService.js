import apiClient from "./apiClient";

const tournamentService = {
  create: (data) => apiClient.post("/tournaments", data),
  getAll: (params) => apiClient.get("/tournaments", { params }),
  getByClub: (clubId, params) => apiClient.get(`/tournaments/club/${clubId}`, { params }),
  getById: (id) => apiClient.get(`/tournaments/${id}`),
  update: (id, data) => apiClient.put(`/tournaments/${id}`, data),
  generateFixtures: (id, data) => apiClient.post(`/tournaments/${id}/generate-fixtures`, data),
  getPointsTable: (id) => apiClient.get(`/tournaments/${id}/points-table`),

  // Bracket / Knockout
  getBracket: (id) => apiClient.get(`/tournaments/${id}/bracket`),
  submitResult: (tournamentId, matchId, data) =>
    apiClient.put(`/tournaments/${tournamentId}/matches/${matchId}/result`, data),

  // Visual Bracket Builder
  getBracketGraph: (id) => apiClient.get(`/tournaments/${id}/bracket-graph`),
  saveBracketGraph: (id, data) => apiClient.put(`/tournaments/${id}/bracket-graph`, data),
};

export default tournamentService;
