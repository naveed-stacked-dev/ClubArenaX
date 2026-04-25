import { Routes, Route, Navigate } from "react-router-dom";
import { useAppContext } from "@/hooks/useAppContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminLayout from "@/components/AdminLayout";

// Pages
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import LeaguesPage from "@/pages/LeaguesPage";
import TeamsPage from "@/pages/TeamsPage";
import PlayersPage from "@/pages/PlayersPage";
import TournamentsPage from "@/pages/TournamentsPage";
import MatchesPage from "@/pages/MatchesPage";
import LiveScoringPage from "@/pages/LiveScoringPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import SettingsPage from "@/pages/SettingsPage";

const ALL_ADMIN_ROLES = ["superadmin", "club_manager", "clubManager", "match_manager", "matchManager"];
const MANAGER_ROLES = ["superadmin", "club_manager", "clubManager"];
const SCORER_ROLES = ["club_manager", "clubManager", "match_manager", "matchManager"];

export default function App() {
  const { isAuthenticated } = useAppContext();

  return (
    <Routes>
      {/* Public */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />

      {/* Protected Admin Layout */}
      <Route
        element={
          <ProtectedRoute allowedRoles={ALL_ADMIN_ROLES}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="leagues" element={
          <ProtectedRoute allowedRoles={["superadmin"]}><LeaguesPage /></ProtectedRoute>
        } />
        <Route path="tournaments" element={
          <ProtectedRoute allowedRoles={MANAGER_ROLES}><TournamentsPage /></ProtectedRoute>
        } />
        <Route path="teams" element={
          <ProtectedRoute allowedRoles={MANAGER_ROLES}><TeamsPage /></ProtectedRoute>
        } />
        <Route path="players" element={
          <ProtectedRoute allowedRoles={MANAGER_ROLES}><PlayersPage /></ProtectedRoute>
        } />
        <Route path="matches" element={
          <ProtectedRoute allowedRoles={MANAGER_ROLES}><MatchesPage /></ProtectedRoute>
        } />
        <Route path="scoring/:matchId" element={
          <ProtectedRoute allowedRoles={SCORER_ROLES}><LiveScoringPage /></ProtectedRoute>
        } />
        <Route path="scoring" element={
          <ProtectedRoute allowedRoles={SCORER_ROLES}><LiveScoringPage /></ProtectedRoute>
        } />
        <Route path="analytics" element={
          <ProtectedRoute allowedRoles={MANAGER_ROLES}><AnalyticsPage /></ProtectedRoute>
        } />
        <Route path="settings" element={
          <ProtectedRoute allowedRoles={["superadmin"]}><SettingsPage /></ProtectedRoute>
        } />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
