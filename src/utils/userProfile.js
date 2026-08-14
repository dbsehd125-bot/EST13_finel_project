/**
 * Supabase Auth user metadata에서 닉네임 반환
 */
export function getUserNickname(user) {
  return (
    user?.user_metadata?.nickname ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "사용자"
  );
}

/**
 * profiles 데이터를 우선 사용하고,
 * 없으면 기존 저장된 닉네임으로 fallback
 */
export function getProfileNickname(profile, fallbackNickname = "사용자") {
  return profile?.nickname || fallbackNickname || "사용자";
}
