import React from 'react';
import styles from '../RegistRecipe.module.css';

export default function Step2Ingredients({ ingredients, handleItemChange }) {
  return (
    <div className={styles.stepContent}>
      {/* 폼 제목 */}
      <div className={styles.stepTitle}>
        <h3 className="text-xl" style={{ fontWeight: 600, color: 'var(--brand-brown)' }}>
          🥕 2단계: 재료 목록 입력
        </h3>
        <p className="text-m" style={{ color: 'var(--brand-gray)', marginTop: '8px' }}>
          AI가 생성한 필요 재료를 확인하고, 대체 가능한 재료가 있다면 기입해 주세요.
        </p>
      </div>

      <div className={styles.titleDivider} />

      {/* 단일 '재료 목록' 카드 */}
      <div className={styles.groupCard}>
        <div className={styles.groupHeaderRow}>
          <div className={styles.groupTitleBadgeWrapper}>
            <span className={styles.groupTitleBadge}>재료 목록</span>
          </div>
        </div>

        {/* 테이블 헤더 (삭제 컬럼 제거) */}
        <div className={styles.ingredientTableHeader}>
          <span style={{ flex: 1 }}>재료명</span>
          <div className={styles.tableHeaderRight}>
            <span style={{ width: '100px', textAlign: 'center' }}>대체 가능</span>
          </div>
        </div>

        {/* 재료 행 목록 */}
        <div className={styles.ingredientRowsContainer}>
          {ingredients.map((item) => (
            <React.Fragment key={item.id}>
              {/* 재료 행 */}
              <div className={styles.ingredientRow}>
                {/* 1. 재료명 입력창 */}
                <div style={{ flex: 1, position: 'relative' }}>
                  <input
                    type="text"
                    className={styles.textInputWithIcon}
                    value={item.name}
                    onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                    placeholder="예: 닭가슴살"
                    readOnly
                  />
                </div>

                {/* 2. 대체 가능 여부 체크박스 */}
                <div style={{ width: '100px', display: 'flex', justifyContent: 'center' }}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={item.isSubstitutable}
                      onChange={(e) => handleItemChange(item.id, 'isSubstitutable', e.target.checked)}
                    />
                  </label>
                </div>
              </div>

              {/* 3. 개별 isSubstitutable 체크 시만 표시되는 대체 재료 입력 필드 */}
              {item.isSubstitutable && (
                <div
                  className={styles.substituteRow}
                  style={{
                    display: 'flex',
                    flex: '1',
                    alignItems: 'center',
                    borderRadius: '12px',
                    padding: '8px 12px',
                    marginLeft: '16px',
                    marginRight: '100px',
                    marginTop: '-20px',
                  }}
                >
                  <span
                    style={{
                      marginRight: '8px',
                      color: 'var(--brand-primary, #f05a24)',
                      fontWeight: 'bold',
                    }}
                  >
                    ↳
                  </span>
                  <input
                    type="text"
                    className={styles.substituteInput}
                    style={{ flex: 1, backgroundColor: '#fff' }}
                    value={item.substituteName}
                    onChange={(e) => handleItemChange(item.id, 'substituteName', e.target.value)}
                    placeholder="대체 가능한 재료를 입력하세요."
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
