import React from 'react';
import styles from '../RegistRecipe.module.css';

export default function Step5Options({ formData, options, handleOptionChange }) {
  return (
    <div className={styles.stepContent}>
      {/* 폼 제목 */}
      <div className={styles.stepTitle}>
        <h3 className="text-xl" style={{ fontWeight: 600, color: 'var(--brand-brown)' }}>
          👁️ 5단계: 레시피 최종 확인 및 공개 설정
        </h3>
        <p className="text-m" style={{ color: 'var(--brand-gray)', marginTop: '8px' }}>
          완성된 레시피를 최종 확인하고 공개 범위 및 참여 옵션을 설정한 뒤 등록해 주세요.
        </p>
      </div>

      <div className={styles.titleDivider} />

      {/* 2컬럼 레이아웃: (좌) 미리보기 완본 카드 | (우) 공개/옵션 설정 패널 */}
      <div className={styles.previewSplitLayout}>
        {/* 왼쪽: 레시피 완본 미리보기 카드 */}
        <div className={styles.previewCardContainer}>
          <div className={styles.previewCardHeader}>
            <span className={styles.previewBadge}>✨미리보기</span>
            <h2 className={styles.previewTitle}>{formData.title || '제목 없음'}</h2>
            <p className={styles.previewDescription}>{formData.description}</p>
          </div>

          {/* 대표 썸네일 */}
          {formData.thumbnail_url && (
            <div className={styles.previewImageWrapper}>
              <img src={formData.thumbnail_url} alt="대표 요리 이미지" className={styles.previewImage} />
            </div>
          )}

          {/* 메타 정보 칩 (카테고리, 시간, 난이도, 인분) */}
          <div className={styles.previewMetaRow}>
            <span>🏷️ {formData.category}</span>
            <span>⏱️ {formData.cookingTime}</span>
            <span>🔥 {formData.difficulty}</span>
            <span>👥 {formData.servings}</span>
          </div>

          {/* 재료 리스트 요약 */}
          <div className={styles.previewSectionBox}>
            <h4 className={styles.previewSectionTitle}>🥕 필요 재료</h4>
            {formData.ingredients && formData.ingredients.length > 0 ? (
              <div className={styles.previewIngredientText}>
                {formData.ingredients.map((item, idx) => {
                  // 문자열 형태 데이터와 객체 형태 데이터 모두 안전하게 처리
                  const itemName = typeof item === 'string' ? item : item.name;

                  return (
                    <span key={item.id || idx} className={styles.ingredientChip}>
                      {itemName}
                      {idx < formData.ingredients.length - 1 ? ', ' : ''}
                    </span>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: 'var(--brand-gray)', fontSize: '14px' }}>등록된 재료가 없습니다.</p>
            )}
          </div>

          {/* 조리 단계 요약 */}
          <div className={styles.previewSectionBox}>
            <h4 className={styles.previewSectionTitle} style={{ marginBottom: '20px' }}>
              🍳 조리 순서
            </h4>
            <div className={styles.panelDivider}></div>
            <div className={styles.previewStepsList}>
              {formData.cookingSteps?.map((step) => (
                <div key={step.step} className={styles.previewStepItem}>
                  <span className={styles.previewStepNum}>{step.step}</span>
                  <div className={styles.previewStepBody}>
                    <p>{step.description}</p>
                    {step.tip && <p className={styles.previewStepTip}>💡 {step.tip}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 오른쪽: 공개 범위 및 설정 옵션 패널 */}
        <div className={styles.optionsPanel}>
          {/* <h4 className={styles.optionsPanelTitle}>🔒 공개 설정</h4> */}

          {/* 1. 공개 범위 선택 (전체 공개 / 비공개) */}
          <div className={styles.optionGroup}>
            <label className={styles.optionLabel}>공개 범위</label>
            <div className={styles.radioGroup}>
              <label className={styles.radioCard}>
                <input
                  type="radio"
                  name="isPublic"
                  checked={options.isPublic === true}
                  onChange={() => handleOptionChange('isPublic', true)}
                />
                <div>
                  <strong>🌐 전체 공개</strong>
                  <p>모든 사용자가 이 레시피를 조회하고 검색할 수 있습니다.</p>
                </div>
              </label>

              <label className={styles.radioCard}>
                <input
                  type="radio"
                  name="isPublic"
                  checked={options.isPublic === false}
                  onChange={() => handleOptionChange('isPublic', false)}
                />
                <div>
                  <strong>🔒 비공개</strong>
                  <p>나의 개인 레시피 보관함에만 저장됩니다.</p>
                </div>
              </label>
            </div>
          </div>

          <div className={styles.panelDivider} />

          {/* 2. 추가 옵션 체크박스 */}
          <div className={styles.optionGroup}>
            <label className={styles.optionLabel}>추가 옵션</label>
            <div className={styles.checkboxList}>
              <label className={styles.checkboxCard}>
                <input
                  type="checkbox"
                  checked={options.allowAiRecommendation}
                  onChange={(e) => handleOptionChange('allowAiRecommendation', e.target.checked)}
                />
                <div>
                  <strong>🤖 AI 추천 항목 허용</strong>
                  <p>다른 사용자의 AI 주간 식단 및 연관 추천 항목에 이 레시피가 포함될 수 있습니다.</p>
                </div>
              </label>

              <label className={styles.checkboxCard}>
                <input
                  type="checkbox"
                  checked={options.allowCommentsAndReviews}
                  onChange={(e) => handleOptionChange('allowCommentsAndReviews', e.target.checked)}
                />
                <div>
                  <strong>💬 댓글 허용</strong>
                  <p>다른 사용자들이 레시피에 댓글을 작성할 수 있도록 합니다.</p>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
