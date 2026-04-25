import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import authService from "@/services/authService";

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("user_token"));
  const [loading, setLoading] = useState(true);

  const login = useCallback(async (credentials) => {
    const res = await authService.login(credentials);
    const { token: newToken, user: userData } = res.data.data || res.data;
    localStorage.setItem("user_token", newToken);
    localStorage.setItem("user_data", JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (data) => {
    const res = await authService.register(data);
    const { token: newToken, user: userData } = res.data.data || res.data;
    localStorage.setItem("user_token", newToken);
    localStorage.setItem("user_data", JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("user_token");
    localStorage.removeItem("user_data");
    setToken(null);
    setUser(null);
  }, []);

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

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout,
      isAuthenticated: !!user,
    }),
    [user, token, loading, login, register, logout]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
