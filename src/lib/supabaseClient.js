import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error("Supabase 환경변수가 설정되지 않았습니다.");
}

// 배포 환경인지 확인
const isProduction = import.meta.env.PROD;

/*
 * Supabase Auth 세션을 localStorage 대신
 * Cookie에 저장하기 위한 custom storage
 */
const cookieStorage = {
  /*
   * 쿠키에서 세션 가져오기
   */
  getItem(key) {
    if (typeof document === "undefined") {
      return null;
    }

    const encodedKey = encodeURIComponent(key);

    const cookies = document.cookie.split("; ").find(cookie => cookie.startsWith(`${encodedKey}=`));

    if (!cookies) {
      return null;
    }

    const value = cookies.substring(cookies.indexOf("=") + 1);

    try {
      return decodeURIComponent(value);
    } catch {
      return null;
    }
  },

  /*
   * 쿠키에 세션 저장하기
   */
  setItem(key, value) {
    if (typeof document === "undefined") {
      return;
    }

    // 쿠키 유지 기간: 1년
    const maxAge = 60 * 60 * 24 * 365;

    const cookieOptions = [
      `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
      "path=/",
      `max-age=${maxAge}`,
      "SameSite=Lax",

      // Vercel(HTTPS)에서는 Secure 사용
      // localhost에서는 제외
      isProduction ? "Secure" : "",
    ]
      .filter(Boolean)
      .join("; ");

    document.cookie = cookieOptions;
  },

  /*
   * 로그아웃 시 쿠키 삭제
   */
  removeItem(key) {
    if (typeof document === "undefined") {
      return;
    }

    const cookieOptions = [
      `${encodeURIComponent(key)}=`,
      "path=/",
      "max-age=0",
      "SameSite=Lax",
      isProduction ? "Secure" : "",
    ]
      .filter(Boolean)
      .join("; ");

    document.cookie = cookieOptions;
  },
};

/*
 * Supabase Client
 */
export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    // localStorage 대신 Cookie 사용
    storage: cookieStorage,

    // 새로고침해도 로그인 유지
    persistSession: true,

    // access token 자동 갱신
    autoRefreshToken: true,

    // Google / Kakao OAuth 로그인 후
    // URL에서 인증 세션 감지
    detectSessionInUrl: true,
  },
});
