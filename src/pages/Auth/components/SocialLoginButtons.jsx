/**
 * Auth 공통 소셜 로그인 버튼 컴포넌트
 * - Google/Kakao OAuth 로그인 버튼 UI 제공
 * - 현재 연결 중인 provider에 따라 로딩 문구 표시
 */
import googleIcon from "../../../images/google.png";
import kakaoIcon from "../../../images/kakao.png";

import styles from "../Auth.module.css";

export default function SocialLoginButtons({ socialLoading, disabled, onSocialLogin }) {
  return (
    <div className={styles.socialButtons} aria-label="소셜 로그인">
      <button
        type="button"
        className={`text-sm ${styles.socialButton}`}
        onClick={() => onSocialLogin("google")}
        disabled={disabled}
        aria-busy={socialLoading === "google"}
      >
        <img
          className={styles.icon}
          src={googleIcon}
          alt=""
          width="24"
          height="24"
          aria-hidden="true"
          decoding="async"
        />

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
        onClick={() => onSocialLogin("kakao")}
        disabled={disabled}
        aria-busy={socialLoading === "kakao"}
      >
        <img
          className={styles.icon}
          src={kakaoIcon}
          alt=""
          width="24"
          height="24"
          aria-hidden="true"
          decoding="async"
        />

        <span className={styles.desktopSocialText}>
          {socialLoading === "kakao" ? "Kakao 연결 중..." : "Kakao로 계속하기"}
        </span>

        <span className={styles.mobileSocialText}>
          {socialLoading === "kakao" ? "연결 중..." : "Kakao"}
        </span>
      </button>
    </div>
  );
}
