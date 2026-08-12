/**
 * 레시피 완성 후기 영역 컴포넌트
 * - 등록된 후기의 작성자, 별점, 내용, 이미지 표시
 * - 별점 선택, 후기 내용 입력, 이미지 첨부를 위한 작성 폼 제공
 * - 실제 조회·등록 로직은 useRecipeReviews hook에 위임
 */
import { AddPhotoAlternateOutlined, Star, StarBorder } from "@mui/icons-material";

import styles from "../RecipeDetail.module.css";
import { formatDate } from "../recipeDetailUtils";

export default function RecipeReviews({
  comments,
  commentText,
  setCommentText,
  commentLoading,
  commentSubmitting,
  reviewRating,
  setReviewRating,
  hoverRating,
  setHoverRating,
  reviewImagePreview,
  onReviewImageChange,
  onRemoveReviewImage,
  onCommentSubmit,
}) {
  return (
    <section className={styles.reviewSection}>
      <h2 className={`font-display dtext-2xl ${styles.sectionTitle}`}>완성 후기</h2>

      {commentLoading ? (
        <p className="text-sm">완성 후기를 불러오는 중입니다.</p>
      ) : comments.length > 0 ? (
        <div className={styles.commentList}>
          {comments.map(comment => (
            <article key={comment.id} className={styles.commentItem}>
              <div className={styles.commentHeader}>
                <div>
                  <strong className="text-sm">{comment.nickname || "사용자"}</strong>

                  <div className={styles.reviewStars}>
                    {[1, 2, 3, 4, 5].map(star =>
                      star <= Number(comment.rating) ? (
                        <Star key={star} fontSize="small" />
                      ) : (
                        <StarBorder key={star} fontSize="small" />
                      ),
                    )}
                  </div>
                </div>

                <span className="text-s">{formatDate(comment.created_at)}</span>
              </div>

              {comment.content && <p className="text-sm">{comment.content}</p>}

              {comment.image_url && (
                <img
                  className={styles.commentImage}
                  src={comment.image_url}
                  alt={`${comment.nickname || "사용자"}님의 완성 후기`}
                  loading="lazy"
                />
              )}
            </article>
          ))}
        </div>
      ) : (
        <p className={`text-sm ${styles.emptyComment}`}>아직 등록된 완성 후기가 없습니다.</p>
      )}

      <form className={styles.commentForm} onSubmit={onCommentSubmit}>
        <div className={styles.reviewFormContent}>
          <div className={styles.ratingInputArea}>
            <span className="text-sm">별점</span>

            <div className={styles.ratingInput} onMouseLeave={() => setHoverRating(0)}>
              {[1, 2, 3, 4, 5].map(star => {
                const activeRating = hoverRating || reviewRating;

                return (
                  <button
                    key={star}
                    type="button"
                    className={styles.ratingButton}
                    onClick={() => setReviewRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    aria-label={`${star}점`}
                  >
                    {star <= activeRating ? <Star /> : <StarBorder />}
                  </button>
                );
              })}
            </div>

            <span className={`text-s ${styles.ratingRequired}`}>필수</span>
          </div>

          {reviewImagePreview && (
            <div className={styles.reviewImagePreview}>
              <img src={reviewImagePreview} alt="후기 이미지 미리보기" />
              <button
                type="button"
                className={styles.removeReviewImage}
                onClick={onRemoveReviewImage}
              >
                삭제
              </button>
            </div>
          )}

          <input
            className="text-sm"
            type="text"
            value={commentText}
            onChange={event => setCommentText(event.target.value)}
            placeholder="완성 후기를 남겨보세요 (선택)"
            maxLength={300}
            disabled={commentSubmitting}
          />

          <div className={styles.reviewFormActions}>
            <label className={styles.imageUploadButton}>
              <AddPhotoAlternateOutlined />
              <span className="text-sm">사진 추가</span>
              <input
                type="file"
                accept="image/*"
                onChange={onReviewImageChange}
                disabled={commentSubmitting}
              />
            </label>

            <span className={`text-s ${styles.imageGuide}`}>2MB 이하</span>

            <button className="text-button" type="submit" disabled={commentSubmitting}>
              {commentSubmitting ? "등록 중..." : "등록"}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
