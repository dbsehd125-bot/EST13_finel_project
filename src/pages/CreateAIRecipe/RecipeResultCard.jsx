import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './RecipeResultCard.module.css';

export default function RecipeResultCard({ result, children }) {
  if (!result) return null;

  return (
    <div className={styles.resultView}>
      {/* 헤더 타이틀 */}
      <div className={styles.resultTitleRow}>
        <span className={styles.sparkleIcon}>✨</span>
        <h2 className="font-display dtext-2xl" style={{ fontWeight: 600 }}>
          완성된 나만의 레시피
        </h2>
      </div>

      {/* 대표 요리 이미지 */}
      {result.thumbnail && (
        <div className={styles.recipeImageWrapper}>
          <img src={result.thumbnail} alt="생성된 요리 이미지" className={styles.recipeImage} />
        </div>
      )}

      {/* 크림색 배경 마크다운 본문 박스 */}
      <div className={styles.markdownCardBox}>
        <div className={styles.markdownContent}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.markdown}</ReactMarkdown>
        </div>

        {/* 하단 액션 영역이 존재할 경우만 구분선 및 children 출력 */}
        {children && (
          <>
            <div className={styles.cardDivider} />
            {children}
          </>
        )}
      </div>
    </div>
  );
}
