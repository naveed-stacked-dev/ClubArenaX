import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import authService from "@/services/authService";
import leagueService from "@/services/leagueService";

export const AppContext = createContext(null);

/**
 * Apply a hex theme color to CSS custom properties for dynamic theming.
 */
function applyThemeColor(hex) {
  if (!hex) return;
  document.documentElement.style.setProperty("--club-primary", hex);
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("admin_token"));
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem("admin_dark_mode");
    return stored ? stored === "true" : true; // Default dark
  });

  // ─── Multi-tenant state ───
  const [leagueId, setLeagueId] = useState(null);
  const [themeColor, setThemeColor] = useState("#7c3aed");
  const [clubName, setClubName] = useState(null);
  const [clubLogo, setClubLogo] = useState(null);
  const [clubBanner, setClubBanner] = useState(null);

  // ─── Dark mode toggle ───
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("admin_dark_mode", String(darkMode));
  }, [darkMode]);

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => !prev);
  }, []);

  // ─── Fetch club data for ClubManagers ───
  const loadClubData = useCallback(async (userLeagueId) => {
    if (!userLeagueId) return;
    try {
      const res = await leagueService.getById(userLeagueId);
      const league = res.data?.data || res.data;
      if (league) {
        setLeagueId(userLeagueId);
        setClubName(league.name || null);
        setClubLogo(league.logo || null);
        setClubBanner(league.bannerUrl || null);
        const color = league.themeColor || "#7c3aed";
        setThemeColor(color);
        applyThemeColor(color);
      }
    } catch {
      // Non-blocking — we don't break login if league fetch fails
    }
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

    const dataObj = res.data.data || res.data;
    const newToken = dataObj.accessToken || dataObj.token;
    const userData = dataObj.user;
    localStorage.setItem("admin_token", newToken);
    localStorage.setItem("admin_user", JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);

    // Load club data for scoped roles
    if (userData?.leagueId) {
      await loadClubData(userData.leagueId);
    }

    return userData;
  }, [loadClubData]);

  // ─── Logout handler ───
  const logout = useCallback(() => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    setToken(null);
    setUser(null);
    setLeagueId(null);
    setThemeColor("#7c3aed");
    setClubName(null);
    setClubLogo(null);
    setClubBanner(null);
    // Reset theme
    document.documentElement.style.removeProperty("--club-primary");
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
        const dataObj = res.data.data || res.data;
        const userData = dataObj.user || dataObj;
        setUser(userData);

        // Load club data for scoped roles
        if (userData?.leagueId) {
          await loadClubData(userData.leagueId);
        }
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, [token, logout, loadClubData]);

  // ─── Role helpers ───
  const isSuperAdmin = useMemo(() => user?.role === "superadmin" || user?.role === "superAdmin", [user]);
  const isClubManager = useMemo(() => user?.role === "club_manager" || user?.role === "clubManager", [user]);
  const isMatchManager = useMemo(() => user?.role === "match_manager" || user?.role === "matchManager", [user]);

  // ─── Theme updater (for color picker) ───
  const updateThemeColor = useCallback((color) => {
    setThemeColor(color);
    applyThemeColor(color);
  }, []);

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
      // Multi-tenant
      leagueId,
      themeColor,
      clubName,
      clubLogo,
      clubBanner,
      updateThemeColor,
      loadClubData,
    }),
    [user, token, loading, darkMode, toggleDarkMode, login, logout, isSuperAdmin, isClubManager, isMatchManager, leagueId, themeColor, clubName, clubLogo, clubBanner, updateThemeColor, loadClubData]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

