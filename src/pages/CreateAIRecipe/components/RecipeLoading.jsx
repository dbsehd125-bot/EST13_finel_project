import React from 'react';
import styles from '../CreateAIRecipe.module.css';

export default function RecipeLoading({ loadingStep }) {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner} />
      <p className="text-m" style={{ color: 'var(--brand-brown)', marginTop: '16px', fontWeight: 600 }}>
        {loadingStep === 'prompt' && '🤖 레시피를 생성 중입니다...'}
        {loadingStep === 'image' && '🎨 이미지를 생성 중입니다...'}
      </p>
      <p className="text-sm" style={{ color: 'var(--brand-gray)', marginTop: '6px' }}>
        {loadingStep === 'prompt' && '입력하신 재료와 조건을 분석하고 있어요.'}
        {loadingStep === 'image' && '맛있는 이미지를 그리고 있어요. 곧 완성됩니다!'}
      </p>
    </div>
  );
}
