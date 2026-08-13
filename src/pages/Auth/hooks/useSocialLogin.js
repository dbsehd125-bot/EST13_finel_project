/**
 * Auth 소셜 로그인 Custom Hook
 * - Google/Kakao OAuth 로그인 요청 공통 처리
 * - provider별 로딩 상태와 오류 처리
 * - OAuth 완료 후 로그인 이전 페이지로 바로 복귀
 */
import { useState } from "react";

import { supabase } from "../../../lib/supabaseClient";

/**
 * 외부 URL이 redirectTo로 들어가는 것을 막고
 * 우리 사이트 내부 경로만 허용한다.
 */
function getSafeRedirectPath(redirectPath) {
  if (
    typeof redirectPath !== "string" ||
    !redirectPath.startsWith("/") ||
    redirectPath.startsWith("//")
  ) {
    return "/";
  }

  return redirectPath;
}

export default function useSocialLogin({ redirectPath = "/", onErrorClear, onError }) {
  const [socialLoading, setSocialLoading] = useState("");

  async function handleSocialLogin(provider) {
    try {
      onErrorClear?.();

      setSocialLoading(provider);

      const safeRedirectPath = getSafeRedirectPath(redirectPath);

      /**
       * OAuth가 끝난 뒤 사이트 루트(/)를 거치지 않고
       * 사용자가 원래 보고 있던 페이지로 바로 돌아온다.
       *
       * 예:
       * /community → Google → /community
       * /recipes/12 → Kakao → /recipes/12
       */
      const redirectUrl = `${window.location.origin}${safeRedirectPath}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider,

        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error(`${provider} 로그인 오류:`, error);

      onError?.("소셜 로그인에 실패했습니다.");

      setSocialLoading("");
    }
  }

  return {
    socialLoading,
    handleSocialLogin,
  };
}
