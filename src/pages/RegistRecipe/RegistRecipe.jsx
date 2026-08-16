// RegistRecipe.jsx
import React from 'react';
import Layout from '../../components/Layout';
import SEO from '../../components/SEO';
import styles from './RegistRecipe.module.css';
// Custom Hook
import { useRegistRecipe } from './hooks/useRegistRecipe';
// Separated step-by-step UI components
import Step1BasicInfo from './components/Step1BasicInfo';
import Step2Ingredients from './components/Step2Ingredients';
import Step3Steps from './components/Step3CookingSteps';
import Step4Image from './components/Step4Image';
import Step5Options from './components/Step5Options';
// Access Control Modal Component
import AccessGuardModal from './components/AccessGuardModal';

/* ==========================================================================
   Main RegistRecipe 페이지 컴포넌트
   ========================================================================== */
export default function RegistRecipe() {
  const {
    // [메인] RegistRecipe 전용
    currentStep,
    steps,
    formData,
    updateFormData,
    isLoadingPreset,
    isSaving,
    goToStep,
    isAccessModalOpen,
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
    handleItemChange,

    // [Step 3] 조리 과정 입력 전용
    cookingSteps,
    handleTipChange,
    handleResetTip,

    // [Step 4] 이미지 확인 전용
    thumbnail,
    hasStepImages,
    stepGridItems,
    handleThumbnailChange,

    // [Step 5] 최종 미리보기 & 공개 옵션 전용
    options,
    handleOptionChange,
  } = useRegistRecipe();

  // 현재 단계별 서브 컴포넌트 렌더링 맵
  const renderStepComponent = () => {
    if (isLoadingPreset) {
      return (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--brand-gray)' }}>
          레시피 데이터를 불러오는 중입니다...
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   Step 3 컴포넌트: 조리 과정 및 단계별 팁 입력
   ========================================================================== */
function Step3Steps({ formData, updateFormData }) {
  // 생성된 조리 과정 더미 데이터 (기존 입력값이 없는 경우 초기 세팅)
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

  // 상위 formData 동기화
  const handleTipChange = (index, value) => {
    const updatedSteps = cookingSteps.map((step, idx) => (idx === index ? { ...step, tip: value || null } : step));
    setCookingSteps(updatedSteps);
    updateFormData('cookingSteps', updatedSteps);
  };

  // 특정 단계의 특정 필드 값 수정
  const handleStepChange = (index, field, value) => {
    const updatedSteps = cookingSteps.map((step, i) => (i === index ? { ...step, [field]: value } : step));
    syncSteps(updatedSteps);
  };

  // 특정 단계의 Tip 내용만 초기화하는 함수
  const handleResetTip = (index) => {
    handleTipChange(index, '');
  };

  return (
    <div className={styles.stepContent}>
      {/* 폼 제목 */}
      <div className={styles.stepTitle}>
        <h3 className="text-xl" style={{ fontWeight: 600, color: 'var(--brand-brown)' }}>
          🍳 3단계: 조리 과정 등록
        </h3>
        <p className="text-m" style={{ color: 'var(--brand-gray)', marginTop: '8px' }}>
          AI가 생성한 조리 순서를 확인하고, 각 단계별로 나만의 노하우나 조리 팁을 남겨보세요.
        </p>
      </div>

      <div className={styles.titleDivider} />

      {/* 조리 단계 카드 목록 */}
      <div className={styles.cookingStepsContainer}>
        {cookingSteps.map((step, idx) => (
          <div key={step.stepNumber} className={styles.stepCardItem}>
            {/* 단계 번호 배지 & 라벨 헤더 */}
            <div className={styles.stepHeaderRow}>
              <span className={styles.stepNumberBadge}>STEP {step.stepNumber}</span>
              {/* <span className={styles.readOnlyBadge}>🔒 Read Only</span> */}
            </div>

            {/* 조리 과정 내용 (ReadOnly) */}
            <div className={styles.inputGroup} style={{ marginBottom: '14px' }}>
              <textarea className={styles.readOnlyTextarea} value={step.instruction} readOnly rows={2} />
            </div>

            {/* 단계별 조리 팁 입력 필드 (Nullable) */}
            <div className={styles.inputGroup}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label className={styles.tipInputLabel}>
                  💡 나만의 조리 팁 <span className={styles.optionalTag}>(선택)</span>
                </label>

                {/* Tip 초기화 버튼 */}
                <button
                  type="button"
                  onClick={() => handleResetTip(idx)}
                  disabled={!step.tip} // 팁 내용이 없을 때는 비활성화
                  style={{
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: step.tip ? 'var(--brand-primary, #f05a24)' : '#ccc',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: step.tip ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 6px',
                  }}
                  title="팁 내용 초기화"
                >
                  <span>❌</span>
                  <span>삭제</span>
                </button>
              </div>

              {/* <input
                type="text"
                className={styles.textInput}
                value={step.tip || ''}
                onChange={(e) => handleTipChange(idx, e.target.value)}
                placeholder="예: 불 조절이나 대체재 정보, 맛있게 만드는 꿀팁을 적어주세요."
              /> */}
              <textarea
                className={styles.textareaInput}
                value={step.tip || ''}
                onChange={(e) => handleTipChange(idx, e.target.value)}
                placeholder="예: 불 조절이나 대체재 정보, 맛있게 만드는 꿀팁을 적어주세요."
                rows={2}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ==========================================================================
   Step 4 컴포넌트: 이미지 확인 및 썸네일 업로드
   ========================================================================== */
function Step4Image({ formData, updateFormData }) {
  // 썸네일 이미지 상태 (AI 생성 기본값 또는 사용자 직접 업로드 파일)
  const [thumbnail, setThumbnail] = useState(
    formData.thumbnail || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
  );

  // 단계별 조리 과정 이미지 목록 (ReadOnly 갤러리용 더미 데이터)
  const stepImages = formData.stepImages || [
    { stepNumber: 1, url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=400&q=80' },
    { stepNumber: 2, url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80' },
    {
      stepNumber: 3,
      url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=400&q=80',
    },
    {
      stepNumber: 4,
      url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=400&q=80',
    },
  ];

  // 사용자가 파일 선택 시 썸네일 프리뷰 교체
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setThumbnail(imageUrl);
      updateFormData('thumbnail', imageUrl);
    }

    switch (currentStep) {
      case 2:
        return <Step2Ingredients ingredients={ingredients} handleItemChange={handleItemChange} />;
      case 3:
        return (
          <Step3Steps cookingSteps={cookingSteps} handleTipChange={handleTipChange} handleResetTip={handleResetTip} />
        );
      case 4:
        return (
          <Step4Image
            thumbnail={thumbnail}
            hasStepImages={hasStepImages}
            stepGridItems={stepGridItems}
            handleThumbnailChange={handleThumbnailChange}
          />
        );
      case 5:
        return <Step5Options formData={formData} options={options} handleOptionChange={handleOptionChange} />;
      case 1:
      default:
        return (
          <Step1BasicInfo
            formData={formData}
            updateFormData={updateFormData}
            newTag={newTag}
            setNewTag={setNewTag}
            isAddingTag={isAddingTag}
            setIsAddingTag={setIsAddingTag}
            handleAddTag={handleAddTag}
            handleRemoveTag={handleRemoveTag}
          />
        );
    }
  };

  // URL에 id가 있는 경우 Supabase에서 레시피 프리셋 불러오기
  useEffect(() => {
    if (!recipeId) return;

    const fetchRecipePreset = async () => {
      try {
        setIsLoadingPreset(true);

        const { data, error } = await supabase.from('recipes').select('*').eq('id', recipeId).single();

        if (error) {
          console.error('레시피 프리셋 조회 실패:', error.message);
          return;
        }

        if (data) {
          setFormData({
            // step 1
            title: data.title || '',
            description: data.summary || '',
            category: data.cuisine || '한식',
            cookingTime: data.cooking_time || '10분 이내',
            difficulty: data.difficulty || '초간단',
            servings: data.servings || '1인분',
            tags: data.tags || [],
            diet_goal: data.diets || '해당없음',
            // step 2
            ingredients: data.ingredients || [],
            // step 3
            cookingSteps: data.steps || [],
            // step 4
            images: data.steps?.map((s) => s.image).filter(Boolean) || [],
            thumbnail_url: data.thumbnail_url || '',
            // step 5
            isPublic: true, // ***컬럼 추가***
          });
        }
      } catch (err) {
        console.error('프리셋 로딩 중 오류:', err);
      } finally {
        setIsLoadingPreset(false);
      }
    };

    fetchRecipePreset();
  }, [recipeId]);

  // [가장 최근 임시저장 프리셋 불러오기]
  const handleLoadRecentDraft = async () => {
    try {
      setIsLoadingPreset(true);

      // isTempSaved가 true인 데이터 중 가장 최신의 것 1건 조회
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
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
          isPublic: true,
        });

        setIsAccessModalOpen(false);
        alert('최근에 임시 저장된 레시피 데이터를 성공적으로 불러왔습니다!');
      } else {
        // 임시저장 레시피가 DB에 없는 경우
        alert('임시 저장된 레시피가 없습니다. 레시피 생성 페이지로 이동합니다.');
        setIsAccessModalOpen(false);
        navigate('/ai', { replace: true });
      }
    } catch (err) {
      console.error('임시 저장 데이터 불러오기 실패:', err);
      alert('임시 저장 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoadingPreset(false);
    }
  };

  // [레시피 생성하기]
  const handleGoToCreatePage = () => {
    setIsAccessModalOpen(false);
    navigate('/ai', { replace: true });
  };

  // [임시저장]
  const handleSaveDraft = async () => {
    try {
      setIsSaving(true);

      // 1. 현재 로그인한 유저 세션 가져오기
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        alert('로그인이 필요합니다. 로그인 후 임시 저장을 이용해 주세요.');
        return;
      }

      // 2. formData를 UploadRecipeToSupabase 규격에 맞게 매핑
      const recipeRawData = {
        title: formData.title,
        summary: formData.description,
        cuisine: formData.category,
        cooking_time: formData.cookingTime,
        difficulty: formData.difficulty,
        servings: formData.servings,
        tags: formData.tags,
        diets: formData.diet_goal,
        ingredients: formData.ingredients,
        steps: formData.cookingSteps,
        thumbnail_url: formData.thumbnail_url,
      };

      // 3. 이미 생성된 임시저장 ID가 있는 경우: UPDATE 실행
      if (savedDraftId) {
        const result = await UploadRecipeToSupabase(recipeRawData, user, true, savedDraftId);

        if (result.success) {
          alert('임시 저장된 레시피가 수정 반영되었습니다.');
        } else {
          alert(`임시 저장 수정 실패: ${result.detail || result.error}`);
        }
      }
      // 4. 처음 임시저장을 누른 경우: INSERT 실행 후 반환된 ID 보관
      else {
        const result = await UploadRecipeToSupabase(recipeRawData, user, true);

        if (result.success && result.savedRecipe) {
          setSavedDraftId(result.savedRecipe.id);
          alert('현재 작성 중인 레시피가 임시 저장되었습니다.');
        } else {
          alert(`임시 저장 실패: ${result.detail || result.error}`);
        }
      }
    } catch (err) {
      console.error('임시 저장 실패:', err);
      alert('임시 저장 도중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Layout activeMenu="AI 레시피">
      <SEO
        title="레시피 등록하기 | 깃깔나는 레시피"
        description="단계별로 입력하면 완성! AI 도우미가 작성을 도와드려요."
        url="/register"
      />
      <div className="container" style={{ paddingTop: '20px', paddingBottom: '60px' }}>
        {/* 상단 타이틀 영역 */}
        <div className={styles.headerArea}>
          <h1 className="font-display dtext-4xl" style={{ marginBottom: '12px' }}>
            레시피 등록하기
          </h1>
          <p className="text-lg" style={{ color: 'var(--brand-gray)' }}>
            단계별로 입력하면 완성! AI 도우미가 작성을 도와드려요.
          </p>
        </div>

        {/* 5단계 인디케이터 바 */}
        <div className={styles.stepNav}>
          {steps.map((step) => {
            const isActive = currentStep === step.id;
            return (
              <button
                key={step.id}
                type="button"
                className={`${styles.stepPill} ${isActive ? styles.activeStepPill : ''}`}
                onClick={() => goToStep(step.id)}
              >
                <span className={styles.stepNumber}>{step.id}</span>
                <span>{step.label}</span>
              </button>
            );
          })}
        </div>

        {/* 메인 단계별 입력 폼 카드 */}
        <div className={styles.formCard}>{renderStepComponent()}</div>

        {/* 하단 액션 버튼 바 */}
        <div className={styles.bottomActionBar}>
          <div className={styles.leftActions}>
            <button
              type="button"
              className={styles.actionBtn}
              onClick={handleSaveDraft}
              disabled={isSaving}
              data-tooltip="임시 저장"
            >
              <span className={styles.btnIcon}>💾</span>
              <span className={styles.btnText}>{isSaving ? '저장 중...' : '임시 저장'}</span>
            </button>

            <button
              type="button"
              className={styles.actionBtn}
              onClick={handleLoadRecentDraft}
              disabled={isSaving}
              data-tooltip="불러오기"
            >
              <span className={styles.btnIcon}>📁</span>
              <span className={styles.btnText}>불러오기</span>
            </button>
          </div>

          <div className={styles.rightActions}>
            <button
              type="button"
              className={`${styles.navBtn} ${currentStep === 1 ? styles.disabledBtn : ''}`}
              onClick={() => goToStep(currentStep - 1)}
              disabled={currentStep === 1}
              data-tooltip="이전 단계"
            >
              <span className={styles.btnIcon}>‹</span>
              <span className={styles.btnText}>이전</span>
            </button>

            <button
              type="button"
              className={styles.nextBtn}
              onClick={() => {
                if (currentStep === steps.length) {
                  handleFinalSubmit();
                } else {
                  goToStep(currentStep + 1);
                }
              }}
              data-tooltip={currentStep === steps.length ? '완성하기' : '다음 단계'}
            >
              <span className={styles.btnText}>{currentStep === steps.length ? '완성하기' : '다음'}</span>
              <span className={styles.btnIcon}>›</span>
            </button>
          </div>
        </div>
      </div>

      {/* 🚨 잘못된 접근 및 프리셋 없음 통합 MUI 모달 */}
      <AccessGuardModal
        isOpen={isAccessModalOpen}
        handleLoadRecentDraft={handleLoadRecentDraft}
        handleGoToCreatePage={handleGoToCreatePage}
      />
    </Layout>
  );
}
