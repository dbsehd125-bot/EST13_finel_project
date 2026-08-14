/**
 * 연관 레시피 목록 컴포넌트
 * - 현재 레시피와 같은 cuisine의 추천 레시피 카드 표시
 * - 카드 클릭 시 해당 레시피 상세 페이지로 이동
 * - 연관 레시피별 좋아요 상태와 좋아요 토글 버튼 제공
 */
import {
  AccessTimeOutlined,
  Favorite,
  FavoriteBorderOutlined,
  LocalDiningOutlined,
} from "@mui/icons-material";

import styles from "../RecipeDetail.module.css";

export default function RelatedRecipes({
  recipes,
  likedIds,
  loadingIds,
  onRecipeClick,
  onLikeToggle,
}) {
  if (!recipes.length) return null;

  return (
    <section className={styles.relatedSection}>
      <h2 className={`font-display dtext-2xl ${styles.relatedTitle}`}>
        이 레시피와 함께 보면 좋아요
      </h2>

      <div className={styles.relatedList}>
        {recipes.map(recipe => (
          <article
            key={recipe.id}
            className={styles.relatedCard}
            onClick={() => onRecipeClick(recipe.id)}
          >
            <div className={styles.relatedImageArea}>
              <img
                src={recipe.thumbnail_url}
                alt={`${recipe.title} 레시피`}
                loading="lazy"
                decoding="async"
              />
              <span className={`text-s ${styles.relatedTag}`}>{recipe.cuisine}</span>

              <button
                type="button"
                className={`${styles.cardFavorite} ${
                  likedIds.has(recipe.id) ? styles.cardFavoriteActive : ""
                }`}
                aria-label={likedIds.has(recipe.id) ? "레시피 좋아요 취소" : "레시피 좋아요"}
                aria-pressed={likedIds.has(recipe.id)}
                disabled={loadingIds.has(recipe.id)}
                onClick={event => onLikeToggle(event, recipe)}
              >
                {likedIds.has(recipe.id) ? (
                  <Favorite fontSize="small" />
                ) : (
                  <FavoriteBorderOutlined fontSize="small" />
                )}
              </button>
            </div>

            <div className={styles.relatedContent}>
              <h3 className="text-lg">{recipe.title}</h3>

              <div className={`text-s ${styles.relatedMeta}`}>
                <span>
                  <AccessTimeOutlined fontSize="inherit" />
                  {recipe.cooking_time}
                </span>
                <span>
                  <LocalDiningOutlined fontSize="inherit" />
                  {recipe.difficulty}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
