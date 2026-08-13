import { createContext, useContext, useEffect, useState } from "react";

import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);

  const [authLoading, setAuthLoading] = useState(true);

  const [profileLoading, setProfileLoading] = useState(false);

  const [logoutLoading, setLogoutLoading] = useState(false);

  /**
   * profiles 테이블에서
   * 현재 로그인 사용자의 프로필 조회
   */
  async function loadProfile(userId) {
    if (!userId) {
      setProfile(null);

      return null;
    }

    try {
      setProfileLoading(true);

      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, nickname, avatar_url")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      setProfile(data ?? null);

      return data ?? null;
    } catch (error) {
      console.error("프로필 조회 오류:", error);

      setProfile(null);

      return null;
    } finally {
      setProfileLoading(false);
    }
  }

  /**
   * 마이페이지 등에서 프로필을 변경한 뒤
   * Header 등에 즉시 반영하기 위한 함수
   */
  async function refreshProfile() {
    if (!user?.id) {
      setProfile(null);

      return null;
    }

    return loadProfile(user.id);
  }

  useEffect(() => {
    let mounted = true;

    /**
     * 앱 시작 시 기존 Supabase 세션 복구
     */
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

        const currentUser = currentSession?.user ?? null;

        setSession(currentSession);
        setUser(currentUser);

        if (currentUser?.id) {
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("user_id, nickname, avatar_url")
            .eq("user_id", currentUser.id)
            .maybeSingle();

          if (!mounted) {
            return;
          }

          if (profileError) {
            console.error("초기 프로필 조회 오류:", profileError);

            setProfile(null);
          } else {
            setProfile(profileData ?? null);
          }
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error("세션 확인 오류:", error);

        if (mounted) {
          setSession(null);
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (mounted) {
          setAuthLoading(false);
        }
      }
    }

    loadSession();

    /**
     * 로그인 / 로그아웃 /
     * OAuth 완료 등 인증 상태 변경 감지
     */
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (!mounted) {
        return;
      }

      const currentUser = currentSession?.user ?? null;

      setSession(currentSession);
      setUser(currentUser);
      setAuthLoading(false);

      if (currentUser?.id) {
        void loadProfile(currentUser.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;

      subscription.unsubscribe();
    };
  }, []);

  /**
   * 로그아웃
   */
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
      setProfile(null);

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
    profile,

    authLoading,
    profileLoading,
    logoutLoading,

    isLoggedIn: Boolean(session && user),

    refreshProfile,
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
