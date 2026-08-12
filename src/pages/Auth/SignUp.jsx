import { useState } from "react";
import { Link, useNavigate } from "react-router";

import { supabase } from "../../lib/supabaseClient";
import { useNotification } from "../../context/NotificationContext";
import Layout from "../../components/Layout";
import styles from "./Auth.module.css";
import authBack from "../../images/authback.png";
import googleIcon from "../../images/google.png";
import kakaoIcon from "../../images/kakao.png";

const foodCategories = [
  "한식",
  "매운 음식",
  "양식",
  "간편식",
  "중식",
  "일식",
  "디저트",
  "다이어트",
];

export default function SignUp() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [nickname, setNickname] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);

  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const isProcessing = loading || Boolean(socialLoading);

  function handleCategoryToggle(category) {
    setSelectedCategories(previousCategories => {
      if (previousCategories.includes(category)) {
        return previousCategories.filter(item => item !== category);
      }

      return [...previousCategories, category];
    });
  }

  function validateForm() {
    if (!email.trim()) {
      return "이메일을 입력해주세요.";
    }

    if (!password) {
      return "비밀번호를 입력해주세요.";
    }

    if (password.length < 6) {
      return "비밀번호는 6자 이상 입력해주세요.";
    }

    if (!passwordConfirm) {
      return "비밀번호 확인을 입력해주세요.";
    }

    if (password !== passwordConfirm) {
      return "비밀번호가 일치하지 않습니다.";
    }

    if (!nickname.trim()) {
      return "닉네임을 입력해주세요.";
    }

    if (selectedCategories.length === 0) {
      return "좋아하는 음식 종류를 하나 이상 선택해주세요.";
    }

    return "";
  }

  async function handleEmailSignUp(event) {
    event.preventDefault();
    setErrorMessage("");

    const validationMessage = validateForm();

    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            nickname: nickname.trim(),
            food_categories: selectedCategories,
          },
        },
      });

      if (error) {
        throw error;
      }

      /*
       * Confirm email을 OFF로 설정하면
       * 회원가입과 동시에 로그인 세션이 생성된다.
       */
      if (!data.session) {
        throw new Error(
          "로그인 세션이 생성되지 않았습니다. Supabase에서 Confirm email 설정을 꺼주세요.",
        );
      }

      showNotification("회원가입이 완료되었습니다.", "success");
      navigate("/");
    } catch (error) {
      console.error("이메일 회원가입 오류:", error);

      const message = error.message?.toLowerCase() ?? "";

      if (
        message.includes("already registered") ||
        message.includes("already been registered") ||
        message.includes("user already registered")
      ) {
        setErrorMessage("이미 가입된 이메일입니다.");
      } else if (message.includes("password")) {
        setErrorMessage("비밀번호는 6자 이상 입력해주세요.");
      } else {
        setErrorMessage(error.message || "회원가입에 실패했습니다.");
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

  return (
    <Layout>
      <main className={styles.authPage}>
        <section className={`${styles.authCard} ${styles.signupCard}`}>
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
              <h1 className="font-display dtext-2xl">회원가입</h1>

              <p className={`text-sm ${styles.description}`}>
                몇 가지만 입력하면 시작할 수 있어요.
              </p>
            </div>

            <form className={styles.form} onSubmit={handleEmailSignUp}>
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
                <span className="text-sm">비밀번호</span>

                <input
                  className="text-sm"
                  type="password"
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  placeholder="6자 이상 입력해주세요"
                  autoComplete="new-password"
                  disabled={isProcessing}
                />
              </label>

              <label className={styles.field}>
                <span className="text-sm">비밀번호 확인</span>

                <input
                  className="text-sm"
                  type="password"
                  value={passwordConfirm}
                  onChange={event => setPasswordConfirm(event.target.value)}
                  placeholder="비밀번호를 다시 입력해주세요"
                  autoComplete="new-password"
                  disabled={isProcessing}
                />
              </label>

              <label className={styles.field}>
                <span className="text-sm">닉네임</span>

                <input
                  className="text-sm"
                  type="text"
                  value={nickname}
                  onChange={event => setNickname(event.target.value)}
                  placeholder="달콤한 아침"
                  autoComplete="nickname"
                  maxLength={20}
                  disabled={isProcessing}
                />
              </label>

              <fieldset className={styles.preferenceField} disabled={isProcessing}>
                <legend className="text-sm">좋아하는 음식 종류를 선택해주세요.</legend>

                <div className={styles.chips}>
                  {foodCategories.map(category => {
                    const isSelected = selectedCategories.includes(category);

                    return (
                      <button
                        key={category}
                        type="button"
                        className={`text-sm ${styles.chip} ${
                          isSelected ? styles.selectedChip : ""
                        }`}
                        onClick={() => handleCategoryToggle(category)}
                        aria-pressed={isSelected}
                      >
                        {category}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

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
                {loading ? "가입 중..." : "회원가입"}
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
              이미 계정이 있으신가요?{" "}
              <Link to="/login" className={styles.textLink}>
                로그인
              </Link>
            </p>
          </div>
        </section>
      </main>
    </Layout>
  );
}
