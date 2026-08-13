/**
 * 커뮤니티 게시글 작성/수정 모달
 * - 게시글 카테고리와 내용 입력
 * - 이미지 첨부 및 연결할 레시피 선택 기능 제공
 * - 신규 게시글 작성과 기존 게시글 수정에서 공통으로 사용
 */
import { Dialog, FormControl, IconButton, MenuItem, Select } from "@mui/material";
import { AddPhotoAlternateOutlined, Close } from "@mui/icons-material";
import { writableCategories } from "../communityUtils";
import styles from "../Community.module.css";

export default function CommunityWriteModal({
  open,
  editingPostId,
  writeForm,
  writeError,
  writeSubmitting,
  fileInputRef,
  onClose,
  onSubmit,
  onFormChange,
  onRecipePickerOpen,
  onRecipeClear,
  onImageChange,
  onRemoveImage,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      sx={{
        "& .MuiDialog-container": { padding: { xs: "8px", sm: "24px" } },
        "& .MuiDialog-paper": {
          width: { xs: "100%", sm: "620px" },
          maxWidth: "none",
          maxHeight: { xs: "calc(100dvh - 16px)", sm: "calc(100dvh - 48px)" },
          margin: 0,
          borderRadius: { xs: "22px", sm: "28px" },
          overflow: "hidden",
        },
      }}
    >
      <form className={styles.writeModal} onSubmit={onSubmit}>
        <div className={styles.writeModalHeader}>
          <div>
            <h2 className="font-display dtext-2xl">
              {editingPostId ? "커뮤니티 글 수정" : "커뮤니티 글쓰기"}
            </h2>
            <p className="text-sm">
              {editingPostId
                ? "작성한 게시글 내용을 수정할 수 있습니다."
                : "음식과 레시피에 관한 이야기를 남겨보세요."}
            </p>
          </div>
          <IconButton type="button" aria-label="글쓰기 창 닫기" onClick={onClose}>
            <Close />
          </IconButton>
        </div>

        <div className={styles.writeModalBody}>
          <div className={styles.writeField}>
            <span>카테고리</span>
            <FormControl fullWidth size="small">
              <Select
                name="category"
                value={writeForm.category}
                onChange={onFormChange}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      mt: 0.5,
                      borderRadius: "14px",
                      boxShadow: "0 8px 24px rgba(64, 41, 31, 0.12)",
                    },
                  },
                }}
                sx={{
                  minHeight: "48px",
                  color: "var(--brand-brown)",
                  backgroundColor: "var(--brand-cream)",
                  borderRadius: "16px",
                  fontFamily: "inherit",
                  fontSize: { xs: "13px", sm: "14px" },
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "var(--brand-divider)" },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--brand-primary)",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--brand-primary)",
                    borderWidth: "1px",
                  },
                  "&.Mui-focused": { boxShadow: "0 0 0 3px rgba(242, 107, 58, 0.12)" },
                  "& .MuiSelect-select": {
                    display: "flex",
                    alignItems: "center",
                    padding: "12px 14px",
                  },
                }}
              >
                {writableCategories.map(category => (
                  <MenuItem
                    key={category}
                    value={category}
                    sx={{
                      fontFamily: "inherit",
                      fontSize: "14px",
                      "&.Mui-selected": {
                        color: "var(--brand-primary)",
                        backgroundColor: "var(--brand-cream)",
                      },
                      "&.Mui-selected:hover": { backgroundColor: "var(--brand-beige)" },
                    }}
                  >
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <label className={styles.writeField}>
            <span>내용</span>
            <textarea
              name="content"
              value={writeForm.content}
              onChange={onFormChange}
              placeholder="어떤 이야기를 나누고 싶으신가요?"
              maxLength={500}
            />
            <small>{writeForm.content.length}/500</small>
          </label>

          <div className={styles.writeField}>
            <span>연결할 레시피</span>
            <div style={{ display: "flex", gap: "8px", width: "100%" }}>
              <button
                type="button"
                onClick={onRecipePickerOpen}
                style={{
                  flex: 1,
                  minHeight: "48px",
                  padding: "12px 14px",
                  border: "1px solid var(--brand-divider)",
                  borderRadius: "16px",
                  background: "var(--brand-cream)",
                  color: writeForm.recipeName ? "var(--brand-brown)" : "var(--brand-gray)",
                  fontFamily: "inherit",
                  fontSize: "14px",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                {writeForm.recipeName || "레시피 찾아보기"}
              </button>

              {writeForm.recipeId && (
                <button
                  type="button"
                  onClick={onRecipeClear}
                  style={{
                    flexShrink: 0,
                    padding: "0 14px",
                    border: "1px solid var(--brand-divider)",
                    borderRadius: "16px",
                    background: "#fff",
                    color: "var(--brand-gray)",
                    fontFamily: "inherit",
                    cursor: "pointer",
                  }}
                >
                  연결 해제
                </button>
              )}
            </div>
            <small style={{ alignSelf: "flex-start" }}>
              다른 사용자가 등록한 레시피도 검색해서 연결할 수 있습니다.
            </small>
          </div>

          <div className={styles.writeImageField}>
            <div className={styles.writeImageLabel}>
              <span>사진</span>
              <small>선택 사항 · 최대 2MB</small>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onImageChange}
              className={styles.hiddenFileInput}
            />

            {writeForm.image ? (
              <div className={styles.writeImagePreview}>
                <img src={writeForm.image} alt="업로드 이미지 미리보기" />
                <button type="button" className={styles.removeImageButton} onClick={onRemoveImage}>
                  이미지 삭제
                </button>
              </div>
            ) : (
              <button
                type="button"
                className={styles.imageUploadButton}
                onClick={() => fileInputRef.current?.click()}
              >
                <AddPhotoAlternateOutlined />
                <span>사진 추가하기</span>
              </button>
            )}
          </div>

          <div
            className={`${styles.writeErrorSlot} ${writeError ? styles.writeErrorVisible : ""}`}
            role="alert"
            aria-live="polite"
          >
            {writeError || "\u00A0"}
          </div>
        </div>

        <div className={styles.writeModalFooter}>
          <button type="button" className={styles.cancelWriteButton} onClick={onClose}>
            취소
          </button>
          <button type="submit" className={styles.submitWriteButton} disabled={writeSubmitting}>
            {writeSubmitting
              ? editingPostId
                ? "수정 중..."
                : "등록 중..."
              : editingPostId
                ? "수정하기"
                : "등록하기"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
