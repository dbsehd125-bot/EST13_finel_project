import { createContext, useContext, useEffect, useState } from "react";

import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);

  const [authLoading, setAuthLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      try {
        const {
          data: { session: currentSession },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("세션 확인 오류:", error);
        }

        if (!mounted) {
          return;
        }

        setSession(currentSession);
        setUser(currentSession?.user ?? null);
      } catch (error) {
        console.error("세션 확인 오류:", error);

        if (mounted) {
          setSession(null);
          setUser(null);
        }
      } finally {
        if (mounted) {
          setAuthLoading(false);
        }
      }
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (!mounted) {
        return;
      }

      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function logout() {
    if (logoutLoading) {
      return false;
    }

    try {
      setLogoutLoading(true);

      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      setSession(null);
      setUser(null);

      return true;
    } catch (error) {
      console.error("로그아웃 오류:", error);
      return false;
    } finally {
      setLogoutLoading(false);
    }
  }

  const value = {
    user,
    session,

    authLoading,
    logoutLoading,

    isLoggedIn: Boolean(session && user),

    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth는 AuthProvider 내부에서 사용해야 합니다.");
  }

  return context;
}
