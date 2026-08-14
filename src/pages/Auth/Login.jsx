/**
 * 로그인 페이지
 * - 이메일/비밀번호 로그인 처리
 * - Google/Kakao 소셜 로그인 연결
 * - 로그인 필요 페이지에서 진입한 경우 로그인 성공 후 원래 페이지로 복귀
 * - 비밀번호 재설정 이메일 요청 모달 관리
 */
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";

import { supabase } from "../../lib/supabaseClient";
import { useNotification } from "../../context/NotificationContext";
import Layout from "../../components/Layout";
import AuthVisual from "./components/AuthVisual";
import SocialLoginButtons from "./components/SocialLoginButtons";
import PasswordResetModal from "./components/PasswordResetModal";
import useSocialLogin from "./hooks/useSocialLogin";
import styles from "./Auth.module.css";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const { showNotification } = useNotification();

  /**
   * 로그인 필요 페이지에서 넘겨준 원래 경로
   *
   * 예)
   * navigate("/login", {
   *   state: {
   *     from: "/recipes/10",
   *   },
   * });
   *
   * 직접 로그인 페이지에 들어온 경우에는 "/"로 이동한다.
   */
  const redirectPath =
    typeof location.state?.from === "string" &&
    location.state.from.startsWith("/") &&
    !location.state.from.startsWith("//")
      ? location.state.from
      : "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState("");

  const { socialLoading, handleSocialLogin } = useSocialLogin({
    redirectPath,
    onErrorClear: () => setErrorMessage(""),
    onError: setErrorMessage,
  });

  const isProcessing = loading || Boolean(socialLoading);

  /**
   * 이메일 / 비밀번호 로그인
   */
  async function handleEmailLogin(event) {
    event.preventDefault();

    setErrorMessage("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setErrorMessage("이메일을 입력해주세요.");
      return;
    }

    if (!password) {
      setErrorMessage("비밀번호를 입력해주세요.");
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (error) {
        throw error;
      }

      /**
       * signInWithPassword 성공 결과에 이미 session이 있으므로
       * 별도로 getSession()을 다시 호출할 필요가 없다.
       */
      if (!data.session) {
        throw new Error("로그인 세션을 생성하지 못했습니다.");
      }

      showNotification("로그인되었습니다.", "success");

      /**
       * 로그인 페이지를 history에 남기지 않도록 replace 사용
       *
       * 로그인 후 뒤로가기를 눌렀을 때
       * 다시 /login으로 돌아가는 현상을 방지한다.
       */
      navigate(redirectPath, {
        replace: true,
      });
    } catch (error) {
      console.error("이메일 로그인 오류:", error);

      const message = error.message?.toLowerCase() ?? "";

      if (message.includes("invalid login credentials")) {
        setErrorMessage("이메일 또는 비밀번호가 올바르지 않습니다.");
      } else if (message.includes("email not confirmed")) {
        setErrorMessage("이메일 인증이 완료되지 않은 계정입니다.");
      } else {
        setErrorMessage(error.message || "로그인에 실패했습니다.");
      }
    } finally {
      setLoading(false);
    }
  }

  /**
   * 비밀번호 재설정 이메일 요청
   */
  async function handleResetPassword() {
    const trimmedEmail = resetEmail.trim();

    if (!trimmedEmail) {
      setResetMessage("이메일을 입력해주세요.");

      return;
    }

    try {
      setResetLoading(true);
      setResetMessage("");

      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        throw error;
      }

      setResetMessage("비밀번호 재설정 이메일을 전송했습니다.");
    } catch (error) {
      console.error("비밀번호 재설정 오류:", error);

      setResetMessage(error.message || "비밀번호 재설정 이메일 전송에 실패했습니다.");
    } finally {
      setResetLoading(false);
    }
  }

  function openResetModal() {
    setResetEmail(email);
    setResetMessage("");
    setResetModalOpen(true);
  }

  return (
    <Layout>
      <SEO
        title="로그인 | 깃깔나는 레시피"
        description="깃깔나는 레시피에 로그인하고 나만의 레시피와 커뮤니티를 이용해보세요."
        robots="noindex, nofollow"
      />
      <main className={styles.authPage}>
        <section className={styles.authCard}>
          <AuthVisual />

          <div className={styles.formArea}>
            <div className={styles.formHeader}>
              <h1 className="font-display dtext-2xl">로그인</h1>

              <p className={`text-sm ${styles.description}`}>다시 만나서 반가워요!</p>
            </div>

            <form className={styles.form} onSubmit={handleEmailLogin}>
              <label className={styles.field}>
                <span className="text-sm">이메일</span>

                <input
                  className="text-sm"
                  type="email"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={isProcessing}
                />
              </label>

              <label className={styles.field}>
                <div className={styles.labelRow}>
                  <span className="text-sm">비밀번호</span>

                  <button
                    type="button"
                    className={`text-s ${styles.textLink}`}
                    onClick={openResetModal}
                    disabled={isProcessing}
                  >
                    비밀번호를 잊으셨나요?
                  </button>
                </div>

                <input
                  className="text-sm"
                  type="password"
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={isProcessing}
                />
              </label>

              <div
                className={`${styles.errorSlot} ${errorMessage ? styles.errorVisible : ""}`}
                role="alert"
                aria-live="polite"
              >
                {errorMessage || "\u00A0"}
              </div>

              <button
                type="submit"
                className={`text-button ${styles.primaryButton}`}
                disabled={isProcessing}
              >
                {loading ? "로그인 중..." : "로그인"}
              </button>
            </form>

            <div className={styles.divider}>
              <span />

              <p className="text-s">또는</p>

              <span />
            </div>

            <SocialLoginButtons
              socialLoading={socialLoading}
              disabled={isProcessing}
              onSocialLogin={handleSocialLogin}
            />

            <p className={`text-s ${styles.switchText}`}>
              계정이 없으신가요?{" "}
              <Link
                to="/signup"
                state={{
                  from: redirectPath,
                }}
                className={styles.textLink}
              >
                회원가입
              </Link>
            </p>
          </div>
        </section>

        <PasswordResetModal
          open={resetModalOpen}
          email={resetEmail}
          loading={resetLoading}
          message={resetMessage}
          onEmailChange={value => {
            setResetEmail(value);
            setResetMessage("");
          }}
          onSubmit={handleResetPassword}
          onClose={() => setResetModalOpen(false)}
        />
      </main>
    </Layout>
  );
}
