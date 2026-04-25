import apiClient from "./apiClient";

const tournamentService = {
  create: (data) => apiClient.post("/tournaments", data),
  getByLeague: (leagueId, params) => apiClient.get(`/tournaments/league/${leagueId}`, { params }),
  getById: (id) => apiClient.get(`/tournaments/${id}`),
  update: (id, data) => apiClient.put(`/tournaments/${id}`, data),
  generateFixtures: (id, data) => apiClient.post(`/tournaments/${id}/generate-fixtures`, data),
  getPointsTable: (id) => apiClient.get(`/tournaments/${id}/points-table`),
};

export default tournamentService;
