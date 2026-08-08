// Library
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
// Components
import Layout from '../../components/Layout';
import RecipeResultCard from './RecipeResultCard';
// CSS
import styles from './CreateAIRecipe.module.css';
import { getOpenInteractionType } from '@mui/material/Select';
import { RecipeJsonToMarkdown } from './RecipeJsonToMarkdown';

const API_BASE = '/api/v1';
const ALAN_CLIENT_ID = import.meta.env.VITE_ALAN_CLIENT_ID;
const OPEN_AI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const FALLBACK_URL = 'https://dummyimage.com/1024x1024/f26b3a/ffffff.png&text=No+Image';

export default function CreateAIRecipe() {
  // Step 1: 프롬프트 입력
  const [prompt, setPrompt] = useState(
    '집에 계란, 양파, 참치가 있어요. 밥과 함께 먹을 수 있는 매콤한 요리를 만들어 주세요.',
  );

  // Step 2: 태그 선택
  const [ingredients, setIngredients] = useState(['계란', '양파', '참치', '밥']);
  const [newIngredient, setNewIngredient] = useState('');
  const [isAddingIngredientTag, setIsAddingIngredientTag] = useState(false);
  const [excluded, setExcluded] = useState(['우유', '복숭아', '새우', '땅콩']);
  const [newExcluded, setNewExcluded] = useState('');
  const [isAddingExcludedTag, setIsAddingExcludedTag] = useState(false);

  // Step 3: 조건 선택
  const [conditions, setConditions] = useState({
    servings: '2인분',
    cookingTime: '30분 이내',
    difficulty: '쉬움',
    cuisine: '한식',
  });

  // Step 4: 결과 생성 옵션
  const [options, setOptions] = useState({
    image: true,
    sidedishes: true,
    nutrition: true,
    shoppinglist: true,
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
  /**
   * null: 로딩 아님
   * prompt: 레시피 프롬프트 생성 중
   * image: 레시피 이미지 생성 중
   */
  const [loadingStep, setLoadingStep] = useState(null);
  const [result, setResult] = useState(null);

  // 재료 태그 추가
  const handleAddIngredient = () => {
    if (newIngredient.trim() && !ingredients.includes(newIngredient.trim())) {
      setIngredients([...ingredients, newIngredient.trim()]);
      setNewIngredient('');
    }
    setIsAddingIngredientTag(false);
  };

  // 재료 태그 삭제
  const handleRemoveIngredient = (tag) => {
    setIngredients(ingredients.filter((item) => item !== tag));
  };

  // 제외 태그 추가
  const handleAddExcluded = () => {
    if (newExcluded.trim() && !excluded.includes(newExcluded.trim())) {
      setExcluded([...excluded, newExcluded.trim()]);
      setNewExcluded('');
    }
    setIsAddingExcludedTag(false);
  };

  // 제외 태그 삭제
  const handleRemoveExcluded = (tag) => {
    setExcluded(excluded.filter((item) => item !== tag));
  };

  // 조건 셀렉트 변경
  const handleConditionChange = (field, value) => {
    setConditions((prev) => ({ ...prev, [field]: value }));
  };

  // 옵션 체크박스 변경
  const handleOptionToggle = (field) => {
    setOptions((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  /**
   * 선택된 결과 옵션(options)에 따라 프롬프트 요구사항을 동적으로 생성
   * @param {Object} options - { image, sidedishes, nutrition, shoppinglist }
   * @returns {string} 프롬프트에 추가될 요구사항 문자열
   */
  const buildOutputOptionsPrompt = (options) => {
    const requirements = [];

    if (options.sidedishes) {
      requirements.push('- [곁들이기 추천] 이 요리와 잘 어울리는 반찬, 국, 또는 음료/주류 추천 1~2가지를 포함해줘.');
    }

    if (options.nutrition) {
      requirements.push(
        '- [영양 성분 정보] 1인분 기준 예상 칼로리(kcal)와 주요 영양소 비율(탄수화물g, 단백질g, 지방g, 기타)을 요약해서 작성해줘.',
      );
    }

    if (options.shoppinglist) {
      requirements.push(
        '- [장보기 체크리스트] 마트에서 바로 살 수 있도록 주재료와 양념류를 구획한 체크리스트(- [ ] 형태)를 마크다운 하단에 작성해줘.',
      );
    }

    return requirements.length > 0 ? `\n[결과 옵션]\n${requirements.join('\n')}` : '';
  };

  // test
  const handleGenerateRecipe = async (e) => {
    if (e) e.preventDefault();

    setLoadingStep('prompt');
    setResult(null);

    try {
      // [Step 1] Alan AI 텍스트 생성
      const systemPrompt = `
      당신은 전문 요리 연구가 AI입니다. 
      사용자가 제공하는 [요리 조건]과 [요청사항]을 바탕으로 최적의 레시피 데이터를 작성하세요.

      [응답 규칙]
      1. 반드시 아래의 [JSON Schema] 구조를 엄격히 준수하여 순수한 JSON 객체 하나만 반환해야 합니다.
      2. 마크다운 문법(\`\`\`json ... \`\`\`), 설명 텍스트, 인사말, 사족은 절대로 포함하지 마세요.

      [요청사항]
      - ${prompt}

      [요리 조건]
      - 보유/사용 재료: ${ingredients.join(', ')}
      - 식사 인원: ${conditions.servings}
      - 조리 시간: ${conditions.cookingTime}
      - 난이도: ${conditions.difficulty}
      - 요리 종류: ${conditions.cuisine}
      - 못 먹는 재료: ${excluded.length > 0 ? excluded.join(', ') : '없음'}

      [JSON Schema]
      {
        "title": "레시피 제목 (문자열)",
        "summary": "레시피 한줄 요약 (문자열)",
        "cuisine": "${conditions.cuisine || '기타'}",
        "cooking_time": "${conditions.cookingTime || '30분 이내'}",
        "difficulty": "${conditions.difficulty || '보통'}",
        "servings": "${conditions.servings || '2인분'}",
        "tags": ["태그1", "태그2", "태그3"],
        "ingredients": [
          {
            "name": "재료명 및 수량/분량 (예: 닭가슴살 200g)",
            "isSubstitutable": true 또는 false,
            "substituteName": "대체 재료명 (isSubstitutable이 true일 때만 입력, false면 \"\")"
          }
        ],
        "steps": [
          {
            "step": 1,
            "title": "단계 제목",
            "description": "상세 조리 방법 설명",
            "tip": "조리 팁 (없으면 \"\")"
          }
        ]
      }
      `.trim();

      //   const userPrompt = `
      //   다음 조건에 맞는 상세한 요리 레시피를 만들어줘.

      //   [요청사항]
      //   - ${prompt}

      //   [요리 조건]
      //   - 보유/사용 재료: ${ingredients.join(', ')}
      //   - 식사 인원: ${conditions.servings}
      //   - 조리 시간: ${conditions.cookingTime}
      //   - 난이도: ${conditions.difficulty}
      //   - 요리 종류: ${conditions.cuisine}
      //   - 못 먹는 재료: ${excluded.length > 0 ? excluded.join(', ') : '없음'}

      //   [출력 포맷 요청]
      //   1. 레시피 제목과 간단한 요약 설명
      //   2. 정확한 재료 및 양념장 비율 목록
      //   3. Step-by-Step 상세 조리 순서 (각 단계별 조리 팁 포함)
      //   4. 내용 분기마다 이모지 1개씩 문장 맨 앞에 추가

      //   ${buildOutputOptionsPrompt(options)}

      //   위 내용을 읽기 좋은 깔끔한 마크다운(Markdown) 포맷으로 작성해줘.
      // `.trim();

      const queryString = new URLSearchParams({
        // content: userPrompt,
        content: systemPrompt,
        client_id: ALAN_CLIENT_ID,
      }).toString();

      const response = await fetch(`${API_BASE}/question?${queryString}`);
      if (!response.ok) {
        throw new Error(`API 요청 실패 (Status: ${response.status})`);
      }

      const data = await response.json();
      const jsonString =
        data.content || data.answer || (typeof data === 'string' ? data : JSON.stringify(data, null, 2));
      // AI가 붙였을 수도 있는 마크다운 코드블록 메타문자(```json ... ```) 1차 제거
      const cleanedJsonString = jsonString
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();
      // JSON 객체로 파싱
      const parsedRecipeJson = JSON.parse(cleanedJsonString);
      // 파싱 완료된 JSON 객체로 마크다운 생성
      const markdownContent = RecipeJsonToMarkdown(parsedRecipeJson);

      let base64ImageContent = FALLBACK_URL;

      if (options.image) {
        // [Step 2] Open AI 이미지 생성
        setLoadingStep('image');

        const titleMatch = markdownContent.match(/^#\s*(.+)/m);
        const recipeTitle = titleMatch ? titleMatch[1].trim() : '맛있는 요리';

        try {
          const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${OPEN_AI_API_KEY}`,
            },
            body: JSON.stringify({
              model: 'gpt-image-2',
              prompt: `A professional studio food photography of ${recipeTitle}, ${conditions.cuisine} cuisine, beautifully plated, delicious look, warm lighting, 4k resolution.`,
              n: 1,
              size: '1024x1024',
              quality: 'low',
              output_format: 'png',
            }),
          });

          if (imageResponse.ok) {
            const result = await imageResponse.json();
            const rawBase64 = result?.data?.[0]?.b64_json;
            base64ImageContent = rawBase64 ? `data:image/png;base64,${rawBase64}` : fallbackUrl;
          } else {
            const error = await imageResponse.json();
            console.error('OpenAI API 에러 상세:', error);
          }
        } catch (error) {
          console.error('이미지 생성 실패 (기본 이미지로 대체):', error);
        }
      }

      // [Step 3] 최종 결과 저장
      setResult({
        image: base64ImageContent,
        markdown: markdownContent,
      });
    } catch (error) {
      console.error('Alan AI 에러 상세:', error);
      alert('레시피를 생성하지 못했습니다. 개발자 도구 콘솔 및 네트워크 탭을 확인해 주세요.');
    } finally {
      setLoadingStep(null);
    }
  };

  // 하단 추가 수정 프롬프트 제출 (x)
  const handleRefineSubmit = (e) => {
    e.preventDefault();
    if (!refinePrompt.trim()) return;

    setLoadingStep(true);
    setTimeout(() => {
      setLoadingStep(false);
      setResult((prev) => ({
        ...prev,
        markdown: prev.markdown + `\n\n> 💡 **전송한 메세지의 내용**이 적용된 레시피입니다.`,
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
          <form className={styles.formSection} onSubmit={handleGenerateRecipe}>
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
              </div>
              {/* 제외시킬 재료 */}
              <div>
                {/* <div className={styles.stepTitleRow}> */}
                {/* <span className={styles.stepBadge}>2</span> */}
                <div style={{ paddingTop: '20px', paddingBottom: '16px' }}>
                  <label className="text-sm" style={{ color: 'var(--brand-gray)' }}>
                    🚫 제외시킬 재료
                  </label>
                </div>
                {/* </div> */}
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
              {/* 보유 재료 태그 리스트 */}
              {/* <div className={styles.tagContainer}>
                {ingredients.map((tag) => (
                  <span key={tag} className={styles.tagBadge}>
                    {tag}
                    <button type="button" className={styles.tagDeleteBtn} onClick={() => handleRemoveIngredient(tag)}>
                      ✕
                    </button>
                  </span>
                ))}
              </div> */}
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
                  <span>완성 이미지 생성</span>
                </label>

                <label className={styles.checkboxItem}>
                  <input
                    type="checkbox"
                    checked={options.sidedishes}
                    onChange={() => handleOptionToggle('sidedishes')}
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
                    checked={options.shoppinglist}
                    onChange={() => handleOptionToggle('shoppinglist')}
                  />
                  <span>장보기 목록 생성</span>
                </label>
              </div>
            </div>

            {/* 생성하기 버튼 */}
            <button type="submit" className={styles.submitBtn} disabled={loadingStep} onClick={handleGenerateRecipe}>
              {loadingStep ? '✨ AI가 레시피를 구상 중입니다...' : '🪄 나만의 레시피 만들기'}
            </button>
          </form>

          {/* 오른쪽: 미리보기 / 결과 카드 */}
          <div className={styles.resultCard}>
            {loadingStep ? (
              <div className={styles.loadingContainer}>
                <div className={styles.spinner} />

                {/* loadingStep 상태에 따른 텍스트 분기 처리 */}
                <p className="text-m" style={{ color: 'var(--brand-brown)', marginTop: '16px', fontWeight: 600 }}>
                  {loadingStep === 'prompt' && '🤖 레시피를 생성 중입니다...'}
                  {loadingStep === 'image' && '🎨 이미지를 생성 중입니다...'}
                </p>
                <p className="text-sm" style={{ color: 'var(--brand-gray)', marginTop: '6px' }}>
                  {loadingStep === 'prompt' && '입력하신 재료와 조건을 분석하고 있어요.'}
                  {loadingStep === 'image' && '맛있는 이미지를 그리고 있어요. 곧 완성됩니다!'}
                </p>
              </div>
            ) : result ? (
              <RecipeResultCard result={result}>
                {/* 1. 하단 액션 버튼 바 (children 주입) */}
                <div className={styles.resultActionBar}>
                  <div className={styles.leftIcons}>
                    <button
                      type="button"
                      className={styles.iconCircleBtn}
                      title="다시 생성"
                      onClick={handleGenerateRecipe}
                    >
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
                    <button
                      type="button"
                      className={styles.iconCircleBtn}
                      title="복사하기"
                      onClick={() => {
                        if (result?.markdown) {
                          navigator.clipboard.writeText(result.markdown);
                          alert('레시피가 클립보드에 복사되었습니다.');
                        }
                      }}
                    >
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

                {/* 2. 추가 수정 프롬프트 입력창 (children 주입) */}
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
              </RecipeResultCard>
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
