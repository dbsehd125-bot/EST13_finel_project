import React from 'react';
import styles from '../CreateAIRecipe.module.css';

export default function RecipeInputForm({
  prompt,
  setPrompt,
  ingredients,
  newIngredient,
  setNewIngredient,
  isAddingIngredientTag,
  setIsAddingIngredientTag,
  handleAddIngredient,
  handleRemoveIngredient,
  excluded,
  newExcluded,
  setNewExcluded,
  isAddingExcludedTag,
  setIsAddingExcludedTag,
  handleAddExcluded,
  handleRemoveExcluded,
  conditions,
  handleConditionChange,
  options,
  handleOptionToggle,
  openSelects,
  toggleSelect,
  closeSelect,
  loadingStep,
  onSubmit,
}) {
  return (
    <form className={styles.formSection} onSubmit={onSubmit}>
      {/* Step 1: 무엇을 만들고 싶나요? */}
      <div className={styles.stepCard}>
        <div className={styles.stepTitleRow}>
          <span className={styles.stepBadge}>1</span>
          <h3 className="text-lg" style={{ fontWeight: 600, color: 'var(--brand-brown)' }}>
            무작정 요리 생각하기
          </h3>
        </div>
        <textarea
          className={styles.promptInput}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="만들고 싶은 요리나 상황을 자유롭게 설명해주세요."
          rows={2}
        />
      </div>

      {/* Step 2: 보유 재료 */}
      <div className={styles.stepCard}>
        <div className={styles.stepTitleRow}>
          <span className={styles.stepBadge}>2</span>
          <h3 className="text-lg" style={{ fontWeight: 600, color: 'var(--brand-brown)' }}>
            보유 재료
          </h3>
        </div>
        <div className={styles.tagList}>
          {ingredients.map((tag) => (
            <span key={tag} className={styles.tagChip}>
              {tag}
              <button type="button" className={styles.tagDeleteBtn} onClick={() => handleRemoveIngredient(tag)}>
                ✕
              </button>
            </span>
          ))}

          {isAddingIngredientTag ? (
            <div className={styles.addTagInputWrapper}>
              <input
                type="text"
                className={styles.addTagInput}
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddIngredient())}
                placeholder="재료명"
                autoFocus
              />
              <button type="button" className={styles.addTagConfirmBtn} onClick={handleAddIngredient}>
                추가
              </button>
            </div>
          ) : (
            <button type="button" className={styles.addTagBtn} onClick={() => setIsAddingIngredientTag(true)}>
              재료 추가 +
            </button>
          )}
        </div>
      </div>

      {/* Step 3: 조건 선택 */}
      <div className={styles.stepCard}>
        <div className={styles.stepTitleRow}>
          <span className={styles.stepBadge}>3</span>
          <h3 className="text-lg" style={{ fontWeight: 600, color: 'var(--brand-brown)' }}>
            조건 선택
          </h3>
        </div>
        <div className={styles.selectGrid}>
          <div className={styles.selectField}>
            <label className="text-sm" style={{ color: 'var(--brand-gray)', marginBottom: '4px' }}>
              인분
            </label>
            <div>
              <select
                className={styles.selectBox}
                value={conditions.servings}
                onClick={() => toggleSelect('servings')}
                onBlur={() => closeSelect('servings')}
                onChange={(e) => {
                  handleConditionChange('servings', e.target.value);
                  closeSelect('servings');
                }}
              >
                <option>1인분</option>
                <option>2인분</option>
                <option>3~4인분</option>
                <option>5인분 이상</option>
              </select>
              <span className={`${styles.selectArrow} ${openSelects.servings ? styles.selectArrowOpen : ''}`}>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
            </div>
          </div>

          <div className={styles.selectField}>
            <label className="text-sm" style={{ color: 'var(--brand-gray)', marginBottom: '4px' }}>
              조리 시간
            </label>
            <div>
              <select
                className={styles.selectBox}
                value={conditions.cookingTime}
                onClick={() => toggleSelect('cookingTime')}
                onBlur={() => closeSelect('cookingTime')}
                onChange={(e) => {
                  handleConditionChange('cookingTime', e.target.value);
                  closeSelect('cookingTime');
                }}
              >
                <option>10분 이내</option>
                <option>15분 이내</option>
                <option>30분 이내</option>
                <option>1시간 이내</option>
              </select>
              <span className={`${styles.selectArrow} ${openSelects.cookingTime ? styles.selectArrowOpen : ''}`}>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
            </div>
          </div>

          <div className={styles.selectField}>
            <label className="text-sm" style={{ color: 'var(--brand-gray)', marginBottom: '4px' }}>
              난이도
            </label>
            <div>
              <select
                className={styles.selectBox}
                value={conditions.difficulty}
                onClick={() => toggleSelect('difficulty')}
                onBlur={() => closeSelect('difficulty')}
                onChange={(e) => {
                  handleConditionChange('difficulty', e.target.value);
                  closeSelect('difficulty');
                }}
              >
                <option>초간단</option>
                <option>쉬움</option>
                <option>보통</option>
                <option>어려움</option>
              </select>
              <span className={`${styles.selectArrow} ${openSelects.difficulty ? styles.selectArrowOpen : ''}`}>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
            </div>
          </div>

          <div className={styles.selectField}>
            <label className="text-sm" style={{ color: 'var(--brand-gray)', marginBottom: '4px' }}>
              음식 종류
            </label>
            <div>
              <select
                className={styles.selectBox}
                value={conditions.cuisine}
                onClick={() => toggleSelect('cuisine')}
                onBlur={() => closeSelect('cuisine')}
                onChange={(e) => {
                  handleConditionChange('cuisine', e.target.value);
                  closeSelect('cuisine');
                }}
              >
                <option>한식</option>
                <option>양식</option>
                <option>일식</option>
                <option>중식</option>
                <option>퓨전/기타</option>
              </select>
              <span className={`${styles.selectArrow} ${openSelects.cuisine ? styles.selectArrowOpen : ''}`}>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
            </div>
          </div>
        </div>

        {/* 제외시킬 재료 */}
        <div>
          <div style={{ paddingTop: '20px', paddingBottom: '16px' }}>
            <label className="text-sm" style={{ color: 'var(--brand-gray)' }}>
              🚫 제외시킬 재료
            </label>
          </div>
          <div className={styles.tagList}>
            {excluded.map((tag) => (
              <span key={tag} className={styles.tagChip}>
                {tag}
                <button type="button" className={styles.tagDeleteBtn} onClick={() => handleRemoveExcluded(tag)}>
                  ✕
                </button>
              </span>
            ))}

            {isAddingExcludedTag ? (
              <div className={styles.addTagInputWrapper}>
                <input
                  type="text"
                  className={styles.addTagInput}
                  value={newExcluded}
                  onChange={(e) => setNewExcluded(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddExcluded())}
                  placeholder="재료명"
                />
                <button type="button" className={styles.addTagConfirmBtn} onClick={handleAddExcluded}>
                  추가
                </button>
              </div>
            ) : (
              <button type="button" className={styles.addTagBtn} onClick={() => setIsAddingExcludedTag(true)}>
                재료 추가 +
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Step 4: 결과 생성 옵션 */}
      <div className={styles.stepCard}>
        <div className={styles.stepTitleRow}>
          <span className={styles.stepBadge}>4</span>
          <h3 className="text-lg" style={{ fontWeight: 600, color: 'var(--brand-brown)' }}>
            결과 생성 옵션
          </h3>
        </div>
        <div className={styles.optionsGrid}>
          <label className={styles.checkboxItem}>
            <input type="checkbox" checked={options.image} onChange={() => handleOptionToggle('image')} />
            <span>단계별 이미지 생성 ⚠️</span>
          </label>

          <label className={styles.checkboxItem}>
            <input
              type="checkbox"
              checked={options.substitutes}
              onChange={() => handleOptionToggle('substitutes')}
            />
            <span>대체 재료 추천</span>
          </label>

          <label className={styles.checkboxItem}>
            <input
              type="checkbox"
              checked={options.shoppinglist}
              onChange={() => handleOptionToggle('shoppinglist')}
            />
            <span>장보기 목록 생성</span>
          </label>
        </div>
      </div>

      {/* 생성하기 버튼 */}
      <button type="submit" className={styles.submitBtn} disabled={loadingStep}>
        {loadingStep ? '✨ AI가 레시피를 구상 중입니다...' : '🪄 나만의 레시피 만들기'}
      </button>
    </form>
  );
}
