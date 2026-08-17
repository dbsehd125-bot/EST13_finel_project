/**
 * 레시피 상세 메인 페이지
 * - URL의 레시피 id를 기준으로 상세 데이터와 사용자 반응/후기 상태를 연결
 * - 상단 정보, AI 요약, 조리 과정, 후기, 연관 레시피 컴포넌트를 조합
 * - 실제 데이터 처리 로직은 RecipeDetail 전용 custom hook에 위임
 */
import { useNavigate, useParams } from "react-router";

import Layout from "../../components/Layout";
import SEO from "../../components/SEO";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";

import styles from "./RecipeDetail.module.css";

import RecipeAiSummary from "./components/RecipeAiSummary";
import RecipeOverview from "./components/RecipeOverview";
import RecipeReviews from "./components/RecipeReviews";
import RecipeSteps from "./components/RecipeSteps";
import RelatedRecipes from "./components/RelatedRecipes";

import useRecipeData from "./hooks/useRecipeData";
import useRecipeReactions from "./hooks/useRecipeReactions";
import useRecipeReviews from "./hooks/useRecipeReviews";

const DEFAULT_OG_IMAGE = "https://est-fe-13-3st-finalproject.vercel.app/og-default.png";

/**
 * Recipe JSON-LD용 재료 문자열 변환
 *
 * 예)
 * { name: "양파", amount: "1", unit: "개" }
 * -> "양파 1개"
 */
function formatIngredientForJsonLd(ingredient) {
  if (typeof ingredient === "string") {
    return ingredient;
  }

  if (!ingredient || typeof ingredient !== "object") {
    return "";
  }

  const name = ingredient.name || "";
  const amount = ingredient.amount || ingredient.quantity || "";
  const unit = ingredient.unit || "";

  return `${name} ${amount}${unit}`.trim();
}

/**
 * cooking_time을 Schema.org에서 사용하는
 * ISO 8601 Duration 형식으로 변환
 *
 * 예)
 * "30분" -> "PT30M"
 * "1시간" -> "PT1H"
 * "1시간 30분" -> "PT1H30M"
 */
function convertCookingTimeToIsoDuration(cookingTime) {
  if (!cookingTime) {
    return undefined;
  }

  const text = String(cookingTime).trim();

  const hourMatch = text.match(/(\d+)\s*시간/);

  const minuteMatch = text.match(/(\d+)\s*분/);

  const hours = hourMatch ? Number(hourMatch[1]) : 0;

  const minutes = minuteMatch ? Number(minuteMatch[1]) : 0;

  if (hours === 0 && minutes === 0) {
    return undefined;
  }

  let duration = "PT";

  if (hours > 0) {
    duration += `${hours}H`;
  }

  if (minutes > 0) {
    duration += `${minutes}M`;
  }

  return duration;
}

/**
 * 상세페이지 로딩 스켈레톤
 *
 * 실제 상세페이지 상단 구조와 비슷한 높이를
 * 로딩 단계에서 미리 확보해
 * 데이터 로드 후 발생하는 CLS를 줄인다.
 */
function RecipeDetailSkeleton() {
  return (
    <div className={styles.detailSkeleton} aria-hidden="true">
      {/* 대표 이미지 */}
      <div className={`${styles.skeletonBlock} ${styles.skeletonHero}`} />

      {/* 기본 정보 */}
      <div className={styles.skeletonIntro}>
        <div className={`${styles.skeletonBlock} ${styles.skeletonCategory}`} />

        <div className={`${styles.skeletonBlock} ${styles.skeletonTitle}`} />

        <div className={`${styles.skeletonBlock} ${styles.skeletonDescription}`} />

        <div className={styles.skeletonAuthorRow}>
          <div className={styles.skeletonAuthor}>
            <div className={`${styles.skeletonBlock} ${styles.skeletonAvatar}`} />

            <div className={styles.skeletonAuthorText}>
              <div className={`${styles.skeletonBlock} ${styles.skeletonAuthorName}`} />

              <div className={`${styles.skeletonBlock} ${styles.skeletonDate}`} />
            </div>
          </div>

          <div className={`${styles.skeletonBlock} ${styles.skeletonRating}`} />
        </div>
      </div>

      {/* 조리시간 / 난이도 / 인분 / 조회수 */}
      <div className={styles.skeletonRecipeInfo}>
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className={styles.skeletonInfoItem}>
            <div className={`${styles.skeletonBlock} ${styles.skeletonInfoIcon}`} />

            <div className={styles.skeletonInfoText}>
              <div className={`${styles.skeletonBlock} ${styles.skeletonInfoLabel}`} />

              <div className={`${styles.skeletonBlock} ${styles.skeletonInfoValue}`} />
            </div>
          </div>
        ))}
      </div>

      {/* 액션 */}
      <div className={styles.skeletonActions}>
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className={`${styles.skeletonBlock} ${styles.skeletonAction}`} />
        ))}
      </div>

      {/* AI 요약 */}
      <div className={styles.skeletonAiSummary}>
        <div className={`${styles.skeletonBlock} ${styles.skeletonAiTitle}`} />

        <div className={styles.skeletonAiList}>
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className={styles.skeletonAiRow}>
              <div className={`${styles.skeletonBlock} ${styles.skeletonAiNumber}`} />

              <div className={`${styles.skeletonBlock} ${styles.skeletonAiText}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function RecipeDetail() {
  const { id } = useParams();

  const navigate = useNavigate();

  const { user, authLoading } = useAuth();

  const { showNotification } = useNotification();

  const {
    recipe,
    setRecipe,

    relatedRecipes,
    setRelatedRecipes,

    loading,
    errorMessage,

    aiStepSummaries,
    aiSummaryLoading,
    aiSummaryError,
  } = useRecipeData(id);

  const reactions = useRecipeReactions({
    recipe,
    setRecipe,

    relatedRecipes,
    setRelatedRecipes,

    user,
    authLoading,

    navigate,

    showNotification,
  });

  const reviews = useRecipeReviews({
    recipe,

    user,
    authLoading,

    navigate,

    showNotification,
  });

  /**
   * 기존에는 높이 400px짜리 텍스트 로딩 화면만 사용해서
   * 실제 상세페이지가 렌더링될 때 큰 레이아웃 이동이 발생할 수 있었다.
   *
   * 실제 상단 구조와 비슷한 스켈레톤을 먼저 렌더링해서
   * 최초 레이아웃 높이를 안정적으로 확보한다.
   */
  if (loading) {
    return (
      <Layout activeMenu="레시피 둘러보기">
        <RecipeDetailSkeleton />
      </Layout>
    );
  }

  if (errorMessage || !recipe) {
    return (
      <Layout activeMenu="레시피 둘러보기">
        <div className={styles.stateMessage}>{errorMessage || "레시피를 찾을 수 없습니다."}</div>
      </Layout>
    );
  }

  /**
   * Recipe 구조화 데이터(JSON-LD)
   *
   * 검색엔진이 현재 페이지를 일반 웹페이지가 아닌
   * "레시피" 콘텐츠로 이해할 수 있도록 Schema.org 형식으로 제공한다.
   */
  const recipeJsonLd = {
    "@context": "https://schema.org",

    "@type": "Recipe",

    name: recipe.title,

    description: recipe.summary,

    image: [recipe.thumbnail_url || DEFAULT_OG_IMAGE],

    author: {
      "@type": "Person",

      name: recipe.nickname || "깃깔나는 레시피 사용자",
    },

    recipeYield: recipe.servings || undefined,

    recipeCuisine: recipe.cuisine || undefined,

    totalTime: convertCookingTimeToIsoDuration(recipe.cooking_time),

    keywords:
      Array.isArray(recipe.tags) && recipe.tags.length > 0 ? recipe.tags.join(", ") : undefined,

    recipeIngredient: Array.isArray(recipe.ingredients)
      ? recipe.ingredients.map(formatIngredientForJsonLd).filter(Boolean)
      : [],

    recipeInstructions: Array.isArray(recipe.steps)
      ? recipe.steps.map((step, index) => ({
          "@type": "HowToStep",

          position: index + 1,

          name: step.title || `${step.step || index + 1}단계`,

          text: step.description || step.title || "",
        }))
      : [],
  };

  return (
    <Layout activeMenu="레시피 둘러보기">
      <SEO
        title={`${recipe.title} | 깃깔나는 레시피`}
        description={recipe.summary}
        image={recipe.thumbnail_url}
        url={`/recipes/${recipe.id}`}
        type="article"
      />

      <script type="application/ld+json">{JSON.stringify(recipeJsonLd)}</script>

      <RecipeOverview
        recipe={recipe}
        comments={reviews.comments}
        averageRating={reviews.averageRating}
        liked={reactions.liked}
        bookmarked={reactions.bookmarked}
        likeCount={reactions.likeCount}
        likeLoading={reactions.likeLoading}
        bookmarkLoading={reactions.bookmarkLoading}
        shareCopied={reactions.shareCopied}
        onLikeToggle={reactions.handleLikeToggle}
        onBookmarkToggle={reactions.handleBookmarkToggle}
        onShare={reactions.handleShare}
      />

      <RecipeAiSummary
        recipe={recipe}
        aiStepSummaries={aiStepSummaries}
        aiSummaryLoading={aiSummaryLoading}
        aiSummaryError={aiSummaryError}
      />

      <RecipeSteps steps={recipe.steps} />

      <RecipeReviews
        comments={reviews.comments}
        commentText={reviews.commentText}
        setCommentText={reviews.setCommentText}
        commentLoading={reviews.commentLoading}
        commentSubmitting={reviews.commentSubmitting}
        reviewRating={reviews.reviewRating}
        setReviewRating={reviews.setReviewRating}
        hoverRating={reviews.hoverRating}
        setHoverRating={reviews.setHoverRating}
        reviewImagePreview={reviews.reviewImagePreview}
        onReviewImageChange={reviews.handleReviewImageChange}
        onRemoveReviewImage={reviews.handleRemoveReviewImage}
        onCommentSubmit={reviews.handleCommentSubmit}
      />

      <RelatedRecipes
        recipes={relatedRecipes}
        likedIds={reactions.relatedLikedIds}
        loadingIds={reactions.relatedLikeLoadingIds}
        onRecipeClick={recipeId => navigate(`/recipes/${recipeId}`)}
        onLikeToggle={reactions.handleRelatedLikeToggle}
      />
    </Layout>
  );
}
