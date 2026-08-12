/**
 * 회원가입 페이지
 * - 이메일/비밀번호/닉네임 입력 및 유효성 검사
 * - 사용자의 음식 취향 선택 후 Supabase Auth metadata에 저장
 * - Google/Kakao 소셜 로그인 연결
 */
import { useState } from "react";
import { Link, useNavigate } from "react-router";

import { supabase } from "../../lib/supabaseClient";
import { useNotification } from "../../context/NotificationContext";
import Layout from "../../components/Layout";
import AuthVisual from "./components/AuthVisual";
import SocialLoginButtons from "./components/SocialLoginButtons";
import useSocialLogin from "./hooks/useSocialLogin";
import { FOOD_CATEGORIES } from "./authConstants";
import styles from "./Auth.module.css";

export default function SignUp() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [nickname, setNickname] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { socialLoading, handleSocialLogin } = useSocialLogin({
    onErrorClear: () => setErrorMessage(""),
    onError: setErrorMessage,
  });

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
    if (!email.trim()) return "이메일을 입력해주세요.";
    if (!password) return "비밀번호를 입력해주세요.";
    if (password.length < 6) return "비밀번호는 6자 이상 입력해주세요.";
    if (!passwordConfirm) return "비밀번호 확인을 입력해주세요.";
    if (password !== passwordConfirm) return "비밀번호가 일치하지 않습니다.";
    if (!nickname.trim()) return "닉네임을 입력해주세요.";
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

      if (error) throw error;

      // Confirm email이 꺼져 있으면 회원가입과 동시에 로그인 세션이 생성된다.
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

  return (
    <Layout>
      <main className={styles.authPage}>
        <section className={`${styles.authCard} ${styles.signupCard}`}>
          <AuthVisual />

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
                  {FOOD_CATEGORIES.map(category => {
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

            <SocialLoginButtons
              socialLoading={socialLoading}
              disabled={isProcessing}
              onSocialLogin={handleSocialLogin}
            />

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
