/**
 * Auth 공통 비주얼 영역 컴포넌트
 * - 로그인/회원가입/비밀번호 재설정 화면의 왼쪽 이미지 영역 공통 처리
 * - 서비스 로고와 슬로건 UI를 한 곳에서 관리
 */
import authBack from "../../../images/authback.png";
import styles from "../Auth.module.css";

export default function AuthVisual() {
  return (
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
  );
}
