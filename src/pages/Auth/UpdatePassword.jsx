/**
 * 비밀번호 재설정 페이지
 * - Supabase recovery session 유효 여부 확인
 * - 새 비밀번호 유효성 검사 및 비밀번호 변경 처리
 * - 변경 완료 후 recovery session을 종료하고 로그인 화면으로 이동
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { supabase } from "../../lib/supabaseClient";
import { useNotification } from "../../context/NotificationContext";
import Layout from "../../components/Layout";
import AuthVisual from "./components/AuthVisual";
import styles from "./Auth.module.css";

export default function UpdatePassword() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [recoveryReady, setRecoveryReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkRecoverySession() {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (!mounted) return;
        if (error) throw error;
        if (session) setRecoveryReady(true);
      } catch (error) {
        console.error("비밀번호 재설정 세션 확인 오류:", error);
      } finally {
        if (mounted) setCheckingSession(false);
      }
    }

    checkRecoverySession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === "PASSWORD_RECOVERY" && session) {
        setRecoveryReady(true);
        setCheckingSession(false);
        setErrorMessage("");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleUpdatePassword(event) {
    event.preventDefault();
    setErrorMessage("");

    if (!password) return setErrorMessage("새 비밀번호를 입력해주세요.");
    if (password.length < 6) return setErrorMessage("비밀번호는 6자 이상 입력해주세요.");
    if (!passwordConfirm) return setErrorMessage("새 비밀번호를 한 번 더 입력해주세요.");
    if (password !== passwordConfirm) return setErrorMessage("비밀번호가 일치하지 않습니다.");

    try {
      setLoading(true);

      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      showNotification("비밀번호가 변경되었습니다.", "success");
      await supabase.auth.signOut();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("비밀번호 변경 오류:", error);
      const message = error.message?.toLowerCase() ?? "";

      if (message.includes("same password")) {
        setErrorMessage("기존 비밀번호와 다른 비밀번호를 입력해주세요.");
      } else {
        setErrorMessage(error.message || "비밀번호 변경에 실패했습니다.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <Layout>
        <main className={styles.authPage}>
          <section className={styles.authCard}>
            <div className={styles.formArea}>
              <p className="text-sm">비밀번호 재설정 정보를 확인하고 있습니다.</p>
            </div>
          </section>
        </main>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className={styles.authPage}>
        <section className={styles.authCard}>
          <AuthVisual />

          <div className={styles.formArea}>
            <div className={styles.formHeader}>
              <h1 className="font-display dtext-2xl">새 비밀번호 설정</h1>
              <p className={`text-sm ${styles.description}`}>
                새로 사용할 비밀번호를 입력해주세요.
              </p>
            </div>

            {recoveryReady ? (
              <form className={styles.form} onSubmit={handleUpdatePassword}>
                <label className={styles.field}>
                  <span className="text-sm">새 비밀번호</span>
                  <input
                    className="text-sm"
                    type="password"
                    value={password}
                    onChange={event => setPassword(event.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    disabled={loading}
                  />
                </label>

                <label className={styles.field}>
                  <span className="text-sm">새 비밀번호 확인</span>
                  <input
                    className="text-sm"
                    type="password"
                    value={passwordConfirm}
                    onChange={event => setPasswordConfirm(event.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    disabled={loading}
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
                  disabled={loading}
                >
                  {loading ? "변경 중..." : "비밀번호 변경"}
                </button>
              </form>
            ) : (
              <>
                <div className={`${styles.errorSlot} ${styles.errorVisible}`} role="alert">
                  비밀번호 재설정 링크가 유효하지 않거나 만료되었습니다.
                </div>

                <button
                  type="button"
                  className={`text-button ${styles.primaryButton}`}
                  onClick={() => navigate("/login")}
                >
                  로그인으로 돌아가기
                </button>
              </>
            )}
          </div>
        </section>
      </main>
    </Layout>
  );
}
