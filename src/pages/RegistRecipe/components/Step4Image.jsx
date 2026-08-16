import React from 'react';
import styles from '../RegistRecipe.module.css';

export default function Step4Image({ thumbnail, hasStepImages, stepGridItems, handleThumbnailChange }) {
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
