/**
 * Auth 소셜 로그인 Custom Hook
 * - Google/Kakao OAuth 로그인 요청 공통 처리
 * - provider별 로딩 상태와 오류 처리 로직 관리
 */
import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function useSocialLogin({ onErrorClear, onError }) {
  const [socialLoading, setSocialLoading] = useState("");

  async function handleSocialLogin(provider) {
    try {
      onErrorClear?.();
      setSocialLoading(provider);

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) throw error;
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
