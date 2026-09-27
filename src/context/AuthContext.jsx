import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("ims_user");
    return raw ? JSON.parse(raw) : null;
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("ims_token");
    if (!token) {
      setReady(true);
      return;
    }
    api
      .get("/auth/me")
      .then((res) => {
        setUser(res.data);
        localStorage.setItem("ims_user", JSON.stringify(res.data));
      })
      .catch(() => {
        localStorage.removeItem("ims_token");
        localStorage.removeItem("ims_user");
        setUser(null);
      })
      .finally(() => setReady(true));
  }, []);

  async function login(email, password, role) {
    const { data } = await api.post("/auth/login", { email, password, role });
    localStorage.setItem("ims_token", data.token);
    localStorage.setItem("ims_user", JSON.stringify(data.user));
    localStorage.setItem("ims_last_role", role);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem("ims_token");
    localStorage.removeItem("ims_user");
    setUser(null);
  }

  async function refresh() {
    const { data } = await api.get("/auth/me");
    setUser(data);
    localStorage.setItem("ims_user", JSON.stringify(data));
    return data;
  }

  const value = useMemo(() => ({ user, ready, login, logout, refresh, setUser }), [user, ready]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
