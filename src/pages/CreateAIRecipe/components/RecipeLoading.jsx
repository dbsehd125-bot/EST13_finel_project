import React from 'react';
import styles from '../CreateAIRecipe.module.css';

export default function RecipeLoading({ loadingStep }) {
  const isObject = typeof loadingStep === 'object' && loadingStep !== null;
  const stepType = isObject ? loadingStep.step : loadingStep;

  const current = isObject ? loadingStep.current : 0;
  const total = isObject ? loadingStep.total : 0;

  const renderMainText = () => {
    if (stepType === 'prompt') {
      return '🤖 레시피를 생성 중입니다...';
    }

    if (stepType === 'image') {
      // 1. 대표 썸네일 생성 중 (total이 0이거나 없을 때)
      if (total === 0) {
        return '🎨 대표 이미지를 생성 중입니다...';
      }
      // 2. 단계별 이미지 생성 중 (total > 0)
      return `🎨 단계별 이미지를 생성 중입니다... (${current}/${total})`;
    }

    return null;
  };

  const renderSubText = () => {
    if (stepType === 'prompt') {
      return '입력하신 재료와 조건을 분석하고 있어요.';
    }

    if (stepType === 'image') {
      if (total === 0) {
        return '요리의 대표 이미지를 생성하고 있어요. 곧 완성됩니다!';
      }
      return '조리 단계별 이미지를 그리고 있어요. 곧 완성됩니다!';
    }

    return null;
  };

  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner} />
      <p className="text-m" style={{ color: 'var(--brand-brown)', marginTop: '16px', fontWeight: 600 }}>
        {renderMainText()}
      </p>
      <p className="text-sm" style={{ color: 'var(--brand-gray)', marginTop: '6px' }}>
        {renderSubText()}
      </p>
    </div>
  );
}
