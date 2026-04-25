import { Routes, Route } from "react-router-dom";
import { ReactLenis } from "lenis/react";

import Navbar from "./Home/components/Navbar";
import Footer from "./Home/components/Footer";
import { ProtectedRoute, PublicRoute } from "./components/RouteGuards";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import LeaguesPage from "./pages/LeaguesPage";
import LeagueHubPage from "./pages/LeagueHubPage";
import TournamentCenterPage from "./pages/TournamentCenterPage";
import MatchCenterPage from "./pages/MatchCenterPage";
import PlayerProfilePage from "./pages/PlayerProfilePage";
import UserDashboardPage from "./pages/UserDashboardPage";

export default function App() {
  return (
    <ReactLenis root>
      <div className="relative bg-[#0a0a0c] text-white min-h-screen overflow-x-hidden flex flex-col">
        <Navbar />
        
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            
            {/* Public Pages */}
            <Route path="/leagues" element={<LeaguesPage />} />
            <Route path="/leagues/:slug" element={<LeagueHubPage />} />
            <Route path="/tournaments/:id" element={<TournamentCenterPage />} />
            <Route path="/matches/:id" element={<MatchCenterPage />} />
            <Route path="/players/:id" element={<PlayerProfilePage />} />

            {/* Auth */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Protected */}
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<UserDashboardPage />} />
            </Route>
          </Routes>
        </main>

        <Footer />
      </div>
    </ReactLenis>
  );
}
