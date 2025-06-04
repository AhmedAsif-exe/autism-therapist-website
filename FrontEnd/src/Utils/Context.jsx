// src/context/AuthContext.js
import { createContext, useContext, useEffect, useState } from "react";
import { checkAuthStatus } from "axiosInstance";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true; // ✅ prevent state update on unmounted component

    checkAuthStatus()
      .then((res) => {
        if (isMounted) {
          setUser(res);
          setLoggedIn(!!res);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setUser(null);
          setLoggedIn(false);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loggedIn, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
