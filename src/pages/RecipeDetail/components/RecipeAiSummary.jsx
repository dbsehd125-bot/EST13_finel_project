/**
 * AI 핵심 조리 과정 컴포넌트
 * - Alan AI가 요약한 단계별 핵심 조리 내용을 표시
 * - AI 요청 중에도 실제 조리 단계 개수만큼 공간을 유지해
 *   레이아웃 이동(CLS)을 줄임
 * - AI 실패 시 기존 단계 설명 fallback 표시
 */
import styles from "../RecipeDetail.module.css";

export default function RecipeAiSummary({
  recipe,
  aiStepSummaries,
  aiSummaryLoading,
  aiSummaryError,
}) {
  if (!recipe.steps?.length) {
    return null;
  }

  /**
   * AI 요약 데이터가 있으면 해당 데이터를 사용하고,
   * 없으면 기존 레시피 단계 설명을 fallback으로 사용한다.
   *
   * 로딩 중에도 단계 개수를 동일하게 유지함으로써
   * AI 완료 후 박스 높이가 갑자기 늘어나는 현상을 줄인다.
   */
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

      <ol>
        {summaries.map(step => (
          <li key={`summary-${step.step}`} className="text-sm">
            <span className="text-s">{step.step}</span>

            <p>
              {aiSummaryLoading && aiStepSummaries.length === 0
                ? step.summary || "조리 과정을 정리하고 있습니다."
                : step.summary}
            </p>
          </li>
        ))}
      </ol>

      {aiSummaryError && (
        <p className={`text-s ${styles.aiSummaryNotice}`}>
          AI 요약을 불러오지 못해 기존 조리 설명을 표시하고 있습니다.
        </p>
      )}
    </section>
  );
}
