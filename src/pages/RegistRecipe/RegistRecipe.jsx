import React, { useState } from 'react';
import { useSearchParams } from 'react-router';
import Layout from '../../components/Layout';
import styles from './RegistRecipe.module.css';

/* ==========================================================================
   Step 1 컴포넌트: 기본 정보 입력
   ========================================================================== */
function Step1BasicInfo({ formData, updateFormData }) {
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

  return (
    <div className={styles.stepContent}>
      {/* 폼 제목 */}
      <div className={styles.stepTitle}>
        <h3 className="text-xl" style={{ fontWeight: 600, color: 'var(--brand-brown)' }}>
          📝 1단계: 기본 정보 입력
        </h3>
        <p className="text-m" style={{ color: 'var(--brand-gray)', marginTop: '8px' }}>
          레시피에 대한 기본 정보를 입력하세요.
        </p>
      </div>

      <div className={styles.titleDivider} />

      {/* 레시피 제목 */}
      <div className={styles.inputGroup}>
        <label className={styles.inputLabel}>레시피 제목</label>
        <input
          type="text"
          className={styles.textInput}
          value={formData.title}
          onChange={(e) => updateFormData('title', e.target.value)}
          placeholder="레시피 제목을 입력하세요."
        />
      </div>

      {/* 한 줄 설명 */}
      <div className={styles.inputGroup}>
        <label className={styles.inputLabel}>한 줄 설명</label>
        <textarea
          className={styles.textareaInput}
          value={formData.description}
          onChange={(e) => updateFormData('description', e.target.value)}
          placeholder="레시피에 대한 한 줄 설명이나 소개글을 입력해주세요."
          rows={3}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* 4컬럼 셀렉트 그리드 */}
        <div className={styles.fourColGrid}>
          <div className={styles.selectField}>
            <label className={styles.inputLabel}>카테고리</label>
            <input
              type="text"
              className={styles.textInput}
              value={formData.category || '한식'}
              disabled
              readOnly
              style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed', color: '#666' }}
            />
          </div>

          <div className={styles.selectField}>
            <label className={styles.inputLabel}>조리시간</label>
            <input
              type="text"
              className={styles.textInput}
              value={formData.cookingTime || '30분 이내'}
              disabled
              readOnly
              style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed', color: '#666' }}
            />
          </div>

          <div className={styles.selectField}>
            <label className={styles.inputLabel}>난이도</label>
            <input
              type="text"
              className={styles.textInput}
              value={formData.difficulty || '보통'}
              disabled
              readOnly
              style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed', color: '#666' }}
            />
          </div>

          <div className={styles.selectField}>
            <label className={styles.inputLabel}>인분</label>
            <input
              type="text"
              className={styles.textInput}
              value={formData.servings || '2인분'}
              disabled
              readOnly
              style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed', color: '#666' }}
            />
          </div>
        </div>

        {/* 🔒 수정 불가 안내 문구 */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '6px',
            padding: '0 12px',
            color: 'var(--brand-gray, #666)',
            fontSize: '12px',
          }}
        >
          <span>🔒</span>
          <span>카테고리, 조리시간, 난이도, 인분 항목은 수정할 수 없습니다.</span>
        </div>
      </div>

      {/* 태그 입력 영역 */}
      <div className={styles.inputGroup} style={{ marginTop: '12px' }}>
        <label className={styles.inputLabel}>태그</label>
        <div className={styles.tagList}>
          {formData.tags.map((tag) => (
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
  );
}

/* ==========================================================================
   Step 2 컴포넌트: 재료 목록 입력
   ========================================================================== */
function Step2Ingredients({ formData, updateFormData }) {
  // 기본 필수 재료 ID 목록 (삭제 비활성화용)
  const defaultItemIds = ['item-1', 'item-2', 'item-3'];

  // 1. 기본 재료 목록 상태
  const [defaultIngredients, setDefaultIngredients] = useState(
    formData.defaultIngredients && formData.defaultIngredients.length > 0
      ? formData.defaultIngredients
      : [
          { id: 'item-1', name: '닭가슴살', isSubstitutable: true, substituteName: '두부' },
          { id: 'item-2', name: '양파', isSubstitutable: false, substituteName: '' },
          { id: 'item-3', name: '고추장', isSubstitutable: false, substituteName: '' },
        ],
  );

  // 2. 사용자 추천 재료 목록 상태
  const [customIngredients, setCustomIngredients] = useState(formData.customIngredients || []);

  // 상위 formData와 동기화
  const syncWithFormData = (newDefault, newCustom) => {
    setDefaultIngredients(newDefault);
    setCustomIngredients(newCustom);
    updateFormData('defaultIngredients', newDefault);
    updateFormData('customIngredients', newCustom);
  };

  // '사용자 추천 재료' 항목 추가
  const handleAddCustomItem = () => {
    const newItem = {
      id: `custom-${Date.now()}`,
      name: '',
      isSubstitutable: false,
      substituteName: '',
    };
    syncWithFormData(defaultIngredients, [...customIngredients, newItem]);
  };

  // '사용자 추천 재료' 항목 삭제
  const handleRemoveCustomItem = (itemId) => {
    syncWithFormData(
      defaultIngredients,
      customIngredients.filter((item) => item.id !== itemId),
    );
  };

  // 재료 정보 수정 (기본 재료 / 추천 재료 공용)
  const handleItemChange = (itemId, isCustom, field, value) => {
    const targetList = isCustom ? customIngredients : defaultIngredients;

    const updatedList = targetList.map((item) => {
      if (item.id === itemId) {
        if (field === 'isSubstitutable' && !value) {
          return { ...item, [field]: value, substituteName: '' };
        }
        return { ...item, [field]: value };
      }
      return item;
    });

    if (isCustom) {
      syncWithFormData(defaultIngredients, updatedList);
    } else {
      syncWithFormData(updatedList, customIngredients);
    }
  };

  // 재료 행 및 대체 재료 입력창 공통 렌더링 함수
  const renderIngredientRows = (items, isCustomGroup = false) => {
    return items.map((item) => {
      const isDefaultItem = defaultItemIds.includes(item.id);

      return (
        <React.Fragment key={item.id}>
          {/* 재료 행 */}
          <div className={styles.ingredientRow}>
            {/* 1. 재료명 입력창 */}
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="text"
                className={styles.textInputWithIcon}
                value={item.name}
                onChange={(e) => handleItemChange(item.id, isCustomGroup, 'name', e.target.value)}
                placeholder="예: 닭가슴살"
              />
            </div>

            {/* 2. 대체 가능 여부 체크박스 */}
            <div style={{ width: '80px', display: 'flex', justifyContent: 'center' }}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={item.isSubstitutable}
                  onChange={(e) => handleItemChange(item.id, isCustomGroup, 'isSubstitutable', e.target.checked)}
                />
              </label>
            </div>

            {/* 3. 삭제 버튼 (기본 재료 목록인 경우 비활성화) */}
            <div style={{ width: '36px', display: 'flex', justifyContent: 'center' }}>
              <button
                type="button"
                className={styles.squareDeleteBtn}
                onClick={() => isCustomGroup && handleRemoveCustomItem(item.id)}
                disabled={!isCustomGroup && isDefaultItem}
                title={!isCustomGroup ? '기본 재료는 삭제할 수 없습니다.' : '재료 삭제'}
                style={{
                  opacity: !isCustomGroup && isDefaultItem ? 0.3 : 1,
                  cursor: !isCustomGroup && isDefaultItem ? 'not-allowed' : 'pointer',
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* 4. 대체 가능 체크 시 표시되는 인라인 대체 재료 입력 필드 */}
          {item.isSubstitutable && (
            <div
              className={styles.substituteRow}
              style={{
                display: 'flex',
                alignItems: 'center',
                paddingLeft: '16px',
                marginLeft: '24px',
                marginRight: '116px',
                backgroundColor: 'rgba(240, 90, 36, 0.04)',
                borderRadius: '12px',
                padding: '8px 12px',
                marginBottom: '8px',
              }}
            >
              <span
                style={{
                  marginRight: '8px',
                  color: 'var(--brand-primary, #f05a24)',
                  fontWeight: 'bold',
                }}
              >
                ↳
              </span>
              <input
                type="text"
                className={styles.textInputWithIcon}
                style={{ flex: 1, backgroundColor: '#fff' }}
                value={item.substituteName}
                onChange={(e) => handleItemChange(item.id, isCustomGroup, 'substituteName', e.target.value)}
                placeholder="대체 가능한 재료를 입력하세요 (예: 두부, 돼지고기 안심)"
              />
            </div>
          )}
        </React.Fragment>
      );
    });
  };

  return (
    <div className={styles.stepContent}>
      {/* 폼 제목 */}
      <div className={styles.stepTitle}>
        <h3 className="text-xl" style={{ fontWeight: 600, color: 'var(--brand-brown)' }}>
          🥕 2단계: 재료 목록 입력
        </h3>
        <p className="text-m" style={{ color: 'var(--brand-gray)', marginTop: '8px' }}>
          필요한 재료명과 대체 가능 여부 및 대체 재료를 입력해 주세요.
        </p>
      </div>

      <div className={styles.titleDivider} />

      {/* 1. 기본 '재료 목록' 카드 (삭제 비활성화 / 추가 버튼 없음) */}
      <div className={styles.groupCard}>
        <div className={styles.groupHeaderRow}>
          <div className={styles.groupTitleBadgeWrapper}>
            <span className={styles.groupTitleBadge}>재료 목록</span>
          </div>
        </div>

        {/* 테이블 헤더 */}
        <div className={styles.ingredientTableHeader}>
          <span style={{ flex: 1 }}>재료명</span>
          <div className={styles.tableHeaderRight}>
            <span style={{ width: '80px', textAlign: 'center' }}>대체 가능</span>
            <span style={{ width: '36px' }}></span>
          </div>
        </div>

        {/* 기본 재료 행 목록 */}
        <div className={styles.ingredientRowsContainer}>{renderIngredientRows(defaultIngredients, false)}</div>
      </div>

      {/* 2. '사용자 추천 재료' 카드 (재료 추가 버튼 위치) */}
      <div className={styles.groupCard} style={{ marginTop: '32px' }}>
        <div className={styles.groupHeaderRow}>
          <div className={styles.groupTitleBadgeWrapper}>
            <span className={styles.groupTitleBadge}>사용자 추천 재료</span>
          </div>
        </div>

        {/* 테이블 헤더 */}
        <div className={styles.ingredientTableHeader}>
          <span style={{ flex: 1 }}>재료명</span>
          <div className={styles.tableHeaderRight}>
            <span style={{ width: '80px', textAlign: 'center' }}>대체 가능</span>
            <span style={{ width: '36px' }}></span>
          </div>
        </div>

        {/* 추천 재료 행 목록 또는 기본 텍스트 */}
        <div className={styles.ingredientRowsContainer}>
          {customIngredients.length > 0 ? (
            renderIngredientRows(customIngredients, true)
          ) : (
            <div
              style={{
                padding: '32px 16px',
                textAlign: 'center',
                color: 'var(--brand-gray, #888)',
                fontSize: '14px',
              }}
            >
              하단의 <strong>'재료 추가 +'</strong> 버튼을 눌러 추천하고 싶은 재료를 자유롭게 추가해 보세요!
            </div>
          )}
        </div>

        {/* 사용자 추천 재료 추가 버튼 */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button
            type="button"
            className={styles.addRowBtnHeader}
            style={{ width: '130px', padding: '10px 16px' }}
            onClick={handleAddCustomItem}
          >
            재료 추가 +
          </button>
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
    const updatedSteps = steps.map((step, i) => (i === index ? { ...step, [field]: value } : step));
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
  };

  return (
    <div className={styles.stepContent}>
      {/* 폼 제목 */}
      <div className={styles.stepTitle}>
        <h3 className="text-xl" style={{ fontWeight: 600, color: 'var(--brand-brown)' }}>
          🖼️ 4단계: 요리 이미지 확인 및 대표 이미지 설정
        </h3>
        <p className="text-m" style={{ color: 'var(--brand-gray)', marginTop: '8px' }}>
          AI가 생성한 대표 썸네일을 확인하고, 필요 시 직접 촬영한 완성 사진으로 변경할 수 있습니다.
        </p>
      </div>

      <div className={styles.titleDivider} />

      {/* 좌/우 split 가로 flexbox 레이아웃 */}
      <div className={styles.imageSplitLayout}>
        {/* 왼쪽: 메인 썸네일 컨테이너 (절반 너비, 직접 업로드 가능) */}
        <div className={styles.thumbnailSection}>
          <div className={styles.sectionHeaderRow}>
            <span className={styles.sectionTitleLabel}>📷 대표 썸네일 이미지</span>
            <span className={styles.changeNoticeBadge}>직접 파일 교체 가능</span>
          </div>

          <label className={styles.thumbnailUploadBox}>
            <img src={thumbnail} alt="대표 요리 썸네일" className={styles.thumbnailImgPreview} />
            <div className={styles.thumbnailOverlay}>
              <span className={styles.cameraIcon}>📸</span>
              <span className={styles.overlayText}>대표 이미지 변경하기</span>
            </div>
            <input type="file" accept="image/*" className={styles.hiddenFileInput} onChange={handleThumbnailChange} />
          </label>
        </div>

        {/* 오른쪽: 조리 단계별 이미지 갤러리 (2열 정사각형, 여백 없음) */}
        <div className={styles.stepGallerySection}>
          <div className={styles.sectionHeaderRow}>
            <span className={styles.sectionTitleLabel}>🍳 조리 단계별 이미지</span>
            <span className={styles.readOnlyNoticeBadge}>🔒 AI 생성 완료</span>
          </div>

          <div className={styles.stepImageGrid}>
            {stepImages.map((item) => (
              <div key={item.stepNumber} className={styles.squareImageWrapper}>
                <img src={item.url} alt={`STEP ${item.stepNumber} 조리 과정`} className={styles.squareImg} />
                <span className={styles.imageStepTag}>STEP {item.stepNumber}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   Step 5 (구 Step 5+6 통합) 컴포넌트: 최종 미리보기 및 공개 옵션 설정
   ========================================================================== */
function Step5PreviewAndOptions({ formData, updateFormData }) {
  // 공개 옵션 상태 관리
  const options = formData.publishOptions || {
    visibility: 'public', // 'public' | 'private'
    allowAiRecommendation: true,
    allowCommentsAndReviews: true,
  };

  const handleOptionChange = (field, value) => {
    const updatedOptions = { ...options, [field]: value };
    updateFormData('publishOptions', updatedOptions);
  };

  return (
    <div className={styles.stepContent}>
      {/* 폼 제목 */}
      <div className={styles.stepTitle}>
        <h3 className="text-xl" style={{ fontWeight: 600, color: 'var(--brand-brown)' }}>
          👁️ 5단계: 레시피 최종 확인 및 공개 설정
        </h3>
        <p className="text-m" style={{ color: 'var(--brand-gray)', marginTop: '8px' }}>
          완성된 레시피를 최종 확인하고 공개 범위 및 참여 옵션을 설정한 뒤 등록해 주세요.
        </p>
      </div>

      <div className={styles.titleDivider} />

      {/* 2컬럼 레이아웃: (좌) 미리보기 완본 카드 | (우) 공개/옵션 설정 패널 */}
      <div className={styles.previewSplitLayout}>
        {/* 왼쪽: 레시피 완본 미리보기 카드 */}
        <div className={styles.previewCardContainer}>
          <div className={styles.previewCardHeader}>
            <span className={styles.previewBadge}>✨ 미리보기</span>
            <h2 className={styles.previewTitle}>{formData.title || '제목 없음'}</h2>
            <p className={styles.previewDescription}>{formData.description}</p>
          </div>

          {/* 대표 썸네일 */}
          {formData.thumbnail && (
            <div className={styles.previewImageWrapper}>
              <img src={formData.thumbnail} alt="대표 요리 이미지" className={styles.previewImage} />
            </div>
          )}

          {/* 메타 정보 칩 (카테고리, 시간, 난이도, 인분) */}
          <div className={styles.previewMetaRow}>
            <span>🏷️ {formData.category}</span>
            <span>⏱️ {formData.cookingTime}분</span>
            <span>🔥 난이도 {formData.difficulty}</span>
            <span>👥 {formData.servings}인분</span>
          </div>

          {/* 재료 리스트 요약 */}
          <div className={styles.previewSectionBox}>
            <h4 className={styles.previewSectionTitle}>🥕 필요 재료</h4>
            {formData.ingredientGroups?.map((group) => (
              <div key={group.id} className={styles.previewGroupBlock}>
                <span className={styles.previewGroupTitle}>[{group.title}]</span>
                <p className={styles.previewIngredientText}>
                  {group.items.map((item) => `${item.name} ${item.amount}${item.unit}`).join(', ')}
                </p>
              </div>
            ))}
          </div>

          {/* 조리 단계 요약 */}
          <div className={styles.previewSectionBox}>
            <h4 className={styles.previewSectionTitle}>🍳 조리 순서</h4>
            <div className={styles.previewStepsList}>
              {formData.cookingSteps?.map((step) => (
                <div key={step.stepNumber} className={styles.previewStepItem}>
                  <span className={styles.previewStepNum}>{step.stepNumber}</span>
                  <div className={styles.previewStepBody}>
                    <p>{step.instruction}</p>
                    {step.tip && <p className={styles.previewStepTip}>💡 {step.tip}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 오른쪽: 공개 범위 및 설정 옵션 패널 */}
        <div className={styles.optionsPanel}>
          {/* <h4 className={styles.optionsPanelTitle}>🔒 공개 설정</h4> */}

          {/* 1. 공개 범위 선택 (전체 공개 / 비공개) */}
          <div className={styles.optionGroup}>
            <label className={styles.optionLabel}>공개 범위</label>
            <div className={styles.radioGroup}>
              <label className={styles.radioCard}>
                <input
                  type="radio"
                  name="visibility"
                  checked={options.visibility === 'public'}
                  onChange={() => handleOptionChange('visibility', 'public')}
                />
                <div>
                  <strong>🌐 전체 공개</strong>
                  <p>모든 사용자가 이 레시피를 조회하고 검색할 수 있습니다.</p>
                </div>
              </label>

              <label className={styles.radioCard}>
                <input
                  type="radio"
                  name="visibility"
                  checked={options.visibility === 'private'}
                  onChange={() => handleOptionChange('visibility', 'private')}
                />
                <div>
                  <strong>🔒 비공개</strong>
                  <p>나의 개인 레시피 보관함에만 저장됩니다.</p>
                </div>
              </label>
            </div>
          </div>

          <div className={styles.panelDivider} />

          {/* 2. 추가 옵션 체크박스 */}
          <div className={styles.optionGroup}>
            <label className={styles.optionLabel}>추가 옵션</label>
            <div className={styles.checkboxList}>
              <label className={styles.checkboxCard}>
                <input
                  type="checkbox"
                  checked={options.allowAiRecommendation}
                  onChange={(e) => handleOptionChange('allowAiRecommendation', e.target.checked)}
                />
                <div>
                  <strong>🤖 AI 추천 항목 허용</strong>
                  <p>다른 사용자의 AI 주간 식단 및 연관 추천 항목에 이 레시피가 포함될 수 있습니다.</p>
                </div>
              </label>

              <label className={styles.checkboxCard}>
                <input
                  type="checkbox"
                  checked={options.allowCommentsAndReviews}
                  onChange={(e) => handleOptionChange('allowCommentsAndReviews', e.target.checked)}
                />
                <div>
                  <strong>💬 댓글 허용</strong>
                  <p>다른 사용자들이 레시피에 댓글을 작성할 수 있도록 합니다.</p>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   Main RegistRecipe 페이지 컴포넌트
   ========================================================================== */
export default function RegistRecipe() {
  // URL 쿼리 스트링으로 현재 step 상태 유지 (?step=1)
  const [searchParams, setSearchParams] = useSearchParams();
  const currentStep = parseInt(searchParams.get('step') || '1', 10);

  // 통합 폼 상태 데이터
  const [formData, setFormData] = useState({
    title: '매콤 크림 닭갈비 파스타',
    description:
      "매콤한 닭갈비 소스와 고소한 크림이 만나 어우러진, 이색적인 퓨전 파스타 요리입니다. 부드럽고 매콤한 맛으로 남녀노소 모두가 조리 시간 약 20분, 난이도는 '하' 수준으로 간편합니다.",
    category: '퓨전',
    cookingTime: '20',
    difficulty: '하',
    servings: '2',
    tags: ['#매콤크림파스타', '#퓨전파스타', '#닭갈비파스타', '#20분요리', '#초간단'],
    ingredients: [],
    cookingSteps: [],
    images: [],
    isPublic: true,
  });

  // 상태 업데이트 헬퍼 함수
  const updateFormData = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // 단계 이동 (URL SearchParam 업데이트로 뒤로가기 내비게이션 대응)
  const goToStep = (stepNumber) => {
    if (stepNumber >= 1 && stepNumber <= 6) {
      setSearchParams({ step: stepNumber });
    }
  };

  const steps = [
    { id: 1, label: '기본 정보' },
    { id: 2, label: '재료' },
    { id: 3, label: '조리 과정' },
    { id: 4, label: '이미지' },
    { id: 5, label: '미리 보기' },
  ];

  // 현재 단계별 서브 컴포넌트 렌더링 맵
  const renderStepComponent = () => {
    switch (currentStep) {
      case 1:
        return <Step1BasicInfo formData={formData} updateFormData={updateFormData} />;
      case 2:
        return <Step2Ingredients formData={formData} updateFormData={updateFormData} />;
      case 3:
        return <Step3Steps formData={formData} updateFormData={updateFormData} />;
      case 4:
        return <Step4Image formData={formData} updateFormData={updateFormData} />;
      case 5:
        return <Step5PreviewAndOptions formData={formData} updateFormData={updateFormData} />;
      default:
        return <Step1BasicInfo formData={formData} updateFormData={updateFormData} />;
    }
  };

  return (
    <Layout activeMenu="AI 레시피">
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

        {/* 6단계 알약 인디케이터 바 */}
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
            <button type="button" className={styles.actionBtn} data-tooltip="임시 저장">
              <span className={styles.btnIcon}>💾</span>
              <span className={styles.btnText}>임시 저장</span>
            </button>

            <button type="button" className={styles.actionBtn} onClick={() => goToStep(5)} data-tooltip="미리 보기">
              <span className={styles.btnIcon}>👁</span>
              <span className={styles.btnText}>미리 보기</span>
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
                if (currentStep === 5) {
                  alert('레시피가 성공적으로 등록되었습니다!');
                } else {
                  goToStep(currentStep + 1);
                }
              }}
              data-tooltip={currentStep === 5 ? '완성하기' : '다음 단계'}
            >
              <span className={styles.btnText}>{currentStep === 5 ? '완성하기' : '다음'}</span>
              <span className={styles.btnIcon}>›</span>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
