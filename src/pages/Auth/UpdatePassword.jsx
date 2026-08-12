import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { supabase } from "../../lib/supabaseClient";
import Layout from "../../components/Layout";
import Notification from "../../components/Notification";
import styles from "./Auth.module.css";
import authBack from "../../images/authback.png";

export default function UpdatePassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");

  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  function showNotification(message, severity = "success") {
    setNotification({ open: true, message, severity });
  }

  function closeNotification() {
    setNotification(previous => ({ ...previous, open: false }));
  }
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

        if (error) {
          throw error;
        }

        if (session) {
          setRecoveryReady(true);
        }
      } catch (error) {
        console.error("비밀번호 재설정 세션 확인 오류:", error);
      } finally {
        if (mounted) {
          setCheckingSession(false);
        }
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

    if (!password) {
      setErrorMessage("새 비밀번호를 입력해주세요.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("비밀번호는 6자 이상 입력해주세요.");
      return;
    }

    if (!passwordConfirm) {
      setErrorMessage("새 비밀번호를 한 번 더 입력해주세요.");
      return;
    }

    if (password !== passwordConfirm) {
      setErrorMessage("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        throw error;
      }

      showNotification("비밀번호가 변경되었습니다.", "success");

      // 비밀번호 재설정 과정에서 만들어진 세션 종료
      await supabase.auth.signOut();

      window.setTimeout(() => {
        navigate("/login", {
          replace: true,
        });
      }, 800);
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
          {/* 왼쪽 이미지 영역 */}
          <div className={styles.visual}>
            <img src={authBack} alt="" />

            <div className={styles.visualOverlay}>
              <div className={styles.brand}>
                <div className={styles.brandIcon}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 2v3M8 3v2M16 3v2" />
                    <path d="M4 11h16v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6z" />
                    <path d="M3 11h18" />
                  </svg>
                </div>

                <span className="font-display dtext-xl">깃깔나는 레시피</span>
              </div>

              <p className={`font-display dtext-2xl ${styles.slogan}`}>
                한 끼의 생각이
                <br />
                레시피와 이미지로
              </p>
            </div>
          </div>

          {/* 오른쪽 비밀번호 변경 영역 */}
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
        <Notification
          open={notification.open}
          message={notification.message}
          severity={notification.severity}
          onClose={closeNotification}
        />
      </main>
    </Layout>
  );
}
