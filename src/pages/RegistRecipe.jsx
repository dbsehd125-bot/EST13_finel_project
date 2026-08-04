import React, { useState } from 'react';
import Layout from '../components/Layout';
import styles from './RegistRecipe.module.css';

export default function RegisterRecipe() {
  // 현재 단계 (1~6)
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: 기본 정보 폼 상태
  const [title, setTitle] = useState('매콤 크림 닭갈비 파스타');
  const [description, setDescription] = useState(
    "매콤한 닭갈비 소스와 고소한 크림이 만나 어우러진, 이색적인 퓨전 파스타 요리입니다. 부드럽고 매콤한 맛으로 남녀노소 모두가 조리 시간 약 20분, 난이도는 '하' 수준으로 간편합니다.",
  );
  const [category, setCategory] = useState('퓨전');
  const [cookingTime, setCookingTime] = useState('20');
  const [difficulty, setDifficulty] = useState('하');
  const [servings, setServings] = useState('2');

  // 태그 상태
  const [tags, setTags] = useState(['#매콤크림파스타', '#퓨전파스타', '#닭갈비파스타', '#20분요리', '#초간단']);
  const [newTag, setNewTag] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);

  // 단계 라벨 목록
  const steps = [
    { id: 1, label: '기본 정보' },
    { id: 2, label: '재료' },
    { id: 3, label: '조리 과정' },
    { id: 4, label: '이미지' },
    { id: 5, label: '공개 설정' },
    { id: 6, label: '미리 보기' },
  ];

  // 태그 추가
  const handleAddTag = () => {
    if (!newTag.trim()) {
      setIsAddingTag(false);
      return;
    }
    const formattedTag = newTag.trim().startsWith('#') ? newTag.trim() : `#${newTag.trim()}`;

    if (!tags.includes(formattedTag)) {
      setTags([...tags, formattedTag]);
    }
    setNewTag('');
    setIsAddingTag(false);
  };

  // 태그 삭제
  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  // 다음/이전 단계 핸들러
  const handleNext = () => {
    if (currentStep < 6) setCurrentStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  return (
    <Layout activeMenu="">
      <div className="container" style={{ paddingTop: '20px', paddingBottom: '60px' }}>
        {/* 상단 헤더 영역 */}
        <div className={styles.headerArea}>
          <h1 className="font-display dtext-4xl" style={{ marginBottom: '12px' }}>
            레시피 등록하기
          </h1>
          <p className="text-lg" style={{ color: 'var(--brand-gray)' }}>
            단계별로 입력하면 완성! AI 도우미가 작성을 도와드려요.
          </p>
        </div>

        {/* 6단계 상단 인디케이터 바 */}
        <div className={styles.stepNav}>
          {steps.map((step) => {
            const isActive = currentStep === step.id;
            return (
              <button
                key={step.id}
                type="button"
                className={`${styles.stepPill} ${isActive ? styles.activeStepPill : ''}`}
                onClick={() => setCurrentStep(step.id)}
              >
                <span className={styles.stepNumber}>{step.id}</span>
                <span>{step.label}</span>
              </button>
            );
          })}
        </div>

        {/* 메인 폼 카드 */}
        <div className={styles.formCard}>
          {currentStep === 1 && (
            <div className={styles.stepContent}>
              {/* 레시피 제목 */}
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>레시피 제목</label>
                <input
                  type="text"
                  className={styles.textInput}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="레시피 제목을 입력하세요."
                />
              </div>

              {/* 한 줄 설명 */}
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>한 줄 설명</label>
                <textarea
                  className={styles.textareaInput}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="레시피에 대한 한 줄 설명이나 소개글을 입력해주세요."
                  rows={3}
                />
              </div>

              {/* 4컬럼 선택 정보 (카테고리, 조리시간, 난이도, 인분) */}
              <div className={styles.fourColGrid}>
                <div className={styles.selectField}>
                  <label className={styles.inputLabel}>카테고리</label>
                  <select className={styles.selectBox} value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option>한식</option>
                    <option>양식</option>
                    <option>일식</option>
                    <option>중식</option>
                    <option>퓨전</option>
                    <option>기타</option>
                  </select>
                </div>

                <div className={styles.selectField}>
                  <label className={styles.inputLabel}>조리 시간(분)</label>
                  <input
                    type="number"
                    className={styles.textInput}
                    value={cookingTime}
                    onChange={(e) => setCookingTime(e.target.value)}
                    placeholder="20"
                  />
                </div>

                <div className={styles.selectField}>
                  <label className={styles.inputLabel}>난이도</label>
                  <select
                    className={styles.selectBox}
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                  >
                    <option>초간단</option>
                    <option>하</option>
                    <option>중</option>
                    <option>상</option>
                  </select>
                </div>

                <div className={styles.selectField}>
                  <label className={styles.inputLabel}>인분</label>
                  <input
                    type="number"
                    className={styles.textInput}
                    value={servings}
                    onChange={(e) => setServings(e.target.value)}
                    placeholder="2"
                  />
                </div>
              </div>

              {/* 태그 목록 영역 */}
              <div className={styles.inputGroup} style={{ marginTop: '16px' }}>
                <label className={styles.inputLabel}>태그</label>
                <div className={styles.tagList}>
                  {tags.map((tag) => (
                    <span key={tag} className={styles.tagChip}>
                      {tag}
                      <button type="button" className={styles.tagDeleteBtn} onClick={() => handleRemoveTag(tag)}>
                        ✕
                      </button>
                    </span>
                  ))}

                  {isAddingTag ? (
                    <div className={styles.addTagInputWrapper}>
                      <input
                        type="text"
                        className={styles.addTagInput}
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                        placeholder="태그 입력"
                        autoFocus
                      />
                      <button type="button" className={styles.addTagConfirmBtn} onClick={handleAddTag}>
                        추가
                      </button>
                    </div>
                  ) : (
                    <button type="button" className={styles.addTagBtn} onClick={() => setIsAddingTag(true)}>
                      태그 추가 +
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 2~6단계 안내 뷰 */}
          {currentStep > 1 && (
            <div className={styles.placeholderStepContent}>
              <h3 className="text-xl" style={{ fontWeight: 600, color: 'var(--brand-brown)' }}>
                {steps[currentStep - 1].label} 입력 단계입니다.
              </h3>
              <p className="text-m" style={{ color: 'var(--brand-gray)', marginTop: '8px' }}>
                이 단계의 세부 폼을 순서대로 작성해 보세요.
              </p>
            </div>
          )}
        </div>

        {/* 하단 액션 버튼 바 */}
        <div className={styles.bottomActionBar}>
          <div className={styles.leftActions}>
            <button type="button" className={styles.actionBtn}>
              💾 임시 저장
            </button>
            <button type="button" className={styles.actionBtn}>
              👁 미리 보기
            </button>
          </div>

          <div className={styles.rightActions}>
            <button
              type="button"
              className={`${styles.navBtn} ${currentStep === 1 ? styles.disabledBtn : ''}`}
              onClick={handlePrev}
              disabled={currentStep === 1}
            >
              ‹ 이전
            </button>
            <button type="button" className={styles.nextBtn} onClick={handleNext}>
              {currentStep === 6 ? '완성하기' : '다음 ›'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
