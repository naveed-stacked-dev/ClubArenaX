import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import authService from "@/services/authService";

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("admin_token"));
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem("admin_dark_mode");
    return stored ? stored === "true" : true; // Default dark
  });

  // ─── Dark mode toggle ───
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("admin_dark_mode", String(darkMode));
  }, [darkMode]);

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => !prev);
  }, []);

  // ─── Login handler ───
  const login = useCallback(async (role, credentials) => {
    let res;
    switch (role) {
      case "superadmin":
        res = await authService.loginSuperAdmin(credentials);
        break;
      case "club-manager":
        res = await authService.loginClubManager(credentials);
        break;
      case "match-manager":
        res = await authService.loginMatchManager(credentials);
        break;
      default:
        throw new Error("Invalid role");
    }

    const { token: newToken, user: userData } = res.data.data || res.data;
    localStorage.setItem("admin_token", newToken);
    localStorage.setItem("admin_user", JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return userData;
  }, []);

  // ─── Logout handler ───
  const logout = useCallback(() => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    setToken(null);
    setUser(null);
  }, []);

  // ─── Auto-login on mount ───
  useEffect(() => {
    const initAuth = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await authService.getMe();
        setUser(res.data.data || res.data.user || res.data);
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, [token, logout]);

  // ─── Role helpers ───
  const isSuperAdmin = useMemo(() => user?.role === "superadmin", [user]);
  const isClubManager = useMemo(() => user?.role === "club_manager" || user?.role === "clubManager", [user]);
  const isMatchManager = useMemo(() => user?.role === "match_manager" || user?.role === "matchManager", [user]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      darkMode,
      toggleDarkMode,
      login,
      logout,
      isSuperAdmin,
      isClubManager,
      isMatchManager,
      isAuthenticated: !!user,
    }),
    [user, token, loading, darkMode, toggleDarkMode, login, logout, isSuperAdmin, isClubManager, isMatchManager]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
