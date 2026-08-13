import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabaseClient';
import { RecipeJsonToMarkdown } from '../RecipeJsonToMarkdown';
import { getCurrentAlanClientId, getNextAlanClientId, isFailoverError } from '../../../utils/AlanApi';
import { UploadRecipeToSupabase } from '../UploadRecipeToSupabase';

const API_BASE = '/api/v1';
const OPEN_AI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const FALLBACK_URL = 'https://dummyimage.com/1024x1024/f26b3a/ffffff.png&text=No+Image';

export function useAiRecipe() {
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
    servings: '1인분',
    cookingTime: '10분 이내',
    difficulty: '초간단',
    cuisine: '한식',
    dietGoal: '해당없음',
  });

  // Step 4: 결과 생성 옵션
  const [options, setOptions] = useState({
    image: false,
    shoppinglist: false,
  });

  // 셀렉트 박스 화살표 상태
  const [openSelects, setOpenSelects] = useState({});

  // 게시 상태
  const [isPublishing, setIsPublishing] = useState(false);

  // 🔒 로그인 유도 모달 상태
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // 하단 추가 수정 프롬프트 상태
  const [refinePrompt, setRefinePrompt] = useState('');

  // 로딩 & 결과 상태
  const [loadingStep, setLoadingStep] = useState(null);
  const [result, setResult] = useState(null);

  const toggleSelect = (field) => {
    setOpenSelects((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const closeSelect = (field) => {
    setOpenSelects((prev) => ({ ...prev, [field]: false }));
  };

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

  // OpenAI 이미지 생성 요청
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
      const responseData = await res.json();
      const rawBase64 = responseData?.data?.[0]?.b64_json;
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
      const shoppingListInstruction = options.shoppinglist
        ? `Include "shopping_list" array containing ONLY ingredients NOT in the available ingredients list [${ingredients.join(', ')}]. Format each item string starting with checkbox emoji like "☑️ 재료명 (필요 수량)".`
        : `Set "shopping_list" as empty array [].`;
      const systemPrompt =
        `You are a professional chef AI. Create a recipe in pure JSON format matching user conditions. [Rules] 1.Return ONLY a single valid JSON object. Do NOT include markdown blocks (\`\`\`json), greetings, or extra explanations. 2.JSON field values MUST be in KOREAN. [User Request] ${prompt} [Conditions] Ingredients: ${ingredients.join(', ')} / Servings: ${conditions.servings} / Time: ${conditions.cookingTime} / Difficulty: ${conditions.difficulty} / Cuisine: ${conditions.cuisine} / Diet Goal: ${conditions.dietGoal} / Exclude: ${excluded.length > 0 ? excluded.join(', ') : 'None'} / Shopping List Option: ${shoppingListInstruction} [JSON Schema] {"title":"Korean Title","summary":"Korean Summary","cuisine":"${conditions.cuisine || '기타'}","cooking_time":"${conditions.cookingTime || '30분 이내'}","difficulty":"${conditions.difficulty || '보통'}","servings":"${conditions.servings || '1인분'}","tags":["Tag1","Tag2"],"diets":"${conditions.dietGoal || '해당없음'}","ingredients":[{"name":"Korean Ingredient and amount","isSubstitutable":false,"substituteName":""}],"steps":[{"step":1,"title":"Korean Title","description":"Korean Description","tip":""}],"shopping_list":["☑️ 부족한 재료명 1 (필요 수량)","☑️ 부족한 재료명 2 (필요 수량)"]}`
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
        try {
          res = await fetch(`${API_BASE}/question?${queryString}`);
        } catch (netErr) {
          console.warn(`[Alan AI] 네트워크 통신 에러 발생. 다음 Client ID로 전환합니다.`, netErr);
          alanClientId = getNextAlanClientId();
          continue;
        }

        if (res.ok) {
          response = res;
          break;
        }

        if (isFailoverError(res.status)) {
          console.warn(
            `[Alan AI] Status ${res.status} 감지 (Client ID: ${alanClientId}). 다음 Client ID로 전환합니다.`,
          );
          alanClientId = getNextAlanClientId();
        } else {
          throw new Error(`Alan API 요청 실패 (Status: ${res.status})`);
        }
      }

      if (!response) {
        throw new Error('모든 Alan Client ID 할당량이 소진되었거나 요청에 실패했습니다.');
      }

      const data = await response.json();
      const jsonString =
        data.content || data.answer || (typeof data === 'string' ? data : JSON.stringify(data, null, 2));

      const cleanedJsonString = jsonString
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();

      const parsedRecipeJson = JSON.parse(cleanedJsonString);
      const markdownContent = RecipeJsonToMarkdown(parsedRecipeJson);

      // [Step 2] OpenAI 이미지 생성
      setLoadingStep('image');

      try {
        const mainTitle = parsedRecipeJson.title || '요리';
        const thumbnailPrompt = `Professional studio food photography of ${mainTitle}, ${conditions.cuisine} cuisine, beautifully plated, warm lighting, 4k.`;
        const thumbnailUrl = (await fetchOpenAIImage(thumbnailPrompt)) || FALLBACK_URL;
        parsedRecipeJson.thumbnail_url = thumbnailUrl;

        const currentSteps = Array.isArray(parsedRecipeJson.steps) ? parsedRecipeJson.steps : [];

        if (options.image && parsedRecipeJson.steps?.length > 0) {
          const updatedSteps = [];
          for (let i = 0; i < parsedRecipeJson.steps.length; i++) {
            const step = parsedRecipeJson.steps[i];
            const stepPrompt = `A close-up instruction photo of a cooking step: "${step.title}". Focus on the action: ${step.description.slice(0, 100)}. Food preparation process shot, culinary style. Do NOT show the final dish, only this specific preparation step.`;

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
          // parsedRecipeJson.steps = parsedRecipeJson.steps.map((step) => ({
          //   ...step,
          //   image: null,
          // }));

          parsedRecipeJson.steps = (currentSteps || []).map((step) => ({
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

  // 추가 수정 프롬프트 제출
  const handleRefineSubmit = (e) => {
    e.preventDefault();
    if (!refinePrompt.trim()) return;

    setLoadingStep('prompt');
    setTimeout(() => {
      setLoadingStep(null);
      setResult((prev) => ({
        ...prev,
        markdown: prev.markdown + `\n\n> 💡 **전송한 메세지의 내용**이 적용된 레시피입니다.`,
      }));
      setRefinePrompt('');
    }, 1200);
  };

  // 레시피 Supabase에 게시/등록하기
  const handlePublish = async () => {
    if (!result || !result.raw) {
      alert('저장할 레시피 데이터가 없습니다. 먼저 레시피를 생성해 주세요.');
      return;
    }

    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      setIsPublishing(true);
      const response = await UploadRecipeToSupabase(result.raw, user);

      if (response.success && response.savedRecipe) {
        alert('레시피가 DB 및 스토리지에 성공적으로 등록되었습니다!');
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

  return {
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
    handleRefineSubmit,
    handlePublish,
  };
}
