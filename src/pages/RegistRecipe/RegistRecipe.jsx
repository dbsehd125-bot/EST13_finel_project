import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, isEmpty } from '@mui/material';
import { supabase } from '../../lib/supabaseClient';
import { useNotification } from '../../context/NotificationContext';
import { UploadRecipeToSupabase } from './hooks/UploadRecipeToSupabase';
import Layout from '../../components/Layout';
import SEO from '../../components/SEO';
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
            <label className={styles.inputLabel}>분량</label>
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
          <span>카테고리, 조리시간, 난이도, 분량 항목은 수정할 수 없습니다.</span>
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
   Step 2 컴포넌트: 재료 목록 입력 (리팩토링 완료)
   ========================================================================== */
function Step2Ingredients({ formData, updateFormData }) {
  // 1. 단일 재료 목록 상태 관리
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

  // 상위 formData와 동기화
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

  return (
    <div className={styles.stepContent}>
      {/* 폼 제목 */}
      <div className={styles.stepTitle}>
        <h3 className="text-xl" style={{ fontWeight: 600, color: 'var(--brand-brown)' }}>
          🥕 2단계: 재료 목록 입력
        </h3>
        <p className="text-m" style={{ color: 'var(--brand-gray)', marginTop: '8px' }}>
          AI가 생성한 필요 재료를 확인하고, 대체 가능한 재료가 있다면 기입해 주세요.
        </p>
      </div>

      <div className={styles.titleDivider} />

      {/* 단일 '재료 목록' 카드 */}
      <div className={styles.groupCard}>
        <div className={styles.groupHeaderRow}>
          <div className={styles.groupTitleBadgeWrapper}>
            <span className={styles.groupTitleBadge}>재료 목록</span>
          </div>
        </div>

        {/* 테이블 헤더 (삭제 컬럼 제거) */}
        <div className={styles.ingredientTableHeader}>
          <span style={{ flex: 1 }}>재료명</span>
          <div className={styles.tableHeaderRight}>
            <span style={{ width: '100px', textAlign: 'center' }}>대체 가능</span>
          </div>
        </div>

        {/* 재료 행 목록 */}
        <div className={styles.ingredientRowsContainer}>
          {ingredients.map((item) => (
            <React.Fragment key={item.id}>
              {/* 재료 행 */}
              <div className={styles.ingredientRow}>
                {/* 1. 재료명 입력창 */}
                <div style={{ flex: 1, position: 'relative' }}>
                  <input
                    type="text"
                    className={styles.textInputWithIcon}
                    value={item.name}
                    onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                    placeholder="예: 닭가슴살"
                    readOnly
                  />
                </div>

                {/* 2. 대체 가능 여부 체크박스 */}
                <div style={{ width: '100px', display: 'flex', justifyContent: 'center' }}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={item.isSubstitutable}
                      onChange={(e) => handleItemChange(item.id, 'isSubstitutable', e.target.checked)}
                    />
                  </label>
                </div>
              </div>

              {/* 3. 개별 isSubstitutable 체크 시만 표시되는 대체 재료 입력 필드 */}
              {item.isSubstitutable && (
                <div
                  className={styles.substituteRow}
                  style={{
                    display: 'flex',
                    flex: '1',
                    alignItems: 'center',
                    borderRadius: '12px',
                    padding: '8px 12px',
                    marginLeft: '16px',
                    marginRight: '100px',
                    marginTop: '-20px',
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
                    className={styles.substituteInput}
                    style={{ flex: 1, backgroundColor: '#fff' }}
                    value={item.substituteName}
                    onChange={(e) => handleItemChange(item.id, 'substituteName', e.target.value)}
                    placeholder="대체 가능한 재료를 입력하세요."
                  />
                </div>
              )}
            </React.Fragment>
          ))}
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

  // 상위 formData 및 로컬 상태 동기화
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
              <span className={styles.stepNumberBadge}>STEP {step.step}</span>
              {/* <span className={styles.readOnlyBadge}>🔒 Read Only</span> */}
            </div>

            {/* 조리 과정 내용 (ReadOnly) */}
            <div className={styles.inputGroup} style={{ marginBottom: '14px' }}>
              <textarea className={styles.readOnlyTextarea} value={step.description} readOnly rows={2} />
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
                  disabled={!step.tip}
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
  const FALLBACK_THUMBNAIL =
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80';
  const TRANSPARENT_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

  const [thumbnail, setThumbnail] = useState(formData.thumbnail_url || FALLBACK_THUMBNAIL);

  const steps = formData.cookingSteps || [];
  const hasStepImages = steps.some((step) => step.image);

  const getStepImagesGrid = () => {
    // 조리 단계별로 생성된 이미지 URL 배열 추출
    const validImages = steps
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

  const [stepGridItems, setStepGridItems] = useState(getStepImagesGrid);

  // formData 변경 시 썸네일 및 단계별 이미지 자동 업데이트
  useEffect(() => {
    if (formData.thumbnail_url) {
      setThumbnail(formData.thumbnail_url);
    }
    setStepGridItems(getStepImagesGrid());
  }, [formData]);

  // 사용자가 파일 선택 시 썸네일 프리뷰 교체
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setThumbnail(imageUrl);
      updateFormData('thumbnail_url', imageUrl);
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
            <span className={styles.readOnlyNoticeBadge}>{hasStepImages ? '🔒변경 불가' : 'ℹ️생성하지 않음'}</span>
          </div>

          {hasStepImages ? (
            /* 1. 단계별 이미지가 존재하는 경우: 2x2 그리드 출력 */
            <div className={styles.stepImageGrid}>
              {stepGridItems.map((item, idx) => (
                <div key={idx} className={styles.squareImageWrapper}>
                  {!item.isEmpty ? (
                    <>
                      <img src={item.url} alt={`STEP ${item.stepNumber} 조리 과정`} className={styles.squareImg} />
                      <span className={styles.imageStepTag}>STEP {item.stepNumber}</span>
                    </>
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        border: '1px dashed #e0e0e0',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(0, 0, 0, 0.02)',
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            /* 2. 단계별 이미지를 생성하지 않은 경우: 안내 메시지 영역 출력 */
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '260px',
                height: '100%',
                backgroundColor: '#f9f9f9',
                borderRadius: '12px',
                border: '1px dashed #ddd',
                padding: '24px',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '32px', marginBottom: '12px' }}>🖼️</span>
              <p style={{ color: 'var(--brand-brown)', fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>
                단계별 이미지를 생성하지 않았습니다.
              </p>
              <p style={{ color: 'var(--brand-gray)', fontSize: '13px' }}>
                레시피 생성 시 단계별 이미지 생성 옵션을 선택하지 않은 레시피입니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   Step 5 컴포넌트: 최종 미리보기 및 공개 옵션 설정
   ========================================================================== */
function Step5PreviewAndOptions({ formData, updateFormData }) {
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
            <span className={styles.previewBadge}>✨미리보기</span>
            <h2 className={styles.previewTitle}>{formData.title || '제목 없음'}</h2>
            <p className={styles.previewDescription}>{formData.description}</p>
          </div>

          {/* 대표 썸네일 */}
          {formData.thumbnail_url && (
            <div className={styles.previewImageWrapper}>
              <img src={formData.thumbnail_url} alt="대표 요리 이미지" className={styles.previewImage} />
            </div>
          )}

          {/* 메타 정보 칩 (카테고리, 시간, 난이도, 인분) */}
          <div className={styles.previewMetaRow}>
            <span>🏷️ {formData.category}</span>
            <span>⏱️ {formData.cookingTime}</span>
            <span>🔥 {formData.difficulty}</span>
            <span>👥 {formData.servings}</span>
          </div>

          {/* 재료 리스트 요약 */}
          <div className={styles.previewSectionBox}>
            <h4 className={styles.previewSectionTitle}>🥕 필요 재료</h4>
            {formData.ingredients && formData.ingredients.length > 0 ? (
              <div className={styles.previewIngredientText}>
                {formData.ingredients.map((item, idx) => {
                  // 문자열 형태 데이터와 객체 형태 데이터 모두 안전하게 처리
                  const itemName = typeof item === 'string' ? item : item.name;

                  return (
                    <span key={item.id || idx} className={styles.ingredientChip}>
                      {itemName}
                      {idx < formData.ingredients.length - 1 ? ', ' : ''}
                    </span>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: 'var(--brand-gray)', fontSize: '14px' }}>등록된 재료가 없습니다.</p>
            )}
          </div>

          {/* 조리 단계 요약 */}
          <div className={styles.previewSectionBox}>
            <h4 className={styles.previewSectionTitle} style={{ marginBottom: '20px' }}>
              🍳 조리 순서
            </h4>
            <div className={styles.panelDivider}></div>
            <div className={styles.previewStepsList}>
              {formData.cookingSteps?.map((step) => (
                <div key={step.step} className={styles.previewStepItem}>
                  <span className={styles.previewStepNum}>{step.step}</span>
                  <div className={styles.previewStepBody}>
                    <p>{step.description}</p>
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
                  name="isPublic"
                  checked={options.isPublic === true}
                  onChange={() => handleOptionChange('isPublic', true)}
                />
                <div>
                  <strong>🌐 전체 공개</strong>
                  <p>모든 사용자가 이 레시피를 조회하고 검색할 수 있습니다.</p>
                </div>
              </label>

              <label className={styles.radioCard}>
                <input
                  type="radio"
                  name="isPublic"
                  checked={options.isPublic === false}
                  onChange={() => handleOptionChange('isPublic', false)}
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
  const location = useLocation();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  // 잘못된 접근 안내 모달 상태
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);

  // URL 쿼리 스트링으로 현재 step 상태 유지 (?step=1)
  const [searchParams, setSearchParams] = useSearchParams();
  const recipeId = searchParams.get('id');
  const [savedDraftId, setSavedDraftId] = useState(recipeId || null);
  const currentStep = parseInt(searchParams.get('step') || '1', 10);

  // 로딩 상태
  const [isLoadingPreset, setIsLoadingPreset] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // CreateAIRecipe에서 라우팅으로 넘어온 JSON 데이터
  const aiRecipePreset = location.state?.recipe || null;

  useEffect(() => {
    const navEntries = performance.getEntriesByType('navigation');
    const isReloaded = navEntries.length > 0 && navEntries[0].type === 'reload';

    // 🔒 새로고침을 했거나, location.state에 AI 레시피 데이터가 없는 경우 (URL 직접 타핑 진입)
    if (isReloaded || !aiRecipePreset) {
      setIsAccessModalOpen(true);
    }
  }, [location.state, aiRecipePreset]);

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

  const steps = [
    { id: 1, label: '기본 정보' },
    { id: 2, label: '재료' },
    { id: 3, label: '조리 과정' },
    { id: 4, label: '이미지' },
    { id: 5, label: '미리 보기' },
  ];

  // 단계 이동
  const goToStep = (stepNumber) => {
    if (stepNumber >= 1 && stepNumber <= steps.length) {
      setSearchParams({ step: stepNumber }, { state: location.state });
    }
  };

  // 현재 단계별 서브 컴포넌트 렌더링 맵
  const renderStepComponent = () => {
    if (isLoadingPreset) {
      return (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--brand-gray)' }}>
          레시피 데이터를 불러오는 중입니다...
        </div>
      );
    }

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

      // 2. 입력 받은 대체재를 기본 재료 값에 concat
      const formattedIngredients = (formData.ingredients || []).map((item) => {
        if (item.isSubstitutable && item.substituteName?.trim()) {
          const baseName = item.name?.trim() || '';
          const subName = item.substituteName.trim();

          // 이미 괄호가 붙어있지 않은 경우에만 Concat 결합
          const finalName = baseName.includes(`(${subName})`) ? baseName : `${baseName}(${subName})`;

          return {
            ...item,
            name: finalName,
          };
        }
        return item;
      });

      // 3. formData를 UploadRecipeToSupabase 규격에 맞게 매핑
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
        isPublic: formData.publishOptions?.isPublic ?? true,
      };

      // 4. 이미 생성된 임시저장 ID가 있는 경우: UPDATE 실행
      if (savedDraftId) {
        const result = await UploadRecipeToSupabase(recipeRawData, user, true, savedDraftId);

        if (result.success) {
          alert('임시 저장된 레시피가 수정 반영되었습니다.');
        } else {
          alert(`임시 저장 수정 실패: ${result.detail || result.error}`);
        }
      }
      // 5. 처음 임시저장을 누른 경우: INSERT 실행 후 반환된 ID 보관
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
              onClick={() => goToStep(5)}
              disabled={isSaving}
              data-tooltip="임시 저장"
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
                  alert('레시피가 성공적으로 등록되었습니다!');
                  /**handleFinalSubmit */
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
      <Dialog
        open={isAccessModalOpen}
        onClose={handleGoToCreatePage}
        aria-labelledby="access-dialog-title"
        aria-describedby="access-dialog-description"
        PaperProps={{
          style: {
            borderRadius: '16px',
            padding: '12px 8px',
            minWidth: '340px',
            maxWidth: '440px',
          },
        }}
      >
        <DialogTitle id="access-dialog-title" style={{ fontWeight: 600, color: '#333', textAlign: 'center' }}>
          ⚠️ 적용된 레시피 프리셋이 없습니다
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id="access-dialog-description"
            style={{ color: '#666', lineHeight: '1.5', textAlign: 'center' }}
          >
            현재 적용 중인 레시피 프리셋 데이터를 찾을 수 없습니다.
            <br />
            <strong>임시 저장해둔 레시피</strong>를 불러오시거나, <strong>새 AI 레시피</strong>를 생성해 주세요.
          </DialogContentText>
        </DialogContent>
        <DialogActions style={{ padding: '12px 24px 16px 24px', flexDirection: 'column', gap: '8px' }}>
          {/* 버튼 1: 최근 임시저장 레시피 불러오기 */}
          <Button
            onClick={handleLoadRecentDraft}
            variant="contained"
            disableElevation
            fullWidth
            style={{
              backgroundColor: 'var(--brand-primary, #f05a24)',
              color: '#fff',
              fontWeight: 600,
              borderRadius: '8px',
              padding: '10px',
              margin: 0,
            }}
          >
            가장 최근 저장한 프리셋 불러오기
          </Button>

          {/* 버튼 2: 레시피 생성하기 */}
          <Button
            onClick={handleGoToCreatePage}
            variant="outlined"
            fullWidth
            style={{
              borderColor: '#ccc',
              color: '#555',
              fontWeight: 600,
              borderRadius: '8px',
              padding: '10px',
              margin: 0,
            }}
          >
            레시피 생성하기
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
