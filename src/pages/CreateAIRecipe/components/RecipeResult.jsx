import React from 'react';
import RecipeResultCard from '../RecipeResultCard';
import styles from '../CreateAIRecipe.module.css';

export default function RecipeResult({
  result,
  isPublishing,
  handlePublish,
  refinePrompt,
  setRefinePrompt,
  handleRefineSubmit,
  handleGenerateRecipe,
}) {
  if (!result) {
    return (
      <div className={styles.emptyView}>
        <div className={styles.emptyIconBadge}>
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--brand-ai)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        </div>
        <p className="text-lg" style={{ fontWeight: 600, color: 'var(--brand-brown)', marginBottom: '6px' }}>
          여기에 생성된 레시피가 나타나요.
        </p>
        <p className="text-sm" style={{ color: 'var(--brand-gray)' }}>
          왼쪽 내용을 입력하고 만들기를 눌러보세요.
        </p>
      </div>
    );
  }

  return (
    <RecipeResultCard result={result}>
      {/* 하단 액션 버튼 바 */}
      <div className={styles.resultActionBar}>
        <div className={styles.leftIcons}>
          <button
            type="button"
            className={styles.iconCircleBtn}
            title="다시 생성"
            onClick={handleGenerateRecipe}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21.5 2v6h-6" />
              <path d="M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
          </button>
          <button
            type="button"
            className={styles.iconCircleBtn}
            title="복사하기"
            onClick={() => {
              if (result?.markdown) {
                navigator.clipboard.writeText(result.markdown);
                alert('레시피가 클립보드에 복사되었습니다.');
              }
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </button>
        </div>

        <button
          type="button"
          className={styles.publishBtn}
          onClick={handlePublish}
          disabled={isPublishing}
          style={{
            cursor: isPublishing ? 'not-allowed' : 'pointer',
            opacity: isPublishing ? 0.7 : 1,
          }}
        >
          {isPublishing ? '게시 중...' : '🚀 게시하기'}
        </button>
      </div>

      {/* 추가 수정 프롬프트 입력창 */}
      <form className={styles.refineInputWrapper} onSubmit={handleRefineSubmit}>
        <input
          type="text"
          className={styles.refineInput}
          placeholder="수정할 내용이나 추가 요청사항을 입력하세요..."
          value={refinePrompt}
          onChange={(e) => setRefinePrompt(e.target.value)}
        />
        <button type="submit" className={styles.refineSendBtn} aria-label="수정 요청">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>
    </RecipeResultCard>
  );
}
