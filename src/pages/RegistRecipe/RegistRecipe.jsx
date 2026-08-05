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

      {/* 4컬럼 셀렉트 그리드 */}
      <div className={styles.fourColGrid}>
        <div className={styles.selectField}>
          <label className={styles.inputLabel}>카테고리</label>
          <select
            className={styles.selectBox}
            value={formData.category}
            onChange={(e) => updateFormData('category', e.target.value)}
          >
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
            value={formData.cookingTime}
            onChange={(e) => updateFormData('cookingTime', e.target.value)}
            placeholder="20"
          />
        </div>

        <div className={styles.selectField}>
          <label className={styles.inputLabel}>난이도</label>
          <select
            className={styles.selectBox}
            value={formData.difficulty}
            onChange={(e) => updateFormData('difficulty', e.target.value)}
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
            value={formData.servings}
            onChange={(e) => updateFormData('servings', e.target.value)}
            placeholder="2"
          />
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
  // 계량 단위 옵션 목록
  const unitOptions = ["g", "ml", "kg", "L", "T (큰술)", "t (작은술)", "컵", "개", "줄", "포기", "조각", "적당량"];

  // 초기 재료 데이터: 기본 재료, 양념장 재료 2개 그룹 세팅
  const [ingredientGroups, setIngredientGroups] = useState(
    formData.ingredientGroups && formData.ingredientGroups.length > 0
      ? formData.ingredientGroups
      : [
          {
            id: "group-1",
            title: "기본 재료",
            items: [
              {
                id: "item-1",
                name: "닭가슴살",
                amount: 300,
                unit: "g",
                isSubstitutable: true,
              },
              {
                id: "item-2",
                name: "양파",
                amount: 1,
                unit: "개",
                isSubstitutable: false,
              },
            ],
          },
          {
            id: "group-2",
            title: "양념장 재료",
            items: [
              {
                id: "item-3",
                name: "고추장",
                amount: 2,
                unit: "T (큰술)",
                isSubstitutable: false,
              },
            ],
          },
        ]
  );

  // 상위 formData 동기화
  const syncWithFormData = (newGroups) => {
    setIngredientGroups(newGroups);
    updateFormData("ingredientGroups", newGroups);
  };

  // 새로운 그룹 추가
  const handleAddGroup = () => {
    const newGroup = {
      id: `group-${Date.now()}`,
      title: `추가 재료`,
      items: [
        {
          id: `item-${Date.now()}`,
          name: "",
          amount: "",
          unit: "g",
          isSubstitutable: false,
        },
      ],
    };
    syncWithFormData([...ingredientGroups, newGroup]);
  };

  // 그룹 삭제 (최소 1개 그룹 유지 제어)
  const handleRemoveGroup = (groupId) => {
    if (ingredientGroups.length <= 1) {
      alert("최소 하나의 재료 그룹은 화면에 남아있어야 합니다.");
      return;
    }
    syncWithFormData(ingredientGroups.filter((g) => g.id !== groupId));
  };

  // 그룹 제목 변경
  const handleGroupTitleChange = (groupId, newTitle) => {
    syncWithFormData(
      ingredientGroups.map((group) =>
        group.id === groupId ? { ...group, title: newTitle } : group
      )
    );
  };

  // 재료 행 추가
  const handleAddItem = (groupId) => {
    syncWithFormData(
      ingredientGroups.map((group) => {
        if (group.id === groupId) {
          return {
            ...group,
            items: [
              ...group.items,
              {
                id: `item-${Date.now()}`,
                name: "",
                amount: "",
                unit: "g",
                isSubstitutable: false,
              },
            ],
          };
        }
        return group;
      })
    );
  };

  // 재료 행 삭제
  const handleRemoveItem = (groupId, itemId) => {
    syncWithFormData(
      ingredientGroups.map((group) => {
        if (group.id === groupId) {
          return {
            ...group,
            items: group.items.filter((item) => item.id !== itemId),
          };
        }
        return group;
      })
    );
  };

  // 재료 항목 필드 변경 (name, amount, unit, isSubstitutable)
  const handleItemChange = (groupId, itemId, field, value) => {
    syncWithFormData(
      ingredientGroups.map((group) => {
        if (group.id === groupId) {
          return {
            ...group,
            items: group.items.map((item) =>
              item.id === itemId ? { ...item, [field]: value } : item
            ),
          };
        }
        return group;
      })
    );
  };

  return (
    <div className={styles.stepContent}>
      {/* 폼 제목 */}
      <div className={styles.stepTitle}>
        <h3 className="text-xl" style={{ fontWeight: 600, color: "var(--brand-brown)" }}>
          🥕 2단계: 재료 목록 입력
        </h3>
        <p className="text-m" style={{ color: "var(--brand-gray)", marginTop: "8px" }}>
          필요한 재료와 분량을 기본 재료 및 양념장 재료 그룹별로 입력해 주세요.
        </p>
      </div>

      <div className={styles.titleDivider} />

      {/* 재료 그룹 목록 */}
      {ingredientGroups.map((group) => (
        <div key={group.id} className={styles.groupCard}>
          {/* 그룹 헤더 */}
          <div className={styles.groupHeaderRow}>
            <div className={styles.groupTitleBadgeWrapper}>
              <input
                type="text"
                className={styles.groupTitleInput}
                value={group.title}
                onChange={(e) => handleGroupTitleChange(group.id, e.target.value)}
                placeholder="그룹명 입력"
              />
              <button
                type="button"
                className={styles.groupDeleteBtn}
                onClick={() => handleRemoveGroup(group.id)}
                title="그룹 삭제"
              >
                ✕
              </button>
            </div>
          </div>

          {/* 재료 테이블 헤더 라벨 */}
          <div className={styles.ingredientTableHeader}>
            <span style={{ flex: 1.5 }}>재료명</span>
            <span style={{ width: "110px" }}>분량</span>
            <span style={{ width: "120px" }}>계량 단위</span>
            <span style={{ width: "110px", textAlign: "center" }}>대체 가능 여부</span>
            <span style={{ width: "110px" }}></span>
          </div>

          {/* 재료 행 목록 */}
          <div className={styles.ingredientRowsContainer}>
            {group.items.map((item) => (
              <div key={item.id} className={styles.ingredientRow}>
                {/* 1. 재료명 */}
                <div style={{ flex: 1.5, position: "relative" }}>
                  <input
                    type="text"
                    className={styles.textInputWithIcon}
                    value={item.name}
                    onChange={(e) => handleItemChange(group.id, item.id, "name", e.target.value)}
                    placeholder="예: 닭가슴살"
                  />
                  <span className={styles.pencilIcon}>✏️</span>
                </div>

                {/* 2. 분량 (number) */}
                <div style={{ width: "110px" }}>
                  <input
                    type="number"
                    className={styles.textInput}
                    value={item.amount}
                    onChange={(e) => handleItemChange(group.id, item.id, "amount", e.target.value)}
                    placeholder="300"
                  />
                </div>

                {/* 3. 계량 단위 (select) */}
                <div style={{ width: "120px" }}>
                  <select
                    className={styles.selectBox}
                    value={item.unit}
                    onChange={(e) => handleItemChange(group.id, item.id, "unit", e.target.value)}
                  >
                    {unitOptions.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. 대체 가능 여부 (체크박스) */}
                <div style={{ width: "110px", display: "flex", justifyContent: "center" }}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={item.isSubstitutable}
                      onChange={(e) =>
                        handleItemChange(group.id, item.id, "isSubstitutable", e.target.checked)
                      }
                    />
                    <span>대체 가능</span>
                  </label>
                </div>

                {/* 5. 쓰레기통 삭제 버튼 & 재료 추가 버튼 */}
                <div style={{ width: "110px", display: "flex", gap: "6px", alignItems: "center" }}>
                  <button
                    type="button"
                    className={styles.trashBtn}
                    onClick={() => handleRemoveItem(group.id, item.id)}
                    title="재료 삭제"
                  >
                    🗑
                  </button>

                  <button
                    type="button"
                    className={styles.addRowBtn}
                    onClick={() => handleAddItem(group.id)}
                  >
                    재료 추가 +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* 새로운 재료 그룹 추가 버튼 */}
      <div style={{ textAlign: "center", marginTop: "16px" }}>
        <button type="button" className={styles.addGroupBtn} onClick={handleAddGroup}>
          + 재료 묶음/그룹 추가하기
        </button>
      </div>
    </div>
  );
}

/* ==========================================================================
   Step 3 ~ 6 컴포넌트 (확장 구조 예시)
   ========================================================================== */
function Step3Steps() {
  return (
    <div className={styles.stepTitle}>
      <h3 className="text-xl" style={{ fontWeight: 600, color: 'var(--brand-brown)' }}>
        🍳 3단계: 조리 과정 등록
      </h3>
      <p className="text-m" style={{ color: 'var(--brand-gray)', marginTop: '8px' }}>
        순서별 조리 설명과 팁을 작성하세요.
      </p>
    </div>
  );
}

function Step4Image() {
  return (
    <div className={styles.stepTitle}>
      <h3 className="text-xl" style={{ fontWeight: 600, color: 'var(--brand-brown)' }}>
        🖼️ 4단계: 요리 이미지 업로드
      </h3>
      <p className="text-m" style={{ color: 'var(--brand-gray)', marginTop: '8px' }}>
        완성 요리 대표 이미지 및 과정 사진을 업로드합니다.
      </p>
    </div>
  );
}

function Step5Visibility() {
  return (
    <div className={styles.stepTitle}>
      <h3 className="text-xl" style={{ fontWeight: 600, color: 'var(--brand-brown)' }}>
        🔒 5단계: 공개 범위 및 옵션 설정
      </h3>
      <p className="text-m" style={{ color: 'var(--brand-gray)', marginTop: '8px' }}>
        공개 여부, 댓글 허용 등의 옵션을 설정하세요.
      </p>
    </div>
  );
}

function Step6Preview() {
  return (
    <div className={styles.stepTitle}>
      <h3 className="text-xl" style={{ fontWeight: 600, color: 'var(--brand-brown)' }}>
        👁️ 6단계: 등록 전 최종 미리보기
      </h3>
      <p className="text-m" style={{ color: 'var(--brand-gray)', marginTop: '8px' }}>
        작성된 전체 레시피 카드를 미리 확인하고 최종 등록합니다.
      </p>
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
    { id: 5, label: '공개 설정' },
    { id: 6, label: '미리 보기' },
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
        return <Step5Visibility formData={formData} updateFormData={updateFormData} />;
      case 6:
        return <Step6Preview formData={formData} updateFormData={updateFormData} />;
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
            <button type="button" className={styles.actionBtn}>
              💾 임시 저장
            </button>
            <button type="button" className={styles.actionBtn} onClick={() => goToStep(6)}>
              👁 미리 보기
            </button>
          </div>

          <div className={styles.rightActions}>
            <button
              type="button"
              className={`${styles.navBtn} ${currentStep === 1 ? styles.disabledBtn : ''}`}
              onClick={() => goToStep(currentStep - 1)}
              disabled={currentStep === 1}
            >
              ‹ 이전
            </button>
            <button
              type="button"
              className={styles.nextBtn}
              onClick={() => {
                if (currentStep === 6) {
                  alert('레시피가 성공적으로 등록되었습니다!');
                } else {
                  goToStep(currentStep + 1);
                }
              }}
            >
              {currentStep === 6 ? '완성하기' : '다음 ›'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
