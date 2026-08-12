/**
 * 비밀번호 재설정 이메일 요청 모달
 * - 로그인 화면에서 가입 이메일 입력을 받아 재설정 메일 요청
 * - 전송 상태와 결과 메시지 표시
 * - 모달 바깥 영역 또는 닫기 버튼으로 종료
 */
import styles from "../Auth.module.css";

export default function PasswordResetModal({
  open,
  email,
  loading,
  message,
  onEmailChange,
  onSubmit,
  onClose,
}) {
  if (!open) return null;

  function handleBackdropClick() {
    if (!loading) onClose();
  }

  return (
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
      onClick={handleBackdropClick}
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

            <p className="text-sm" style={{ margin: "8px 0 0", color: "#777" }}>
              가입한 이메일로 비밀번호 재설정 링크를 보내드릴게요.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              border: 0,
              background: "transparent",
              fontSize: "24px",
              cursor: "pointer",
            }}
            aria-label="비밀번호 찾기 모달 닫기"
          >
            ×
          </button>
        </div>

        <label style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <span className="text-sm">이메일</span>

          <input
            className="text-sm"
            type="email"
            value={email}
            onChange={event => onEmailChange(event.target.value)}
            placeholder="you@example.com"
            disabled={loading}
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
          role="status"
          aria-live="polite"
        >
          {message}
        </div>

        <button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          className={`text-button ${styles.primaryButton}`}
          style={{ width: "100%", marginTop: "12px" }}
        >
          {loading ? "전송 중..." : "재설정 메일 보내기"}
        </button>
      </div>
    </div>
  );
}
