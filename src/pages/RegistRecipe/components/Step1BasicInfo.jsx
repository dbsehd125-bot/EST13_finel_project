import React from 'react';
import styles from '../RegistRecipe.module.css';

export default function Step1BasicInfo({
  formData,
  updateFormData,
  newTag,
  setNewTag,
  isAddingTag,
  setIsAddingTag,
  handleAddTag,
  handleRemoveTag,
}) {
  const tags = formData.tags || [];

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
