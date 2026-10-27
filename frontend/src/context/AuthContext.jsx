import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";

const AuthContext = createContext(null);
const STORAGE_KEY = "ep-auth";

export function AuthProvider({ children }) {
  const [user, setUser]         = useState(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch {}
    setLoading(false);
  }, []);

  const login = useCallback(async (userName, password, companyCode, companyId, slug) => {
    try {
      const res = await api.post("/auth/login", { userName, password, companyCode, companyId, slug });
      const data = res.data.data;
      const session = {
        userId:      data.UserId      ?? data.userid      ?? data.UserID,
        userName:    data.UserName    ?? data.username,
        companyId:   data.CompanyId   ?? data.companyid,
        companyCode: data.CompanyCode ?? data.companycode ?? companyCode,
        companyName: data.CompanyName ?? data.companyname ?? "",
        dbName:      data.DbName      ?? data.dbname      ?? null,
        roleId:      data.RoleId      ?? data.roleid      ?? 0,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      setUser(session);
      return session;
    } catch (err) {
      // No backend yet — fall back to demo session so the UI is usable
      const isNetworkError = !err.response;
      if (isNetworkError) {
        const session = {
          userId: 0, userName, companyCode, companyName: "Demo Mode",
          companyId: 0, roleId: 0, isDemo: true,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
        setUser(session);
        return session;
      }
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
