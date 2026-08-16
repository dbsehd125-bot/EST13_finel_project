import React from 'react';
import Layout from '../../components/Layout';
import SEO from '../../components/SEO';
import AuthGuardModal from '../../components/AuthGuardModal';
import RecipeInputForm from './components/RecipeInputForm';
import RecipeLoading from './components/RecipeLoading';
import RecipeResult from './components/RecipeResult';
import { useAiRecipe } from './hooks/useAiRecipe';
import styles from './CreateAIRecipe.module.css';

export default function CreateAIRecipe() {
  const {
    prompt,
    setPrompt,
    ingredients,
    newIngredient,
    setNewIngredient,
    isAddingIngredientTag,
    setIsAddingIngredientTag,
    excluded,
    newExcluded,
    setNewExcluded,
    isAddingExcludedTag,
    setIsAddingExcludedTag,
    conditions,
    options,
    openSelects,
    isPublishing,
    isAuthModalOpen,
    setIsAuthModalOpen,
    isSummaryModalOpen,
    setIsSummaryModalOpen,
    refinePrompt,
    setRefinePrompt,
    loadingStep,
    result,
    toggleSelect,
    closeSelect,
    handleAddIngredient,
    handleRemoveIngredient,
    handleAddExcluded,
    handleRemoveExcluded,
    handleConditionChange,
    handleOptionToggle,
    handleGenerateRecipe,
    handleCloseSummaryModal,
    handleBypassAndGenerate,
    handlePublish,
    handleConfirmAuthModal,
  } = useAiRecipe();

  return (
    <Layout activeMenu="AI 레시피">
      <SEO
        title="AI 레시피 생성 | 깃깔나는 레시피"
        description="먹고 싶은 음식이나 가진 재료를 알려 주면 AI가 레시피와 완성 이미지를 만들어드려요."
        url="/ai"
      />
      <div className="container" style={{ paddingTop: '20px', paddingBottom: '60px' }}>
        {/* 헤더 타이틀 영역 */}
        <div className={styles.headerArea}>
          <div className={styles.badge}>✨ AI 레시피 생성</div>
          <h1 className="font-display dtext-4xl" style={{ marginTop: '12px', marginBottom: '12px' }}>
            나만의 레시피 만들기
          </h1>
          <p className="text-lg" style={{ color: 'var(--brand-gray)' }}>
            먹고 싶은 음식이나 가진 재료를 알려 주면 AI가 레시피와 완성 이미지를 만들어드려요.
          </p>
        </div>

        {/* 2컬럼 레이아웃 */}
        <div className={styles.mainGrid}>
          {/* 왼쪽: 폼 영역 */}
          <RecipeInputForm
            prompt={prompt}
            setPrompt={setPrompt}
            ingredients={ingredients}
            newIngredient={newIngredient}
            setNewIngredient={setNewIngredient}
            isAddingIngredientTag={isAddingIngredientTag}
            setIsAddingIngredientTag={setIsAddingIngredientTag}
            handleAddIngredient={handleAddIngredient}
            handleRemoveIngredient={handleRemoveIngredient}
            excluded={excluded}
            newExcluded={newExcluded}
            setNewExcluded={setNewExcluded}
            isAddingExcludedTag={isAddingExcludedTag}
            setIsAddingExcludedTag={setIsAddingExcludedTag}
            handleAddExcluded={handleAddExcluded}
            handleRemoveExcluded={handleRemoveExcluded}
            conditions={conditions}
            handleConditionChange={handleConditionChange}
            options={options}
            handleOptionToggle={handleOptionToggle}
            openSelects={openSelects}
            toggleSelect={toggleSelect}
            closeSelect={closeSelect}
            loadingStep={loadingStep}
            isSummaryModalOpen={isSummaryModalOpen}
            setIsSummaryModalOpen={setIsSummaryModalOpen}
            handleCloseSummaryModal={handleCloseSummaryModal}
            handleBypassAndGenerate={handleBypassAndGenerate}
            onSubmit={handleGenerateRecipe}
          />

          {/* 오른쪽: 미리보기 / 결과 카드 */}
          <div className={styles.resultCard} id="target-section">
            {loadingStep ? (
              <RecipeLoading loadingStep={loadingStep} />
            ) : (
              <RecipeResult
                result={result}
                isPublishing={isPublishing}
                handlePublish={handlePublish}
                refinePrompt={refinePrompt}
                setRefinePrompt={setRefinePrompt}
                handleGenerateRecipe={handleGenerateRecipe}
              />
            )}
          </div>
        </div>
      </div>

      {/* 🔒 비회원 전용 로그인 유도 모달 */}
      <AuthGuardModal
        open={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onConfirm={handleConfirmAuthModal}
        message="게시하기 기능은 로그인 후 이용하실 수 있습니다."
      />
    </Layout>
  );
}
