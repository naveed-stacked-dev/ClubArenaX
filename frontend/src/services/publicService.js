import apiClient from "./apiClient";

const publicService = {
  getClubs: (params) => apiClient.get("/public/clubs", { params }),
  getClub: (slug) => apiClient.get(`/public/clubs/${slug}`),
  getTournaments: (clubId, params) => apiClient.get(`/public/tournaments/club/${clubId}`, { params }),
  getTournament: (id) => apiClient.get(`/public/tournaments/${id}`),
  getPointsTable: (id) => apiClient.get(`/public/tournaments/${id}/points-table`),
  getMatches: (params) => apiClient.get("/public/matches", { params }),
  getMatch: (id) => apiClient.get(`/public/matches/${id}`),
  getMatchSummary: (id) => apiClient.get(`/public/matches/${id}/summary`),
  getMatchScorecard: (id) => apiClient.get(`/public/matches/${id}/scorecard`),
  getMatchEvents: (id) => apiClient.get(`/public/matches/${id}/events`),
  getPlayer: (id) => apiClient.get(`/public/players/${id}`),
  getPlayerStats: (id) => apiClient.get(`/public/players/${id}/stats`),
  getPlayerForm: (id) => apiClient.get(`/public/players/${id}/form`),
};

export default publicService;
