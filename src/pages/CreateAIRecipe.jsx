import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Layout from '../components/Layout';
import styles from './CreateAIRecipe.module.css';

const DUMMY_MARKDOWN_RESULT = `**요리 제목:** 매콤 크림 닭갈비 파스타

**요리 개요:**
매콤한 닭갈비 소스와 고소한 크림이 만나 어우러진, 이색적인 퓨전 파스타 요리입니다. 부드럽고 매콤한 맛으로 남녀노소 모두가 조리 시간 약 20분, 난이도는 '하' 수준으로 간편합니다.

**재료 목록:**
* 닭가슴살: 300g
* 양파: 1/2개
* 대파: 1/2대
* 우유: 200ml
* 고추장: 1스푼
* 고춧가루: 1/2스푼
* 간장: 1/2스푼
* 다진마늘: 1/2스푼

**조리 과정:**
1. **재료 손질하기:** 닭가슴살과 양파, 대파는 먹기 좋은 크기로 썰어 준비합니다.
2. **양념에 볶기:** 양념 재료를 모두 섞어 닭가슴살을 30분간 재웁니다.
3. **크림 소스 만들기:** 팬에 올리브유를 두르고 손질한 야채를 볶은 후, 재운 닭가슴살을 넣어 볶습니다. 고기가 익으면 우유를 부어 끓여 크림 소스를 만듭니다.
4. **완성하기:** 삶은 파스타 면을 소스에 넣고 약불에서 소스가 스며들도록 버무려 완성합니다.

요리에 대한 더 자세한 설명이나, 다른 변형 레시피가 궁금하시다면 언제든지 질문해 주세요!`;

export default function CreateAIRecipe() {
  // Step 1: 프롬프트 입력
  const [prompt, setPrompt] = useState(
    '집에 계란, 양파, 참치가 있어요. 밥과 함께 먹을 수 있는 매콤한 요리를 만들어 주세요.',
  );

  // Step 2: 보유 재료 선택
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

  // 셀렉트 박스 화살표 상태
  const [openSelects, setOpenSelects] = useState({});

  const toggleSelect = (field) => {
    setOpenSelects((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const closeSelect = (field) => {
    setOpenSelects((prev) => ({ ...prev, [field]: false }));
  };

  // 하단 추가 수정 프롬프트 상태
  const [refinePrompt, setRefinePrompt] = useState('');

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
        image: 'https://dummyimage.com/600x400/000/fff.png&text=dummy+image',
        markdown: DUMMY_MARKDOWN_RESULT,
      });
    }, 1800);
  };

  // 하단 추가 수정 프롬프트 제출
  const handleRefineSubmit = (e) => {
    e.preventDefault();
    if (!refinePrompt.trim()) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setResult((prev) => ({
        ...prev,
        markdown: prev.markdown + `\n\n> 💡 **추가 반영 요청:** "${refinePrompt}" 내용이 적용된 레시피입니다.`,
      }));
      setRefinePrompt('');
    }, 1200);
  };

  return (
    <Layout activeMenu="AI 레시피">
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
                    {/* 커스텀 화살표 아이콘 */}
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
                    {/* 커스텀 화살표 아이콘 */}
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
                    {/* 커스텀 화살표 아이콘 */}
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
                    {/* 커스텀 화살표 아이콘 */}
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
                  <label className="text-sm" style={{ color: 'var(--brand-gray)', marginBottom: '4px' }}>
                    매운맛
                  </label>
                  <div>
                    <select
                      className={styles.selectBox}
                      value={conditions.spiciness}
                      onClick={() => toggleSelect('spiciness')}
                      onBlur={() => closeSelect('spiciness')}
                      onChange={(e) => {
                        handleConditionChange('spiciness', e.target.value);
                        closeSelect('spiciness');
                      }}
                    >
                      <option>순한맛</option>
                      <option>보통</option>
                      <option>매운맛</option>
                      <option>아주 매운맛</option>
                    </select>
                    {/* 커스텀 화살표 아이콘 */}
                    <span className={`${styles.selectArrow} ${openSelects.spiciness ? styles.selectArrowOpen : ''}`}>
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
                    제외 재료
                  </label>
                  <div>
                    <select
                      className={styles.selectBox}
                      value={conditions.excluded}
                      onClick={() => toggleSelect('excluded')}
                      onBlur={() => closeSelect('excluded')}
                      onChange={(e) => {
                        handleConditionChange('excluded', e.target.value);
                        closeSelect('excluded');
                      }}
                    >
                      <option>없음</option>
                      <option>견과류</option>
                      <option>유제품</option>
                      <option>해산물</option>
                      <option>돼지고기</option>
                    </select>
                    {/* 커스텀 화살표 아이콘 */}
                    <span className={`${styles.selectArrow} ${openSelects.excluded ? styles.selectArrowOpen : ''}`}>
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
                  <input type="checkbox" checked={options.nutrition} onChange={() => handleOptionToggle('nutrition')} />
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
                {/* 헤더 타이틀 */}
                <div className={styles.resultTitleRow}>
                  <span className={styles.sparkleIcon}>✨</span>
                  <h2 className="font-display dtext-2xl" style={{ fontWeight: 600 }}>
                    완성된 나만의 레시피
                  </h2>
                </div>

                {/* 대표 요리 이미지 */}
                <div className={styles.recipeImageWrapper}>
                  <img src={result.image} alt="생성된 요리 이미지" className={styles.recipeImage} />
                </div>

                {/* 크림색 배경 마크다운 본문 박스 */}
                <div className={styles.markdownCardBox}>
                  <div className={styles.markdownContent}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.markdown}</ReactMarkdown>
                  </div>

                  <div className={styles.cardDivider} />

                  {/* 하단 액션 버튼 바 */}
                  <div className={styles.resultActionBar}>
                    <div className={styles.leftIcons}>
                      <button type="button" className={styles.iconCircleBtn} title="다시 생성">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21.5 2v6h-6" />
                          <path d="M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                        </svg>
                      </button>
                      <button type="button" className={styles.iconCircleBtn} title="복사하기">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                      </button>
                    </div>

                    <button type="button" className={styles.publishBtn}>
                      <span>➤</span> 게시하기
                    </button>
                  </div>
                </div>

                {/* 추가 수정 프롬프트 입력창 */}
                <form className={styles.refineInputWrapper} onSubmit={handleRefineSubmit}>
                  <input
                    type="text"
                    className={styles.refineInput}
                    placeholder="수정할 내용이나 추가 요청사항을 입력하세요..."
                    value={refinePrompt}
                    onChange={(e) => setRefinePrompt(e.target.value)}
                  />
                  <button type="submit" className={styles.refineSendBtn} aria-label="수정 요청">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                </form>
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
      </div>
    </Layout>
  );
}
