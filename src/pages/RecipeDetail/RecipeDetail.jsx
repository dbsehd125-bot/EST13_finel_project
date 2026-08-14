/**
 * 레시피 상세 메인 페이지
 * - URL의 레시피 id를 기준으로 상세 데이터와 사용자 반응/후기 상태를 연결
 * - 상단 정보, AI 요약, 조리 과정, 후기, 연관 레시피 컴포넌트를 조합
 * - 실제 데이터 처리 로직은 RecipeDetail 전용 custom hook에 위임
 */
import { useNavigate, useParams } from "react-router";

import Layout from "../../components/Layout";
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

import SEO from "../../components/SEO";

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

  if (loading) {
    return (
      <Layout activeMenu="레시피 둘러보기">
        <div className={styles.stateMessage}>레시피를 불러오는 중입니다.</div>
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

  return (
    <Layout activeMenu="레시피 둘러보기">
      <SEO
        title={`${recipe.title} | 깃깔나는 레시피`}
        description={recipe.summary}
        image={recipe.thumbnail_url}
        url={`/recipes/${recipe.id}`}
        type="article"
      />
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
