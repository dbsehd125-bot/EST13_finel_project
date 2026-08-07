import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error("Supabase 환경변수가 설정되지 않았습니다.");
}

const isProduction = import.meta.env.PROD;

// 쿠키 하나의 실제 브라우저 제한보다 여유 있게 설정
const COOKIE_CHUNK_SIZE = 3000;
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function getCookie(name) {
  if (typeof document === "undefined") {
    return null;
  }

  const encodedName = encodeURIComponent(name);

  const cookie = document.cookie.split("; ").find(item => item.startsWith(`${encodedName}=`));

  if (!cookie) {
    return null;
  }

  return cookie.substring(cookie.indexOf("=") + 1);
}

function setCookie(name, value) {
  if (typeof document === "undefined") {
    return;
  }

  const cookieOptions = [
    `${encodeURIComponent(name)}=${value}`,
    "path=/",
    `max-age=${COOKIE_MAX_AGE}`,
    "SameSite=Lax",
    isProduction ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");

  document.cookie = cookieOptions;
}

function removeCookie(name) {
  if (typeof document === "undefined") {
    return;
  }

  const cookieOptions = [
    `${encodeURIComponent(name)}=`,
    "path=/",
    "max-age=0",
    "SameSite=Lax",
    isProduction ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");

  document.cookie = cookieOptions;
}

const cookieStorage = {
  getItem(key) {
    if (typeof document === "undefined") {
      return null;
    }

    try {
      // 분할 쿠키 개수 확인
      const partsValue = getCookie(`${key}.parts`);

      // 예전 단일 쿠키 방식이 남아있는 경우
      if (!partsValue) {
        const legacyValue = getCookie(key);

        if (!legacyValue) {
          return null;
        }

        return decodeURIComponent(legacyValue);
      }

      const parts = Number(partsValue);

      if (!Number.isInteger(parts) || parts <= 0) {
        return null;
      }

      let encodedValue = "";

      for (let index = 0; index < parts; index += 1) {
        const chunk = getCookie(`${key}.${index}`);

        if (chunk === null) {
          return null;
        }

        encodedValue += chunk;
      }

      return decodeURIComponent(encodedValue);
    } catch (error) {
      console.error("Supabase 세션 쿠키 읽기 오류:", error);
      return null;
    }
  },

  setItem(key, value) {
    if (typeof document === "undefined") {
      return;
    }

    try {
      // 기존 쿠키 정리
      this.removeItem(key);

      const encodedValue = encodeURIComponent(value);

      const chunks = [];

      for (let index = 0; index < encodedValue.length; index += COOKIE_CHUNK_SIZE) {
        chunks.push(encodedValue.slice(index, index + COOKIE_CHUNK_SIZE));
      }

      chunks.forEach((chunk, index) => {
        setCookie(`${key}.${index}`, chunk);
      });

      setCookie(`${key}.parts`, String(chunks.length));
    } catch (error) {
      console.error("Supabase 세션 쿠키 저장 오류:", error);
    }
  },

  removeItem(key) {
    if (typeof document === "undefined") {
      return;
    }

    try {
      // 현재 분할된 쿠키 개수
      const partsValue = getCookie(`${key}.parts`);
      const parts = Number(partsValue);

      if (Number.isInteger(parts) && parts > 0) {
        for (let index = 0; index < parts; index += 1) {
          removeCookie(`${key}.${index}`);
        }
      }

      removeCookie(`${key}.parts`);

      // 이전 단일 쿠키 방식도 같이 삭제
      removeCookie(key);

      // 혹시 parts 정보가 깨졌을 경우를 대비해
      // 일정 개수까지 잔여 조각 제거
      for (let index = 0; index < 20; index += 1) {
        removeCookie(`${key}.${index}`);
      }
    } catch (error) {
      console.error("Supabase 세션 쿠키 삭제 오류:", error);
    }
  },
};

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: cookieStorage,

    // 새로고침 후에도 로그인 유지
    persistSession: true,

    // access token 자동 갱신
    autoRefreshToken: true,

    // Google / Kakao OAuth 리다이렉트 처리
    detectSessionInUrl: true,
  },
});
