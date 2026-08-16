import React from 'react';
import styles from '../RegistRecipe.module.css';

export default function Step3Steps({ cookingSteps, handleTipChange, handleResetTip }) {
  return (
    <div className={styles.stepContent}>
      {/* 폼 제목 */}
      <div className={styles.stepTitle}>
        <h3 className="text-xl" style={{ fontWeight: 600, color: 'var(--brand-brown)' }}>
          🍳 3단계: 조리 과정 등록
        </h3>
        <p className="text-m" style={{ color: 'var(--brand-gray)', marginTop: '8px' }}>
          AI가 생성한 조리 순서를 확인하고, 각 단계별로 나만의 노하우나 조리 팁을 남겨보세요.
        </p>
      </div>

      <div className={styles.titleDivider} />

      {/* 조리 단계 카드 목록 */}
      <div className={styles.cookingStepsContainer}>
        {cookingSteps.map((step, idx) => (
          <div key={step.stepNumber} className={styles.stepCardItem}>
            {/* 단계 번호 배지 & 라벨 헤더 */}
            <div className={styles.stepHeaderRow}>
              <span className={styles.stepNumberBadge}>STEP {step.step}</span>
              {/* <span className={styles.readOnlyBadge}>🔒 Read Only</span> */}
            </div>

            {/* 조리 과정 내용 (ReadOnly) */}
            <div className={styles.inputGroup} style={{ marginBottom: '14px' }}>
              <textarea className={styles.readOnlyTextarea} value={step.description} readOnly rows={2} />
            </div>

            {/* 단계별 조리 팁 입력 필드 (Nullable) */}
            <div className={styles.inputGroup}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label className={styles.tipInputLabel}>
                  💡 나만의 조리 팁 <span className={styles.optionalTag}>(선택)</span>
                </label>

                {/* Tip 초기화 버튼 */}
                <button
                  type="button"
                  onClick={() => handleResetTip(idx)}
                  disabled={!step.tip}
                  style={{
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: step.tip ? 'var(--brand-primary, #f05a24)' : '#ccc',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: step.tip ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 6px',
                  }}
                  title="팁 내용 초기화"
                >
                  <span>❌</span>
                  <span>삭제</span>
                </button>
              </div>

              {/* <input
                  type="text"
                  className={styles.textInput}
                  value={step.tip || ''}
                  onChange={(e) => handleTipChange(idx, e.target.value)}
                  placeholder="예: 불 조절이나 대체재 정보, 맛있게 만드는 꿀팁을 적어주세요."
                /> */}
              <textarea
                className={styles.textareaInput}
                value={step.tip || ''}
                onChange={(e) => handleTipChange(idx, e.target.value)}
                placeholder="예: 불 조절이나 대체재 정보, 맛있게 만드는 꿀팁을 적어주세요."
                rows={2}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
