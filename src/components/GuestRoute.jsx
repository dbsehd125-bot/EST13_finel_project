import { Navigate, useLocation } from "react-router";

import { useAuth } from "../context/AuthContext";

export default function GuestRoute({ children }) {
  const location = useLocation();

  const { isLoggedIn, authLoading } = useAuth();

  /**
   * AuthContext에서 현재 세션을 확인하는 동안에는
   * 로그인/회원가입 페이지를 잠시 렌더링하지 않는다.
   */
  if (authLoading) {
    return null;
  }

  /**
   * 이미 로그인한 사용자가
   * /login 또는 /signup에 접근한 경우
   *
   * 로그인 필요 기능을 통해 넘어왔다면
   * location.state.from에 저장된 원래 페이지로 돌려보낸다.
   *
   * 예:
   * /community
   * → /login { from: "/community" }
   * → 로그인 성공
   * → /community
   *
   * /recipes/10
   * → /login { from: "/recipes/10" }
   * → 로그인 성공
   * → /recipes/10
   *
   * 직접 /login에 들어온 경우에는 홈으로 이동한다.
   */
  if (isLoggedIn) {
    const redirectPath =
      typeof location.state?.from === "string" &&
      location.state.from.startsWith("/") &&
      !location.state.from.startsWith("//")
        ? location.state.from
        : "/";

    return <Navigate to={redirectPath} replace />;
  }

  return children;
}
