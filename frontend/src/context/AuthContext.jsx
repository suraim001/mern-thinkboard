import { createContext, useContext, useEffect, useState } from 'react';
import api, { TOKEN_KEY } from '../lib/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // nothing to load when there is no token saved
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY)));

  const fetchUser = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data.user);
    } catch (error) {
      console.error("Error fetching user", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // used after the google redirect, we only have the token there
  const loginWithToken = async (token) => {
    localStorage.setItem(TOKEN_KEY, token);
    setLoading(true);
    await fetchUser();
  };

  // email + password, errors are thrown so the page can show the message
  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem(TOKEN_KEY, res.data.token);
    setUser(res.data.user);
  };

  const signup = async (username, email, password) => {
    const res = await api.post("/auth/register", { username, email, password });
    localStorage.setItem(TOKEN_KEY, res.data.token);
    setUser(res.data.user);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Error logging out", error);
    }
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  // drop the session locally without calling the api (e.g. after deleting the account)
  const clearSession = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  // restore the session on page load
  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    api.get("/auth/me")
      .then((res) => setUser(res.data.user))
      .catch((error) => console.error("Error fetching user", error))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, signup, loginWithToken, logout, clearSession }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
