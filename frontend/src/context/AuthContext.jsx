import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

// Decode JWT payload without a library
function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

// Check if token is expired (or will expire in next 60 seconds)
function isTokenExpired(token) {
  const decoded = decodeToken(token);
  if (!decoded?.exp) return true;
  return decoded.exp * 1000 < Date.now() + 60_000;
}

export function AuthProvider({ children }) {
  const [user,           setUser]           = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });
  const [token,          setToken]          = useState(() => localStorage.getItem('token') || null);
  const [sessionExpired, setSessionExpired] = useState(false);

  // ── Check token validity on every app load and every 60 seconds ──────────
  useEffect(() => {
    function checkSession() {
      const stored = localStorage.getItem('token');
      if (!stored) return;
      if (isTokenExpired(stored)) {
        handleSessionExpiry();
      }
    }
    checkSession();
    const interval = setInterval(checkSession, 60_000);
    return () => clearInterval(interval);
  }, []);

  function handleSessionExpiry() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    setSessionExpired(true); // triggers banner
  }

  function login(userData, jwtToken) {
    localStorage.setItem('user',  JSON.stringify(userData));
    localStorage.setItem('token', jwtToken);
    setUser(userData);
    setToken(jwtToken);
    setSessionExpired(false);
  }

  function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    setSessionExpired(false);
  }

  // ── authFetch: auto-handles 401 responses everywhere ─────────────────────
  const authFetch = useCallback(async (url, options = {}) => {
    // Pre-check: if token already expired before even sending, handle it now
    if (token && isTokenExpired(token)) {
      handleSessionExpiry();
      return new Response(JSON.stringify({ error: 'Session expired' }), { status: 401 });
    }

    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });

    // If server returns 401, session is gone — clear everything
    if (res.status === 401) {
      handleSessionExpiry();
    }

    return res;
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, authFetch, sessionExpired, setSessionExpired }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
