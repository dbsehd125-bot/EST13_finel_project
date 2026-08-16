// RegistRecipe.jsx
import React from 'react';
import Layout from '../../components/Layout';
import SEO from '../../components/SEO';
import styles from './RegistRecipe.module.css';
// Custom Hook
import { useRegistRecipe } from './hooks/useRegistRecipe';
// Separated step-by-step UI components
import Step1BasicInfo from './components/Step1BasicInfo';
import Step2Ingredients from './components/Step2Ingredients';
import Step3Steps from './components/Step3CookingSteps';
import Step4Image from './components/Step4Image';
import Step5Options from './components/Step5Options';
// Access Control Modal Component
import AccessGuardModal from './components/AccessGuardModal';

/* ==========================================================================
   Main RegistRecipe 페이지 컴포넌트
   ========================================================================== */
export default function RegistRecipe() {
  const {
    // [메인] RegistRecipe 전용
    currentStep,
    steps,
    formData,
    updateFormData,
    isLoadingPreset,
    isSaving,
    goToStep,
    isAccessModalOpen,
    handleLoadRecentDraft,
    handleGoToCreatePage,
    handleSaveDraft,
    handleFinalSubmit,

    // [Step 1] 기본 정보 입력 전용
    newTag,
    setNewTag,
    isAddingTag,
    setIsAddingTag,
    handleAddTag,
    handleRemoveTag,

    // [Step 2] 재료 목록 입력 전용
    ingredients,
    handleItemChange,

    // [Step 3] 조리 과정 입력 전용
    cookingSteps,
    handleTipChange,
    handleResetTip,

    // [Step 4] 이미지 확인 전용
    thumbnail,
    hasStepImages,
    stepGridItems,
    handleThumbnailChange,

    // [Step 5] 최종 미리보기 & 공개 옵션 전용
    options,
    handleOptionChange,
  } = useRegistRecipe();

  // 현재 단계별 서브 컴포넌트 렌더링 맵
  const renderStepComponent = () => {
    if (isLoadingPreset) {
      return (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--brand-gray)' }}>
          레시피 데이터를 불러오는 중입니다...
        </div>
      );
    }

    switch (currentStep) {
      case 2:
        return <Step2Ingredients ingredients={ingredients} handleItemChange={handleItemChange} />;
      case 3:
        return (
          <Step3Steps cookingSteps={cookingSteps} handleTipChange={handleTipChange} handleResetTip={handleResetTip} />
        );
      case 4:
        return (
          <Step4Image
            thumbnail={thumbnail}
            hasStepImages={hasStepImages}
            stepGridItems={stepGridItems}
            handleThumbnailChange={handleThumbnailChange}
          />
        );
      case 5:
        return <Step5Options formData={formData} options={options} handleOptionChange={handleOptionChange} />;
      case 1:
      default:
        return (
          <Step1BasicInfo
            formData={formData}
            updateFormData={updateFormData}
            newTag={newTag}
            setNewTag={setNewTag}
            isAddingTag={isAddingTag}
            setIsAddingTag={setIsAddingTag}
            handleAddTag={handleAddTag}
            handleRemoveTag={handleRemoveTag}
          />
        );
    }
  };

  return (
    <Layout activeMenu="AI 레시피">
      <SEO
        title="레시피 등록하기 | 깃깔나는 레시피"
        description="단계별로 입력하면 완성! AI 도우미가 작성을 도와드려요."
        url="/register"
      />
      <div className="container" style={{ paddingTop: '20px', paddingBottom: '60px' }}>
        {/* 상단 타이틀 영역 */}
        <div className={styles.headerArea}>
          <h1 className="font-display dtext-4xl" style={{ marginBottom: '12px' }}>
            레시피 등록하기
          </h1>
          <p className="text-lg" style={{ color: 'var(--brand-gray)' }}>
            단계별로 입력하면 완성! AI 도우미가 작성을 도와드려요.
          </p>
        </div>

        {/* 5단계 인디케이터 바 */}
        <div className={styles.stepNav}>
          {steps.map((step) => {
            const isActive = currentStep === step.id;
            return (
              <button
                key={step.id}
                type="button"
                className={`${styles.stepPill} ${isActive ? styles.activeStepPill : ''}`}
                onClick={() => goToStep(step.id)}
              >
                <span className={styles.stepNumber}>{step.id}</span>
                <span>{step.label}</span>
              </button>
            );
          })}
        </div>

        {/* 메인 단계별 입력 폼 카드 */}
        <div className={styles.formCard}>{renderStepComponent()}</div>

        {/* 하단 액션 버튼 바 */}
        <div className={styles.bottomActionBar}>
          <div className={styles.leftActions}>
            <button
              type="button"
              className={styles.actionBtn}
              onClick={handleSaveDraft}
              disabled={isSaving}
              data-tooltip="임시 저장"
            >
              <span className={styles.btnIcon}>💾</span>
              <span className={styles.btnText}>{isSaving ? '저장 중...' : '임시 저장'}</span>
            </button>

            <button
              type="button"
              className={styles.actionBtn}
              onClick={handleLoadRecentDraft}
              disabled={isSaving}
              data-tooltip="불러오기"
            >
              <span className={styles.btnIcon}>📁</span>
              <span className={styles.btnText}>불러오기</span>
            </button>
          </div>

          <div className={styles.rightActions}>
            <button
              type="button"
              className={`${styles.navBtn} ${currentStep === 1 ? styles.disabledBtn : ''}`}
              onClick={() => goToStep(currentStep - 1)}
              disabled={currentStep === 1}
              data-tooltip="이전 단계"
            >
              <span className={styles.btnIcon}>‹</span>
              <span className={styles.btnText}>이전</span>
            </button>

            <button
              type="button"
              className={styles.nextBtn}
              onClick={() => {
                if (currentStep === steps.length) {
                  handleFinalSubmit();
                } else {
                  goToStep(currentStep + 1);
                }
              }}
              data-tooltip={currentStep === steps.length ? '완성하기' : '다음 단계'}
            >
              <span className={styles.btnText}>{currentStep === steps.length ? '완성하기' : '다음'}</span>
              <span className={styles.btnIcon}>›</span>
            </button>
          </div>
        </div>
      </div>

      {/* 🚨 잘못된 접근 및 프리셋 없음 통합 MUI 모달 */}
      <AccessGuardModal
        isOpen={isAccessModalOpen}
        handleLoadRecentDraft={handleLoadRecentDraft}
        handleGoToCreatePage={handleGoToCreatePage}
      />
    </Layout>
  );
}
