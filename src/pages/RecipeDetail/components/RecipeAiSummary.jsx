/**
 * AI 핵심 조리 과정 컴포넌트
 * - Alan AI가 요약한 단계별 핵심 조리 내용을 표시
 * - AI 요청 중 로딩 상태와 실패 시 기존 단계 설명 fallback 표시
 */
import styles from "../RecipeDetail.module.css";

export default function RecipeAiSummary({
  recipe,
  aiStepSummaries,
  aiSummaryLoading,
  aiSummaryError,
}) {
  if (!recipe.steps?.length) return null;

  const summaries =
    aiStepSummaries.length > 0
      ? aiStepSummaries
      : recipe.steps.map(step => ({
          step: step.step,
          summary: step.description?.trim() || step.title || "",
        }));

  return (
    <section className={styles.aiSummary}>
      <div className={styles.aiSummaryHeader}>
        <h2 className="text-lg">✨ AI가 정리한 핵심 조리 과정</h2>
        {aiSummaryLoading && <span className="text-s">AI 요약 중...</span>}
      </div>

      {aiSummaryLoading && aiStepSummaries.length === 0 ? (
        <p className={`text-sm ${styles.aiSummaryLoading}`}>
          조리 과정을 간단하게 정리하고 있습니다.
        </p>
      ) : (
        <ol>
          {summaries.map(step => (
            <li key={`summary-${step.step}`} className="text-sm">
              <span className="text-s">{step.step}</span>
              <p>{step.summary}</p>
            </li>
          ))}
        </ol>
      )}

      {aiSummaryError && (
        <p className={`text-s ${styles.aiSummaryNotice}`}>
          AI 요약을 불러오지 못해 기존 조리 설명을 표시하고 있습니다.
        </p>
      )}
    </section>
  );
}
