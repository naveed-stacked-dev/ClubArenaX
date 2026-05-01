import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import authService from "@/services/authService";
import clubService from "@/services/clubService";

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
  const [darkMode, setDarkMode] = useState(false);

  // ─── Multi-tenant state ───
  const [clubId, setClubId] = useState(null);
  const [themeColor, setThemeColor] = useState("#7c3aed");
  const [clubTheme, setClubTheme] = useState({ primaryColor: "#1a73e8", secondaryColor: "#ffffff" });
  const [clubName, setClubName] = useState(null);
  const [clubLogo, setClubLogo] = useState(null);
  const [clubBanner, setClubBanner] = useState(null);

  // Disable dark mode
  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  const toggleDarkMode = useCallback(() => {}, []);

  // ─── Fetch club data for ClubManagers ───
  const loadClubData = useCallback(async (userClubId) => {
    if (!userClubId) return;
    try {
      const res = await clubService.getById(userClubId);
      const club = res.data?.data || res.data;
      if (club) {
        setClubId(userClubId);
        setClubName(club.name || null);
        setClubLogo(club.logo || null);
        setClubBanner(club.bannerUrl || null);
        setClubTheme(club.theme || { primaryColor: "#1a73e8", secondaryColor: "#ffffff" });
        const color = club.themeColor || "#7c3aed";
        setThemeColor(color);
        applyThemeColor(color);
      }
    } catch {
      // Non-blocking — we don't break login if club fetch fails
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
    if (userData?.clubId) {
      await loadClubData(userData.clubId);
    }

    return userData;
  }, [loadClubData]);

  // ─── Logout handler ───
  const logout = useCallback(() => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    setToken(null);
    setUser(null);
    setClubId(null);
    setThemeColor("#7c3aed");
    setClubTheme({ primaryColor: "#1a73e8", secondaryColor: "#ffffff" });
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
        if (userData?.clubId) {
          await loadClubData(userData.clubId);
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

  const updateUser = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem("admin_user", JSON.stringify(userData));
  }, []);

  const value = useMemo(
    () => ({
      user,
      updateUser,
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
      clubId,
      themeColor,
      clubName,
      clubLogo,
      clubBanner,
      clubTheme,
      updateThemeColor,
      loadClubData,
    }),
    [user, updateUser, token, loading, darkMode, toggleDarkMode, login, logout, isSuperAdmin, isClubManager, isMatchManager, clubId, themeColor, clubTheme, clubName, clubLogo, clubBanner, updateThemeColor, loadClubData]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

