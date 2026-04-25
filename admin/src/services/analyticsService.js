import apiClient from "./apiClient";

const analyticsService = {
  getPlayerAnalytics: (id) => apiClient.get(`/analytics/player/${id}`),
  getPlayerForm: (id) => apiClient.get(`/analytics/player/${id}/form`),
  getMatchAnalytics: (id) => apiClient.get(`/analytics/match/${id}`),
  getMatchGraph: (id) => apiClient.get(`/analytics/match/${id}/graph`),
  getTeamAnalytics: (id) => apiClient.get(`/analytics/team/${id}`),
  getHeadToHead: (id, opponentId) => apiClient.get(`/analytics/team/${id}/head-to-head/${opponentId}`),
  getLeaderboard: (leagueId, params) => apiClient.get(`/analytics/leaderboard/${leagueId}`, { params }),
};

export default analyticsService;
