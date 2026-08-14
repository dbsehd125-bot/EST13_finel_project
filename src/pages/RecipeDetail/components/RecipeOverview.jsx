/**
 * 레시피 상세 상단 정보 컴포넌트
 * - 대표 이미지, 카테고리, 제목, 설명, 작성자 정보 표시
 * - 후기 평균 별점과 조리 시간/난이도/인분/조회 수 표시
 * - 좋아요, 즐겨찾기, 공유 액션 버튼 제공
 */
import {
  AccessTimeOutlined,
  Bookmark,
  BookmarkBorderOutlined,
  Favorite,
  FavoriteBorderOutlined,
  GroupOutlined,
  LocalDiningOutlined,
  RemoveRedEyeOutlined,
  ShareOutlined,
  Star,
} from "@mui/icons-material";

import UserAvatar from "../../../components/UserAvatar";

import styles from "../RecipeDetail.module.css";
import { formatDate } from "../recipeDetailUtils";

export default function RecipeOverview({
  recipe,
  comments,
  averageRating,
  liked,
  bookmarked,
  likeCount,
  likeLoading,
  bookmarkLoading,
  shareCopied,
  onLikeToggle,
  onBookmarkToggle,
  onShare,
}) {
  /**
   * profiles의 현재 닉네임을 우선 사용하고,
   * profiles가 없을 경우 기존 recipes.nickname을 fallback으로 사용한다.
   */
  const authorName = recipe.profile?.nickname || recipe.nickname || "사용자";

  const authorAvatarUrl = recipe.profile?.avatar_url || null;

  return (
    <>
      <section className={styles.hero}>
        <img
          src={recipe.thumbnail_url}
          alt={`${recipe.title} 완성 이미지`}
          fetchPriority="high"
          decoding="async"
        />
      </section>

      <section className={styles.intro}>
        <p className={`text-sm ${styles.category}`}>{recipe.cuisine}</p>

        <h1 className={`font-display dtext-4xl ${styles.title}`}>{recipe.title}</h1>

        <p className={`text-m ${styles.description}`}>{recipe.summary}</p>

        <div className={styles.authorRow}>
          <div className={styles.author}>
            <UserAvatar src={authorAvatarUrl} name={authorName} size="md" />

            <div>
              <p className={`text-sm ${styles.authorName}`}>{authorName}</p>

              <p className={`text-s ${styles.date}`}>{formatDate(recipe.created_at)}</p>
            </div>
          </div>

          <div className={`text-sm ${styles.rating}`}>
            <div className={styles.stars}>
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  fontSize="small"
                  style={{
                    color:
                      star <= Math.round(averageRating)
                        ? "var(--brand-primary)"
                        : "var(--brand-beige)",
                  }}
                />
              ))}
            </div>

            <span>{comments.length > 0 ? averageRating.toFixed(1) : "0.0"}</span>
          </div>
        </div>
      </section>

      <section className={styles.recipeInfo}>
        <div className={styles.infoItem}>
          <AccessTimeOutlined />

          <div>
            <span className="text-s">조리 시간</span>

            <strong className="text-sm">{recipe.cooking_time}</strong>
          </div>
        </div>

        <div className={styles.infoItem}>
          <LocalDiningOutlined />

          <div>
            <span className="text-s">난이도</span>

            <strong className="text-sm">{recipe.difficulty}</strong>
          </div>
        </div>

        <div className={styles.infoItem}>
          <GroupOutlined />

          <div>
            <span className="text-s">인분</span>

            <strong className="text-sm">{recipe.servings}</strong>
          </div>
        </div>

        <div className={styles.infoItem}>
          <RemoveRedEyeOutlined />

          <div>
            <span className="text-s">조회 수</span>

            <strong className="text-sm">{Number(recipe.view_count ?? 0).toLocaleString()}</strong>
          </div>
        </div>
      </section>

      <section className={styles.actions}>
        <button
          type="button"
          className="text-sm"
          onClick={onLikeToggle}
          disabled={likeLoading}
          aria-pressed={liked}
          style={{
            color: liked ? "var(--brand-primary)" : undefined,
          }}
        >
          {liked ? <Favorite /> : <FavoriteBorderOutlined />}
          좋아요 {likeCount}
        </button>

        <button
          type="button"
          className="text-sm"
          onClick={onBookmarkToggle}
          disabled={bookmarkLoading}
          aria-pressed={bookmarked}
          style={{
            color: bookmarked ? "var(--brand-primary)" : undefined,
          }}
        >
          {bookmarked ? <Bookmark /> : <BookmarkBorderOutlined />}
          즐겨찾기
        </button>

        <button
          type="button"
          className={`text-sm ${shareCopied ? styles.shareSuccess : ""}`}
          onClick={onShare}
        >
          <ShareOutlined />

          {shareCopied ? "복사됨" : "공유"}
        </button>
      </section>
    </>
  );
}
