// Library
import React, { useState } from 'react';
import { useNavigate } from 'react-router';
// Components
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import RecipeResultCard from './RecipeResultCard';
import { UploadRecipeToSupabase } from './UploadRecipeToSupabase';
import AuthGuardModal from '../../components/AuthGuardModal';
// CSS
import styles from './CreateAIRecipe.module.css';
import { getOpenInteractionType } from '@mui/material/Select';
import { RecipeJsonToMarkdown } from './RecipeJsonToMarkdown';
import { getCurrentAlanClientId, getNextAlanClientId, isFailoverError } from '../../utils/AlanApi';

const API_BASE = '/api/v1';
const ALAN_CLIENT_ID = import.meta.env.VITE_ALAN_CLIENT_ID;
const OPEN_AI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const FALLBACK_URL = 'https://dummyimage.com/1024x1024/f26b3a/ffffff.png&text=No+Image';

export default function CreateAIRecipe() {
  const navigate = useNavigate();
  const { user } = useAuth();

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
    image: false,
    substitutes: false,
    shoppinglist: false,
  });

  // 셀렉트 박스 화살표 상태
  const [openSelects, setOpenSelects] = useState({});

  // 게시 상태
  const [isPublishing, setIsPublishing] = useState(false);

  const toggleSelect = (field) => {
    setOpenSelects((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const closeSelect = (field) => {
    setOpenSelects((prev) => ({ ...prev, [field]: false }));
  };

  // 🔒 로그인 유도 모달 상태 추가
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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
   * @param {Object} options - { image, substitutes, shoppinglist }
   * @returns {string} 프롬프트에 추가될 요구사항 문자열
   */
  const buildOutputOptionsPrompt = (options) => {
    const requirements = [];

    if (options.substitutes) {
      requirements.push('- [곁들이기 추천] 이 요리와 잘 어울리는 반찬, 국, 또는 음료/주류 추천 1~2가지를 포함해줘.');
    }

    if (options.shoppinglist) {
      requirements.push(
        '- [장보기 체크리스트] 마트에서 바로 살 수 있도록 주재료와 양념류를 구획한 체크리스트(- [ ] 형태)를 마크다운 하단에 작성해줘.',
      );
    }

    return requirements.length > 0 ? `\n[결과 옵션]\n${requirements.join('\n')}` : '';
  };

  // 헬퍼 함수: OpenAI 이미지 생성 단일 요청
  async function fetchOpenAIImage(promptText) {
    try {
      const res = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPEN_AI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-image-2',
          prompt: promptText,
          n: 1,
          size: '1024x1024',
          quality: 'low',
          output_format: 'png',
        }),
      });

      if (!res.ok) return null;
      const result = await res.json();
      const rawBase64 = result?.data?.[0]?.b64_json;
      return rawBase64 ? `data:image/png;base64,${rawBase64}` : null;
    } catch {
      return null;
    }
  }

  // 레시피 생성하기
  const handleGenerateRecipe = async (e) => {
    if (e) e.preventDefault();

    setLoadingStep('prompt');
    setResult(null);

    try {
      // [Step 1] Alan AI 텍스트 생성
      // 💡 백틱 내부의 들여쓰기와 줄바꿈을 완벽히 제거한 1줄 프롬프트
      const systemPrompt =
        `You are a professional chef AI. Create a recipe in pure JSON format matching user conditions. [Rules] 1.Return ONLY a single valid JSON object. Do NOT include markdown blocks (\`\`\`json), greetings, or extra explanations. 2.JSON field values MUST be in KOREAN. [User Request] ${prompt} [Conditions] Ingredients: ${ingredients.join(', ')} / Servings: ${conditions.servings} / Time: ${conditions.cookingTime} / Difficulty: ${conditions.difficulty} / Cuisine: ${conditions.cuisine} / Exclude: ${excluded.length > 0 ? excluded.join(', ') : 'None'} [JSON Schema] {"title":"Korean Title","summary":"Korean Summary","cuisine":"${conditions.cuisine || '기타'}","cooking_time":"${conditions.cookingTime || '30분 이내'}","difficulty":"${conditions.difficulty || '보통'}","servings":"${conditions.servings || '2인분'}","tags":["Tag1","Tag2"],"ingredients":[{"name":"Korean Ingredient and amount","isSubstitutable":false,"substituteName":""}],"steps":[{"step":1,"title":"Korean Title","description":"Korean Description","tip":""}]}`
          .replace(/\s+/g, ' ')
          .trim();

      let alanClientId = getCurrentAlanClientId();
      let response = null;

      while (alanClientId) {
        const queryString = new URLSearchParams({
          content: systemPrompt,
          client_id: alanClientId,
        }).toString();

        let res = null;

        // 1. 네트워크 통신 시도 (네트워크 끊김 시에만 ALAN CLIENT ID 전환)
        try {
          res = await fetch(`${API_BASE}/question?${queryString}`);
        } catch (netErr) {
          console.warn(`[Alan AI] 네트워크 통신 에러 발생. 다음 Client ID로 전환합니다.`, netErr);
          alanClientId = getNextAlanClientId();
          continue;
        }

        // 2. 성공 응답 처리
        if (res.ok) {
          response = res;
          break;
        }

        // 3. Status 코드별 분기 처리
        // 💡 401, 500일 때만 키 전환 후 다음 루프 실행
        if (isFailoverError(res.status)) {
          console.warn(
            `[Alan AI] Status ${res.status} 감지 (Client ID: ${alanClientId}). 다음 Client ID로 전환합니다.`,
          );
          alanClientId = getNextAlanClientId();
        } else {
          // 💡 401, 500이 아닌 기타 에러 발생 시 전체 실행을 중단합니다.
          throw new Error(`Alan API 요청 실패 (Status: ${res.status})`);
        }
      }

      if (!response) {
        throw new Error('모든 Alan Client ID 할당량이 소진되었거나 요청에 실패했습니다.');
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

      // [Step 2] Open AI 이미지 생성
      setLoadingStep('image');

      try {
        const mainTitle = parsedRecipeJson.title || '요리';

        // 1. 썸네일 생성 프롬프트
        const thumbnailPrompt = `Professional studio food photography of ${mainTitle}, ${conditions.cuisine} cuisine, beautifully plated, warm lighting, 4k.`;
        const thumbnailUrl = (await fetchOpenAIImage(thumbnailPrompt)) || FALLBACK_URL;
        parsedRecipeJson.thumbnail_url = thumbnailUrl;

        // 2. 단계별 이미지 순차 생성 (429 Rate Limit 방지를 위한 딜레이 적용)
        if (options.image && parsedRecipeJson.steps?.length > 0) {
          const updatedSteps = [];

          for (let i = 0; i < parsedRecipeJson.steps.length; i++) {
            const step = parsedRecipeJson.steps[i];
            // 🛠️ 개선된 단계별 프롬프트 템플릿
            const stepPrompt = `A close-up instruction photo of a cooking step: "${step.title}". Focus on the action: ${step.description.slice(0, 100)}. Food preparation process shot, culinary style. Do NOT show the final dish, only this specific preparation step.`;
            // 딜레이 함수 (요청과 요청 사이 1.5초 대기)
            if (i > 0) {
              await new Promise((resolve) => setTimeout(resolve, 1500));
            }

            console.log(`[Image Gen] Step ${step.step} 이미지 생성 중...`);
            const stepImageUrl = await fetchOpenAIImage(stepPrompt);

            updatedSteps.push({
              ...step,
              image: stepImageUrl || null,
            });
          }

          parsedRecipeJson.steps = updatedSteps;
        } else {
          parsedRecipeJson.steps = parsedRecipeJson.steps.map((step) => ({
            ...step,
            image: null,
          }));
        }
      } catch (error) {
        console.error('단계별 이미지 생성 실패:', error);
      }

      // [Step 3] 최종 결과 저장
      setResult({
        thumbnail: parsedRecipeJson.thumbnail_url,
        markdown: markdownContent,
        raw: parsedRecipeJson,
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

  // 레시피 Supabase에 등록하기
  const handlePublish = async () => {
    if (!result || !result.raw) {
      alert('저장할 레시피 데이터가 없습니다. 먼저 레시피를 생성해 주세요.');
      return;
    }

    // 1. 비회원 처리: AuthGuardModal 팝업
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    // 2. 회원 처리: Supabase 업로드 및 DB Insert 실행
    try {
      setIsPublishing(true);

      const response = await UploadRecipeToSupabase(result.raw, user);

      if (response.success && response.savedRecipe) {
        alert('레시피가 DB 및 스토리지에 성공적으로 등록되었습니다!');

        // 3. 등록 성공 후 '등록하기' 페이지로 라우팅
        navigate(`/register?id=${response.savedRecipe.id}`);
      } else {
        alert(`레시피 등록에 실패했습니다: ${response.detail || response.error}`);
      }
    } catch (error) {
      console.error('게시하기 처리 중 에러:', error);
      alert('레시피를 게시하는 도중 오류가 발생했습니다.');
    } finally {
      setIsPublishing(false);
    }
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

                  <button
                    type="button"
                    className={styles.publishBtn}
                    onClick={handlePublish}
                    disabled={isPublishing}
                    style={{
                      cursor: isPublishing ? 'not-allowed' : 'pointer',
                      opacity: isPublishing ? 0.7 : 1,
                    }}
                  >
                    {isPublishing ? '게시 중...' : '🚀 게시하기'}
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

      {/* 🔒 비회원 전용 로그인 유도 모달 추가 */}
      <AuthGuardModal
        open={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        message="게시하기 기능은 로그인 후 이용하실 수 있습니다."
      />
    </Layout>
  );
}
