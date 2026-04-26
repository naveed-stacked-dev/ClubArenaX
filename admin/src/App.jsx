import { Routes, Route, Navigate } from "react-router-dom";
import { useAppContext } from "@/hooks/useAppContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminLayout from "@/components/AdminLayout";

// Pages
import LoginPage from "@/pages/LoginPage";
import SuperAdminDashboard from "@/pages/SuperAdminDashboard";
import ClubManagerDashboard from "@/pages/ClubManagerDashboard";
import LeaguesPage from "@/pages/LeaguesPage";
import TeamsPage from "@/pages/TeamsPage";
import PlayersPage from "@/pages/PlayersPage";
import TournamentsPage from "@/pages/TournamentsPage";
import MatchesPage from "@/pages/MatchesPage";
import LiveScoringPage from "@/pages/LiveScoringPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import SettingsPage from "@/pages/SettingsPage";
import ClubSettingsPage from "@/pages/ClubSettingsPage";

const ALL_ADMIN_ROLES = ["superAdmin", "clubManager", "matchManager"];
const MANAGER_ROLES = ["superAdmin", "clubManager"];
const SCORER_ROLES = ["superAdmin", "clubManager", "matchManager"];

/**
 * Role-based dashboard switcher — renders the appropriate dashboard
 * based on the authenticated user's role.
 */
function RoleDashboard() {
  const { isSuperAdmin } = useAppContext();
  return isSuperAdmin ? <SuperAdminDashboard /> : <ClubManagerDashboard />;
}

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
        {/* Role-based dashboard */}
        <Route index element={<RoleDashboard />} />

        {/* SuperAdmin-only: Leagues management */}
        <Route path="leagues" element={
          <ProtectedRoute allowedRoles={["superAdmin"]}><LeaguesPage /></ProtectedRoute>
        } />

        {/* ClubManager + SuperAdmin */}
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
        <Route path="analytics" element={
          <ProtectedRoute allowedRoles={MANAGER_ROLES}><AnalyticsPage /></ProtectedRoute>
        } />

        {/* Scoring */}
        <Route path="scoring/:matchId" element={
          <ProtectedRoute allowedRoles={SCORER_ROLES}><LiveScoringPage /></ProtectedRoute>
        } />
        <Route path="scoring" element={
          <ProtectedRoute allowedRoles={SCORER_ROLES}><LiveScoringPage /></ProtectedRoute>
        } />

        {/* Settings */}
        <Route path="settings" element={
          <ProtectedRoute allowedRoles={["superAdmin"]}><SettingsPage /></ProtectedRoute>
        } />

        {/* Club Settings (ClubManager) */}
        <Route path="club-settings" element={
          <ProtectedRoute allowedRoles={["clubManager"]}><ClubSettingsPage /></ProtectedRoute>
        } />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
