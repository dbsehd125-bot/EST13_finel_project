import React, { useState } from 'react';
import Layout from '../components/Layout';
import styles from './CreateAIRecipe.module.css';
export default function CreateAIRecipe() {
  // Step 1: 요청 사항
  const [prompt, setPrompt] = useState(
    '집에 계란, 양파, 참치가 있어요. 밥과 함께 먹을 수 있는 매콤한 요리를 만들어 주세요.',
  );
  // Step 2: 보유 재료 태그
  const [ingredients, setIngredients] = useState(['계란', '양파', '참치', '밥']);
  const [newIngredient, setNewIngredient] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  // Step 3: 조건 선택
  const [conditions, setConditions] = useState({
    servings: '2인분',
    cookingTime: '30분 이내',
    difficulty: '쉬움',
    cuisine: '한식',
    spiciness: '보통',
    excluded: '없음',
  });
  // Step 4: 결과 생성 옵션
  const [options, setOptions] = useState({
    title: true,
    steps: true,
    substitutes: true,
    shoppingList: true,
    summary: true,
    image: true,
    nutrition: true,
  });
  // 로딩 & 결과 상태
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  // 재료 태그 추가
  const handleAddIngredient = () => {
    if (newIngredient.trim() && !ingredients.includes(newIngredient.trim())) {
      setIngredients([...ingredients, newIngredient.trim()]);
      setNewIngredient('');
    }
    setIsAddingTag(false);
  };
  // 재료 태그 삭제
  const handleRemoveIngredient = (tag) => {
    setIngredients(ingredients.filter((item) => item !== tag));
  };
  // 조건 셀렉트 변경
  const handleConditionChange = (field, value) => {
    setConditions((prev) => ({ ...prev, [field]: value }));
  };
  // 옵션 체크박스 변경
  const handleOptionToggle = (field) => {
    setOptions((prev) => ({ ...prev, [field]: !prev[field] }));
  };
  // 레시피 생성 제출
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setResult({
        title: 'AI 추천 매콤 참치 계란덮밥',
        description: '남은 참치캔과 계란으로 10분 만에 완성하는 매콤달콤한 한 끼 요리!',
        servings: conditions.servings,
        cookingTime: conditions.cookingTime,
        difficulty: conditions.difficulty,
        ingredients: ingredients,
        steps: [
          '양파를 얇게 채썰고, 참치캔의 기름을 살짝 빼둡니다.',
          '팬에 기름을 두르고 양파를 볶다가 고추장 1큰술, 간장 1큰술을 넣고 함께 볶습니다.',
          '참치와 물 3큰술을 넣고 자작하게 끓인 뒤, 계란을 풀어 둘러줍니다.',
          '따뜻한 밥 위에 얹어 참기름과 깨를 뿌려 완성합니다.',
        ],
      });
    }, 1800);
  };
  return (
    <div className="container" style={{ paddingTop: '20px', paddingBottom: '60px' }}>
      {/* 헤더 타이틀 영역 */}✨ AI 레시피 생성
      <h1 className="font-display dtext-4xl" style={{ marginTop: '12px', marginBottom: '12px' }}>
        나만의 레시피 만들기
        <p className="text-lg" style={{ color: 'var(--brand-gray)' }}>
          먹고 싶은 음식이나 가진 재료를 알려 주면 AI가 레시피와 완성 이미지를 만들어드려요.
          {/* 2컬럼 레이아웃 */}
          <div className={styles.mainGrid}>
            {/* 왼쪽: 폼 영역 */}
            <form className={styles.formSection} onSubmit={handleSubmit}>
              {/* Step 1: 무엇을 만들고 싶나요? */}
              <div className={styles.stepCard}>
                <div className={styles.stepTitleRow}>
                  <span className={styles.stepBadge}>1</span>
                  <h3 className="text-lg" style={{ fontWeight: 600, color: 'var(--brand-brown)' }}>
                    무엇을 만들고 싶나요?
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

                  {isAddingTag ? (
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
                    <button type="button" className={styles.addTagBtn} onClick={() => setIsAddingTag(true)}>
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
                    <select
                      className={styles.selectBox}
                      value={conditions.servings}
                      onChange={(e) => handleConditionChange('servings', e.target.value)}
                    >
                      <option>1인분</option>
                      <option>2인분</option>
                      <option>3~4인분</option>
                      <option>5인분 이상</option>
                    </select>
                  </div>

                  <div className={styles.selectField}>
                    <label className="text-sm" style={{ color: 'var(--brand-gray)', marginBottom: '4px' }}>
                      조리 시간
                    </label>
                    <select
                      className={styles.selectBox}
                      value={conditions.cookingTime}
                      onChange={(e) => handleConditionChange('cookingTime', e.target.value)}
                    >
                      <option>10분 이내</option>
                      <option>15분 이내</option>
                      <option>30분 이내</option>
                      <option>1시간 이내</option>
                    </select>
                  </div>

                  <div className={styles.selectField}>
                    <label className="text-sm" style={{ color: 'var(--brand-gray)', marginBottom: '4px' }}>
                      난이도
                    </label>
                    <select
                      className={styles.selectBox}
                      value={conditions.difficulty}
                      onChange={(e) => handleConditionChange('difficulty', e.target.value)}
                    >
                      <option>초간단</option>
                      <option>쉬움</option>
                      <option>보통</option>
                      <option>어려움</option>
                    </select>
                  </div>

                  <div className={styles.selectField}>
                    <label className="text-sm" style={{ color: 'var(--brand-gray)', marginBottom: '4px' }}>
                      음식 종류
                    </label>
                    <select
                      className={styles.selectBox}
                      value={conditions.cuisine}
                      onChange={(e) => handleConditionChange('cuisine', e.target.value)}
                    >
                      <option>한식</option>
                      <option>양식</option>
                      <option>일식</option>
                      <option>중식</option>
                      <option>퓨전/기타</option>
                    </select>
                  </div>

                  <div className={styles.selectField}>
                    <label className="text-sm" style={{ color: 'var(--brand-gray)', marginBottom: '4px' }}>
                      매운맛
                    </label>
                    <select
                      className={styles.selectBox}
                      value={conditions.spiciness}
                      onChange={(e) => handleConditionChange('spiciness', e.target.value)}
                    >
                      <option>순한맛</option>
                      <option>보통</option>
                      <option>매운맛</option>
                      <option>아주 매운맛</option>
                    </select>
                  </div>

                  <div className={styles.selectField}>
                    <label className="text-sm" style={{ color: 'var(--brand-gray)', marginBottom: '4px' }}>
                      제외 재료
                    </label>
                    <select
                      className={styles.selectBox}
                      value={conditions.excluded}
                      onChange={(e) => handleConditionChange('excluded', e.target.value)}
                    >
                      <option>없음</option>
                      <option>견과류</option>
                      <option>유제품</option>
                      <option>해산물</option>
                      <option>돼지고기</option>
                    </select>
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
                    <input type="checkbox" checked={options.title} onChange={() => handleOptionToggle('title')} />
                    <span>레시피 제목 생성</span>
                  </label>

                  <label className={styles.checkboxItem}>
                    <input type="checkbox" checked={options.summary} onChange={() => handleOptionToggle('summary')} />
                    <span>핵심 조리 과정 요약</span>
                  </label>

                  <label className={styles.checkboxItem}>
                    <input type="checkbox" checked={options.steps} onChange={() => handleOptionToggle('steps')} />
                    <span>상세 조리 단계 생성</span>
                  </label>

                  <label className={styles.checkboxItem}>
                    <input type="checkbox" checked={options.image} onChange={() => handleOptionToggle('image')} />
                    <span>완성 이미지 생성</span>
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
                      checked={options.nutrition}
                      onChange={() => handleOptionToggle('nutrition')}
                    />
                    <span>영양 정보 제공</span>
                  </label>

                  <label className={styles.checkboxItem}>
                    <input
                      type="checkbox"
                      checked={options.shoppingList}
                      onChange={() => handleOptionToggle('shoppingList')}
                    />
                    <span>장보기 목록 생성</span>
                  </label>
                </div>
              </div>

              {/* 생성하기 버튼 */}
              <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                {isLoading ? '✨ AI가 레시피를 구상 중입니다...' : '🪄 나만의 레시피 만들기'}
              </button>
            </form>

            {/* 오른쪽: 미리보기 / 결과 카드 */}
            <div className={styles.resultCard}>
              {isLoading ? (
                <div className={styles.loadingContainer}>
                  <div className={styles.spinner} />
                  <p className="text-m" style={{ color: 'var(--brand-brown)', marginTop: '16px' }}>
                    AI가 최고의 레시피를 생성하는 중입니다...
                  </p>
                </div>
              ) : result ? (
                <div className={styles.resultView}>
                  <div className={styles.resultBadge}>✨ 생성 완료</div>
                  <h2 className="font-display dtext-2xl" style={{ marginTop: '12px', marginBottom: '8px' }}>
                    {result.title}
                  </h2>
                  <p className="text-m" style={{ color: 'var(--brand-gray)', marginBottom: '20px' }}>
                    {result.description}
                  </p>

                  <div className={styles.metaRow}>
                    <span className={styles.metaChip}>👥 {result.servings}</span>
                    <span className={styles.metaChip}>⏱ {result.cookingTime}</span>
                    <span className={styles.metaChip}>🔥 {result.difficulty}</span>
                  </div>

                  <div className={styles.stepsContainer}>
                    <h4 className="text-lg" style={{ fontWeight: 600, marginBottom: '12px' }}>
                      🍳 조리 순서
                    </h4>
                    <ol className={styles.stepList}>
                      {result.steps.map((step, idx) => (
                        <li key={idx} className="text-m" style={{ marginBottom: '10px', lineHeight: '1.6' }}>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              ) : (
                <div className={styles.emptyView}>
                  <div className={styles.emptyIconBadge}>
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--brand-ai)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                  </div>
                  <p className="text-lg" style={{ fontWeight: 600, color: 'var(--brand-brown)', marginBottom: '6px' }}>
                    여기에 생성된 레시피가 나타나요.
                  </p>
                  <p className="text-sm" style={{ color: 'var(--brand-gray)' }}>
                    왼쪽 내용을 입력하고 만들기를 눌러보세요.
                  </p>
                </div>
              )}
            </div>
          </div>
        </p>
      </h1>
    </div>
  );
}
