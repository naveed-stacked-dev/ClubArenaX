import apiClient from "./apiClient";

const playerService = {
  create: (data) => apiClient.post("/players", data),
  getByLeague: (leagueId, params) => apiClient.get(`/players/league/${leagueId}`, { params }),
  getByTeam: (teamId) => apiClient.get(`/players/team/${teamId}`),
  getById: (id) => apiClient.get(`/players/${id}`),
  update: (id, data) => apiClient.put(`/players/${id}`, data),
  remove: (id) => apiClient.delete(`/players/${id}`),
  getStats: (id) => apiClient.get(`/players/${id}/stats`),
  getRecentMatches: (id) => apiClient.get(`/players/${id}/recent-matches`),
};

export default playerService;
