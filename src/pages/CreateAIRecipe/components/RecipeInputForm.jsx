import React, { useRef } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
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
  isSummaryModalOpen,
  setIsSummaryModalOpen,
  handleCloseSummaryModal,
  handleBypassAndGenerate,
  onSubmit,
}) {
  const summaryInputRef = useRef(null);

  return (
    <>
      <form className={styles.formSection} onSubmit={onSubmit}>
        {/* Step 1: 무엇을 만들고 싶나요? */}
        <div className={styles.stepCard}>
          <div className={styles.stepTitleRow}>
            <span className={styles.stepBadge}>1</span>
            <h2 className="text-lg" style={{ fontWeight: 600, color: 'var(--brand-brown)' }}>
              무작정 요리 생각하기
            </h2>
          </div>
          <textarea
            className={styles.promptInput}
            ref={summaryInputRef}
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
            <h2 className="text-lg" style={{ fontWeight: 600, color: 'var(--brand-brown)' }}>
              보유 재료
            </h2>
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
            <h2 className="text-lg" style={{ fontWeight: 600, color: 'var(--brand-brown)' }}>
              조건 선택
            </h2>
          </div>
          <div className={styles.selectGrid}>
            <div className={styles.selectField}>
              <label
                htmlFor="servings-select"
                className="text-sm"
                style={{ color: 'var(--brand-gray)', marginBottom: '4px' }}
              >
                분량
              </label>
              <div>
                <select
                  id="servings-select"
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
              <label
                htmlFor="cooking-time-select"
                className="text-sm"
                style={{ color: 'var(--brand-gray)', marginBottom: '4px' }}
              >
                조리 시간
              </label>
              <div>
                <select
                  id="cooking-time-select"
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
                  <option>30분 이내</option>
                  <option>1시간 이내</option>
                  <option>시간제한 없음</option>
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
              <label
                htmlFor="difficulty-select"
                className="text-sm"
                style={{ color: 'var(--brand-gray)', marginBottom: '4px' }}
              >
                난이도
              </label>
              <div>
                <select
                  id="difficulty-select"
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
              <label
                htmlFor="cuisine-select"
                className="text-sm"
                style={{ color: 'var(--brand-gray)', marginBottom: '4px' }}
              >
                음식 종류
              </label>
              <div>
                <select
                  id="cuisine-select"
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
                  <option>분식</option>
                  <option>디저트</option>
                  <option>야식</option>
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

            <div className={styles.selectField}>
              <label
                htmlFor="diet-goal-select"
                className="text-sm"
                style={{ color: 'var(--brand-gray)', marginBottom: '4px' }}
              >
                건강/식단
              </label>
              <div>
                <select
                  id="diet-goal-select"
                  className={styles.selectBox}
                  value={conditions.dietGoal}
                  onClick={() => toggleSelect('dietGoal')}
                  onBlur={() => closeSelect('dietGoal')}
                  onChange={(e) => {
                    handleConditionChange('dietGoal', e.target.value);
                    closeSelect('dietGoal');
                  }}
                >
                  <option>해당없음</option>
                  <option>다이어트</option>
                  <option>고단백</option>
                  <option>저탄수화물</option>
                  <option>비건</option>
                  <option>채식</option>
                  <option>글루텐 프리</option>
                  <option>저염식</option>
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
            <h2 className="text-lg" style={{ fontWeight: 600, color: 'var(--brand-brown)' }}>
              결과 생성 옵션
            </h2>
          </div>
          <div className={styles.optionsGrid}>
            <label className={styles.checkboxItem}>
              <input type="checkbox" checked={options.image} onChange={() => handleOptionToggle('image')} />
              <span>단계별 이미지 생성 ⚠️</span>
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

      {/* 🚨 Summary 미입력 안내 MUI 모달 */}
      <Dialog
        open={isSummaryModalOpen}
        onClose={() => handleCloseSummaryModal(summaryInputRef)} // 👈 3번 조건: 모달 밖 클릭 시 포커스
        aria-labelledby="summary-guide-dialog-title"
        aria-describedby="summary-guide-dialog-description"
        PaperProps={{
          style: {
            borderRadius: '16px',
            padding: '12px 8px',
            minWidth: '320px',
            maxWidth: '420px',
          },
        }}
      >
        <DialogTitle id="summary-guide-dialog-title" style={{ fontWeight: 600, color: '#333', textAlign: 'center' }}>
          💡 한 줄 설명을 작성해 보세요!
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id="summary-guide-dialog-description"
            style={{ color: '#666', lineHeight: '1.6', textAlign: 'center' }}
          >
            요리 요구사항이나 한 줄 설명을 작성해 주시면
            <br />
            <strong>훨씬 더 완성도 높은 AI 레시피</strong>를 생성할 수 있습니다.
            <br />
            <br />
            지금 입력 폼으로 이동하여 내용을 추가해 보시겠어요?
          </DialogContentText>
        </DialogContent>
        <DialogActions style={{ padding: '12px 24px 16px 24px', flexDirection: 'column', gap: '8px' }}>
          {/* 버튼 1: 확인 (포커스 이동) */}
          <Button
            onClick={() => handleCloseSummaryModal(summaryInputRef)} // 👈 1번 조건
            variant="contained"
            disableElevation
            fullWidth
            style={{
              backgroundColor: 'var(--brand-primary, #f05a24)',
              color: '#fff',
              fontWeight: 600,
              borderRadius: '8px',
              padding: '10px',
              margin: 0,
            }}
          >
            한 줄 설명 작성하기
          </Button>

          {/* 버튼 2: 무시하고 생성하기 */}
          <Button
            onClick={handleBypassAndGenerate} // 👈 2번 조건
            variant="outlined"
            fullWidth
            style={{
              borderColor: '#ccc',
              color: '#666',
              fontWeight: 600,
              borderRadius: '8px',
              padding: '10px',
              margin: 0,
            }}
          >
            무시하고 생성하기
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
