/**
 * 레시피 조리 과정 컴포넌트
 * - 레시피의 단계별 제목, 설명, 소요 시간, 이미지 표시
 * - 단계별 조리 팁이 있을 경우 함께 표시
 * - 이미지 유무와 단계 순서에 따라 기존 레이아웃 유지
 */
import { LightbulbOutlined } from "@mui/icons-material";

import styles from "../RecipeDetail.module.css";

export default function RecipeSteps({ steps }) {
  if (!steps?.length) {
    return null;
  }

  return (
    <section className={styles.processSection}>
      <h2 className={`font-display dtext-2xl ${styles.sectionTitle}`}>조리 과정</h2>

      <div className={styles.steps}>
        {steps.map((step, index) => (
          <article
            key={step.step}
            className={`
              ${styles.step}
              ${index % 2 === 1 ? styles.stepReverse : ""}
              ${!step.image ? styles.stepWithoutImage : ""}
            `}
          >
            {step.image && (
              <div className={styles.stepImageArea}>
                <img
                  className={styles.stepImage}
                  src={step.image}
                  alt={`${step.step}단계 ${step.title}`}
                  loading="lazy"
                  decoding="async"
                />
              </div>
            )}

            <div className={styles.stepContent}>
              <div className={styles.stepHeader}>
                <div className={styles.stepTitle}>
                  <span className="text-sm">{step.step}</span>

                  <h3 className="text-lg">{step.title}</h3>
                </div>

                {step.time && <span className={`text-s ${styles.stepTime}`}>{step.time}</span>}
              </div>

              <p className={`text-sm ${styles.stepDescription}`}>{step.description}</p>

              {step.tip && (
                <div className={styles.stepTip}>
                  <LightbulbOutlined fontSize="small" />

                  <span className="text-sm">{step.tip}</span>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
