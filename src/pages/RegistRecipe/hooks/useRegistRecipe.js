import { useState, useEffect } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router';
import { supabase } from '../../../lib/supabaseClient';
import { useNotification } from '../../../context/NotificationContext';
import { UploadRecipeToSupabase } from './UploadRecipeToSupabase';

export function useRegistRecipe() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [searchParams, setSearchParams] = useSearchParams();

  // CreateAIRecipe에서 라우팅으로 넘어온 JSON 데이터
  const aiRecipePreset = location.state?.recipe || null;
  const isFromAICreater = location.state?.isFromAICreater || false;

  const steps = [
    { id: 1, label: '기본 정보' },
    { id: 2, label: '재료' },
    { id: 3, label: '조리 과정' },
    { id: 4, label: '이미지' },
    { id: 5, label: '미리 보기' },
  ];

  const currentStep = parseInt(searchParams.get('step') || '1', 10);

  // 통합 폼 상태 데이터
  const [formData, setFormData] = useState(() => {
    if (aiRecipePreset) {
      const parsedData = {
        // step 1
        title: aiRecipePreset.title || '',
        description: aiRecipePreset.summary || '',
        category: aiRecipePreset.cuisine || '한식',
        cookingTime: aiRecipePreset.cooking_time || '10분 이내',
        difficulty: aiRecipePreset.difficulty || '초간단',
        servings: aiRecipePreset.servings || '1인분',
        tags: aiRecipePreset.tags || [],
        diet_goal: aiRecipePreset.diets || '해당없음',
        // step 2
        ingredients: aiRecipePreset.ingredients || [],
        // step 3
        cookingSteps: aiRecipePreset.steps || [],
        // step 4
        images: aiRecipePreset.steps?.map((s) => s.image).filter(Boolean) || [],
        thumbnail_url: aiRecipePreset.thumbnail_url || '',
        // step 5
        isPublic: true,
      };

      return parsedData;
    }

    return {
      // step 1
      title: '',
      description: '',
      category: '한식',
      cookingTime: '10분 이내',
      difficulty: '초간단',
      servings: '1인분',
      tags: [],
      diet_goal: '해당없음',
      // step 2
      ingredients: [],
      // step 3
      cookingSteps: [],
      // step 4
      images: [],
      thumbnail_url: '',
      // step 5
      isPublic: true,
    };
  });

  // 상태 업데이트 함수
  const updateFormData = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // 잘못된 접근 안내 모달 상태
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);

  /* ==========================================================================
   Step 1 컴포넌트: 기본 정보 입력
   ========================================================================== */
  const [newTag, setNewTag] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);

  const handleAddTag = () => {
    if (!newTag.trim()) {
      setIsAddingTag(false);
      return;
    }
    const formattedTag = newTag.trim().startsWith('#') ? newTag.trim() : `#${newTag.trim()}`;
    if (!formData.tags.includes(formattedTag)) {
      updateFormData('tags', [...formData.tags, formattedTag]);
    }
    setNewTag('');
    setIsAddingTag(false);
  };

  const handleRemoveTag = (tagToRemove) => {
    updateFormData(
      'tags',
      formData.tags.filter((tag) => tag !== tagToRemove),
    );
  };

  /* ==========================================================================
   Step 2 컴포넌트: 재료 목록 입력
   ========================================================================== */
  // 재료 목록 상태 관리
  const [ingredients, setIngredients] = useState(() => {
    if (formData.ingredients && formData.ingredients.length > 0) {
      return formData.ingredients.map((item, idx) => ({
        id: item.id || `item-${idx + 1}`,
        name: item.name || (typeof item === 'string' ? item : ''),
        isSubstitutable: Boolean(item.isSubstitutable),
        substituteName: item.substituteName || '',
      }));
    }

    // 기본 초기 데이터
    return [
      { id: 'item-1', name: '닭가슴살', isSubstitutable: true, substituteName: '두부' },
      { id: 'item-2', name: '양파', isSubstitutable: false, substituteName: '' },
      { id: 'item-3', name: '고추장', isSubstitutable: false, substituteName: '' },
    ];
  });

  // formData와 동기화
  const handleItemChange = (itemId, field, value) => {
    const updatedList = ingredients.map((item) => {
      if (item.id === itemId) {
        // 대체 가능 체크를 해제할 경우 대체 재료 이름도 초기화
        if (field === 'isSubstitutable' && !value) {
          return { ...item, [field]: value, substituteName: '' };
        }
        return { ...item, [field]: value };
      }
      return item;
    });

    setIngredients(updatedList);
    updateFormData('ingredients', updatedList);
  };

  /* ==========================================================================
   Step 3 컴포넌트: 조리 과정 및 단계별 팁 입력
   ========================================================================== */
  // 생성된 조리 과정 더미 데이터
  const [cookingSteps, setCookingSteps] = useState(
    formData.cookingSteps && formData.cookingSteps.length > 0
      ? formData.cookingSteps
      : [
          {
            stepNumber: 1,
            instruction: '양파를 얇게 채썰고, 닭가슴살은 한 입 크기로 잘라 소금, 후추로 밑간합니다.',
            tip: '양파를 수분이 날아가도록 살짝 볶아두면 파스타 풍미가 훨씬 살아납니다.',
          },
          {
            stepNumber: 2,
            instruction: '팬에 올리브유를 두르고 중불에서 손질한 양파와 닭가슴살을 볶아줍니다.',
            tip: '닭고기가 겉면만 노릇하게 익을 때까지만 볶아주어야 질겨지지 않습니다.',
          },
          {
            stepNumber: 3,
            instruction: '고추장 1큰술과 간장 1큰술을 넣고 양념이 잘 배어들도록 1분간 함께 볶습니다.',
            tip: null, // Tip은 Nullable
          },
          {
            stepNumber: 4,
            instruction:
              '우유 200ml와 면수를 약간 넣고 자작하게 끓인 뒤, 삶아둔 파스타 면을 넣고 소스가 자작해질 때까지 버무려 완성합니다.',
            tip: '마지막에 불을 끄고 후추나 파슬리를 살짝 뿌려주면 색감이 더 좋아집니다.',
          },
        ],
  );

  // formData 및 로컬 상태 동기화
  const syncSteps = (updatedSteps) => {
    setCookingSteps(updatedSteps);
    updateFormData('cookingSteps', updatedSteps);
  };

  // 특정 단계의 특정 필드 값 수정
  const handleStepChange = (index, field, value) => {
    const updatedSteps = steps.map((step, i) => (i === index ? { ...step, [field]: value } : step));
    syncSteps(updatedSteps);
  };

  // 조리 팁 수정
  const handleTipChange = (index, value) => {
    const updatedSteps = cookingSteps.map((step, idx) => (idx === index ? { ...step, tip: value || null } : step));
    setCookingSteps(updatedSteps);
    updateFormData('cookingSteps', updatedSteps);
  };

  // 특정 단계의 팁 내용만 초기화하는 함수
  const handleResetTip = (index) => {
    handleTipChange(index, '');
  };

  /* ==========================================================================
   Step 4 컴포넌트: 이미지 확인 및 썸네일 업로드
   ========================================================================== */
  const FALLBACK_THUMBNAIL =
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80';
  const TRANSPARENT_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

  const [thumbnail, setThumbnail] = useState(formData.thumbnail_url || FALLBACK_THUMBNAIL);

  const cookingStepsInst = formData.cookingSteps || [];
  const hasStepImages = cookingSteps.some((step) => step.image);

  const getStepImagesGrid = (stepList = []) => {
    // 조리 단계별로 생성된 이미지 URL 배열 추출
    const validImages = stepList
      .map((step, idx) => ({
        stepNumber: step.step || idx + 1,
        url: step.image || null,
      }))
      .filter((item) => item.url);

    // 4개 이상인 경우: 상위 4개만 추출
    const slicedImages = validImages.slice(0, 4);

    // 4개 미만인 경우: 2x2 그리드 배치를 위해 4개 슬롯 채우기
    const gridItems = Array.from({ length: 4 }, (_, idx) => {
      if (slicedImages[idx]) {
        return { ...slicedImages[idx], isEmpty: false };
      }
      // 이미지가 없거나 4개 미만인 빈 슬롯은 투명 이미지 처리
      return {
        stepNumber: idx + 1,
        url: TRANSPARENT_IMAGE,
        isEmpty: true,
      };
    });

    return gridItems;
  };

  const [stepGridItems, setStepGridItems] = useState(() => getStepImagesGrid(cookingStepsInst));

  // formData 변경 시 썸네일 및 단계별 이미지 자동 업데이트
  useEffect(() => {
    if (formData.thumbnail_url) {
      setThumbnail(formData.thumbnail_url);
    }
    setStepGridItems(getStepImagesGrid(formData.cookingSteps || []));
  }, [formData]);

  // 사용자가 파일 선택 시 썸네일 프리뷰 교체
  // const handleThumbnailChange = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     const imageUrl = URL.createObjectURL(file);
  //     setThumbnail(imageUrl);
  //     updateFormData('thumbnail_url', imageUrl);
  //   }
  // };
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64DataUrl = reader.result;
        setThumbnail(base64DataUrl);
        updateFormData('thumbnail_url', base64DataUrl);
      };

      reader.readAsDataURL(file);
    }
  };

  /* ==========================================================================
   Step 5 컴포넌트: 최종 미리보기 및 공개 옵션 설정
   ========================================================================== */
  // 공개 옵션 상태 관리
  const options = formData.publishOptions || {
    isPublic: true,
    allowAiRecommendation: true,
    allowCommentsAndReviews: true,
  };

  const handleOptionChange = (field, value) => {
    const updatedOptions = { ...options, [field]: value };
    updateFormData('publishOptions', updatedOptions);
  };

  /* ==========================================================================
   Main RegistRecipe 페이지 컴포넌트
   ========================================================================== */
  // URL 쿼리 스트링으로 현재 step 상태 유지
  const recipeId = searchParams.get('id');
  const [savedDraftId, setSavedDraftId] = useState(recipeId || null);

  // 로딩 상태
  const [isLoadingPreset, setIsLoadingPreset] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const isValidAccess = Boolean(isFromAICreater && aiRecipePreset);

    // 모달이 팝업되는 조건 (3가지 중 하나라도 해당 시)
    // 1) 사용자가 직접 브라우저를 새로고침(Reload)한 경우
    // 2) AI 생성 페이지에서 넘어온 플래그(isFromAICreater)가 없는 경우
    // 3) 전달된 레시피 데이터(aiRecipePreset)가 null/undefined인 경우
    if (!isValidAccess) {
      setIsAccessModalOpen(true); // 🚨 AI 생성 진입이 아니라면 무조건 모달 팝업
    } else {
      setIsAccessModalOpen(false);
    }
  }, [location.state]);

  // 단계 이동
  const goToStep = (stepNumber) => {
    if (stepNumber >= 1 && stepNumber <= steps.length) {
      setSearchParams({ step: stepNumber }, { state: location.state });
      window.scrollTo({
        top: 0,
      });
    }
  };

  // [불러오기] 버튼 클릭 이벤트
  const handleLoadRecentDraft = async () => {
    try {
      setIsLoadingPreset(true);

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setIsAccessModalOpen(false);
        showNotification('로그인이 필요한 기능입니다.', 'warning');
        navigate('/login', {
          state: { from: location.pathname },
        });
        return;
      }

      // isTempSaved가 true인 데이터 중 가장 최신의 것 1건 조회
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('user_id', user.id)
        .eq('istempsaved', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        // Supabase DB 데이터를 formData 형태로 바인딩
        setFormData({
          title: data.title || '',
          description: data.summary || '',
          category: data.cuisine || '한식',
          cookingTime: data.cooking_time || '10분 이내',
          difficulty: data.difficulty || '초간단',
          servings: data.servings || '1인분',
          tags: data.tags || [],
          diet_goal: data.diets || '해당없음',
          ingredients: data.ingredients || [],
          cookingSteps: data.steps || [],
          images: data.steps?.map((s) => s.image).filter(Boolean) || [],
          thumbnail_url: data.thumbnail_url || '',
          isPublic: data.ispublic ?? true,
        });

        // 💡 2. Step 2 (재료) 독립 상태 동기화
        if (data.ingredients && data.ingredients.length > 0) {
          setIngredients(
            data.ingredients.map((item, idx) => ({
              id: item.id || `item-${idx + 1}`,
              name: item.name || (typeof item === 'string' ? item : ''),
              isSubstitutable: Boolean(item.isSubstitutable),
              substituteName: item.substituteName || '',
            })),
          );
        }

        // 💡 3. Step 3 (조리 과정) 독립 상태 동기화
        if (data.steps && data.steps.length > 0) {
          setCookingSteps(data.steps);
        }

        // 💡 4. Step 4 (대표 썸네일) 독립 상태 동기화
        if (data.thumbnail_url) {
          setThumbnail(data.thumbnail_url);
        }

        if (setSavedDraftId) {
          setSavedDraftId(data.id);
        }

        setIsAccessModalOpen(false);
        showNotification('최근에 임시 저장된 레시피 데이터를 성공적으로 불러왔습니다!', 'success');
      } else {
        // 임시저장 레시피가 DB에 없는 경우
        setIsAccessModalOpen(false);
        showNotification('임시 저장된 레시피가 없습니다. 레시피 생성 페이지로 이동합니다.', 'info');
        navigate('/ai', { replace: true });
      }
    } catch (err) {
      console.error('임시 저장 데이터 불러오기 실패:', err);
      alert('임시 저장 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoadingPreset(false);
    }
  };

  // [레시피 생성하기] 버튼 클릭 이벤트
  const handleGoToCreatePage = () => {
    setIsAccessModalOpen(false);
    navigate('/ai', { replace: true });
  };

  /**
   * 💡 공통 레시피 저장/업데이트 함수
   * @param {boolean} isTemp - true: 임시 저장, false: 최종 제출
   */
  const submitRecipe = async (isTempSaved = false) => {
    try {
      if (isTempSaved) setIsSaving(true);

      // 1. 로그인 유저 검증
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        showNotification('로그인이 필요한 서비스입니다.', 'warning');
        return { success: false };
      }

      // 2. 대체 재료를 기존 재료에 Concat
      const formattedIngredients = (formData.ingredients || []).map((item) => {
        if (item.isSubstitutable && item.substituteName?.trim()) {
          const baseName = item.name?.trim() || '';
          const subName = item.substituteName.trim();
          const finalName = baseName.includes(`(${subName})`) ? baseName : `${baseName}(${subName})`;

          return { ...item, name: finalName };
        }
        return item;
      });

      // 3. 공통 페이로드 생성
      const recipeRawData = {
        title: formData.title,
        summary: formData.description,
        cuisine: formData.category,
        cooking_time: formData.cookingTime,
        difficulty: formData.difficulty,
        servings: formData.servings,
        tags: formData.tags,
        diets: formData.diet_goal,
        ingredients: formattedIngredients,
        steps: formData.cookingSteps,
        thumbnail_url: formData.thumbnail_url,
        ispublic: formData.publishOptions?.isPublic ?? true,
      };

      // 4. Supabase DB 저장/수정 요청
      const result = await UploadRecipeToSupabase(recipeRawData, user, isTempSaved, savedDraftId);

      if (result.success && result.savedRecipe) {
        // 신규 저장인 경우 발행된 id 기록 (이후 임시저장/완성 시 UPDATE 처리)
        if (!savedDraftId) {
          setSavedDraftId(result.savedRecipe.id);
        }
        return { success: true, recipeId: result.savedRecipe.id };
      } else {
        showNotification(`저장 실패: ${result.detail || result.error}`, 'error');
        return { success: false };
      }
    } catch (err) {
      console.error('레시피 저장 처리 실패:', err);
      showNotification('저장 처리 중 오류가 발생했습니다.', 'error');
      return { success: false };
    } finally {
      if (isTempSaved) setIsSaving(false);
    }
  };

  // [임시 저장] 버튼 클릭 이벤트
  const handleSaveDraft = async () => {
    const result = await submitRecipe(true); // isTemp = true
    if (result.success) {
      showNotification('작성 중인 내용이 임시 저장되었습니다.', 'success');
    }
  };

  // [완성하기] 버튼 클릭 이벤트
  const handleFinalSubmit = async () => {
    const result = await submitRecipe(false); // isTemp = false
    if (result.success) {
      showNotification('레시피가 성공적으로 등록되었습니다!', 'success');
      navigate(`/recipes/${result.recipeId}`, { replace: true });
    }
  };

  return {
    // [메인] RegistRecipe.jsx 메인 컨테이너 전용
    currentStep,
    steps,
    formData,
    updateFormData,
    isLoadingPreset,
    isSaving,
    savedDraftId,
    goToStep,
    isAccessModalOpen,
    setIsAccessModalOpen,
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
    setIngredients,
    handleItemChange,

    // [Step 3] 조리 과정 입력 전용
    cookingSteps,
    setCookingSteps,
    handleStepChange,
    handleTipChange,
    handleResetTip,

    // [Step 4] 이미지 확인 전용
    thumbnail,
    setThumbnail,
    hasStepImages,
    stepGridItems,
    handleThumbnailChange,

    // [Step 5] 최종 미리보기 & 공개 옵션 전용
    options,
    handleOptionChange,
  };
}
