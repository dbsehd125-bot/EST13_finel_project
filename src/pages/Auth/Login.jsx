import { useState } from "react";
import { Link, useNavigate } from "react-router";

import { supabase } from "../../lib/supabaseClient";
import { useNotification } from "../../context/NotificationContext";
import Layout from "../../components/Layout";
import styles from "./Auth.module.css";
import authBack from "../../images/authback.png";
import googleIcon from "../../images/google.png";
import kakaoIcon from "../../images/kakao.png";

export default function Login() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState("");

  const isProcessing = loading || Boolean(socialLoading);

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

      if (!data.session) {
        throw new Error("로그인 세션을 생성하지 못했습니다.");
      }

      // Cookie storage에 실제 저장됐는지 확인
      const {
        data: { session: storedSession },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!storedSession) {
        throw new Error("로그인 세션 저장에 실패했습니다.");
      }

      showNotification("로그인되었습니다.", "success");
      navigate("/");
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

  async function handleSocialLogin(provider) {
    try {
      setErrorMessage("");
      setSocialLoading(provider);

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error(`${provider} 로그인 오류:`, error);
      setErrorMessage("소셜 로그인에 실패했습니다.");
      setSocialLoading("");
    }
  }

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

  return (
    <Layout>
      <main className={styles.authPage}>
        <section className={styles.authCard}>
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
                    onClick={() => {
                      setResetEmail(email);
                      setResetMessage("");
                      setResetModalOpen(true);
                    }}
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

            <div className={styles.socialButtons}>
              <button
                type="button"
                className={`text-sm ${styles.socialButton}`}
                onClick={() => handleSocialLogin("google")}
                disabled={isProcessing}
              >
                <img className={styles.icon} src={googleIcon} alt="" aria-hidden="true" />

                <span className={styles.desktopSocialText}>
                  {socialLoading === "google" ? "Google 연결 중..." : "Google로 계속하기"}
                </span>

                <span className={styles.mobileSocialText}>
                  {socialLoading === "google" ? "연결 중..." : "Google"}
                </span>
              </button>

              <button
                type="button"
                className={`text-sm ${styles.socialButton} ${styles.kakaoButton}`}
                onClick={() => handleSocialLogin("kakao")}
                disabled={isProcessing}
              >
                <img className={styles.icon} src={kakaoIcon} alt="" aria-hidden="true" />

                <span className={styles.desktopSocialText}>
                  {socialLoading === "kakao" ? "Kakao 연결 중..." : "Kakao로 계속하기"}
                </span>

                <span className={styles.mobileSocialText}>
                  {socialLoading === "kakao" ? "연결 중..." : "Kakao"}
                </span>
              </button>
            </div>

            <p className={`text-s ${styles.switchText}`}>
              계정이 없으신가요?{" "}
              <Link to="/signup" className={styles.textLink}>
                회원가입
              </Link>
            </p>
          </div>
        </section>
        {resetModalOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 2000,
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px",
            }}
            onClick={() => {
              if (!resetLoading) {
                setResetModalOpen(false);
              }
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "420px",
                padding: "28px",
                borderRadius: "24px",
                backgroundColor: "#fff",
              }}
              onClick={event => event.stopPropagation()}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "24px",
                }}
              >
                <div>
                  <h2 className="font-display dtext-2xl" style={{ margin: 0 }}>
                    비밀번호 찾기
                  </h2>

                  <p
                    className="text-sm"
                    style={{
                      margin: "8px 0 0",
                      color: "#777",
                    }}
                  >
                    가입한 이메일로 비밀번호 재설정 링크를 보내드릴게요.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setResetModalOpen(false)}
                  disabled={resetLoading}
                  style={{
                    border: 0,
                    background: "transparent",
                    fontSize: "24px",
                    cursor: "pointer",
                  }}
                >
                  ×
                </button>
              </div>

              <label
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <span className="text-sm">이메일</span>

                <input
                  className="text-sm"
                  type="email"
                  value={resetEmail}
                  onChange={event => {
                    setResetEmail(event.target.value);
                    setResetMessage("");
                  }}
                  placeholder="you@example.com"
                  disabled={resetLoading}
                  style={{
                    width: "100%",
                    height: "50px",
                    padding: "0 16px",
                    boxSizing: "border-box",
                    border: "1px solid #ead9c8",
                    borderRadius: "999px",
                    backgroundColor: "#fff8ee",
                    outline: "none",
                  }}
                />
              </label>

              <div
                style={{
                  minHeight: "22px",
                  marginTop: "8px",
                  fontSize: "13px",
                  color: "var(--brand-primary)",
                }}
              >
                {resetMessage}
              </div>

              <button
                type="button"
                onClick={handleResetPassword}
                disabled={resetLoading}
                className={`text-button ${styles.primaryButton}`}
                style={{
                  width: "100%",
                  marginTop: "12px",
                }}
              >
                {resetLoading ? "전송 중..." : "재설정 메일 보내기"}
              </button>
            </div>
          </div>
        )}
      </main>
    </Layout>
  );
}
