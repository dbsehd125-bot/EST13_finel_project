import { supabase } from "../../lib/supabaseClient";

import { Link } from "react-router";
import Layout from "../../components/Layout";
import styles from "./Auth.module.css";
import authBack from "../../images/authback.png";
import googleIcon from "../../images/google.png";
import kakaoIcon from "../../images/kakao.png";

export default function Login() {
  async function handleSocialLogin(provider) {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      console.error(`${provider} 로그인 오류:`, error);
      alert("소셜 로그인에 실패했습니다.");
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

            <form className={styles.form} onSubmit={event => event.preventDefault()}>
              <label className={styles.field}>
                <span className="text-sm">이메일</span>
                <input className="text-sm" type="email" placeholder="you@example.com" />
              </label>

              <label className={styles.field}>
                <div className={styles.labelRow}>
                  <span className="text-sm">비밀번호</span>

                  <button type="button" className={`text-s ${styles.textLink}`}>
                    비밀번호를 잊으셨나요?
                  </button>
                </div>

                <input className="text-sm" type="password" placeholder="••••••••" />
              </label>

              <button type="submit" className={`text-button ${styles.primaryButton}`}>
                로그인
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
              >
                <img className={styles.icon} src={googleIcon} alt="Google" />

                <span className={styles.desktopSocialText}>Google로 계속하기</span>

                <span className={styles.mobileSocialText}>Google</span>
              </button>

              <button
                type="button"
                className={`text-sm ${styles.socialButton} ${styles.kakaoButton}`}
                onClick={() => handleSocialLogin("kakao")}
              >
                <img className={styles.icon} src={kakaoIcon} alt="Kakao" />

                <span className={styles.desktopSocialText}>Kakao로 계속하기</span>

                <span className={styles.mobileSocialText}>Kakao</span>
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
      </main>
    </Layout>
  );
}
