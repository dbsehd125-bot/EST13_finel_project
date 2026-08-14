/**
 * 레시피 반응 기능 관리 Custom Hook
 * - 현재 레시피 좋아요/즐겨찾기 상태 조회 및 토글
 * - 연관 레시피의 좋아요 상태 조회 및 토글
 * - 좋아요는 Supabase RPC를 통해 원자적으로 처리
 * - 현재 상세 페이지 주소 공유(클립보드 복사)
 * - 비로그인 사용자의 인증 페이지 이동 처리
 */
import { useEffect, useState } from "react";

import { supabase } from "../../../lib/supabaseClient";

export default function useRecipeReactions({
  recipe,
  setRecipe,
  relatedRecipes,
  setRelatedRecipes,
  user,
  authLoading,
  navigate,
  showNotification,
}) {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const [relatedLikedIds, setRelatedLikedIds] = useState(() => new Set());
  const [relatedLikeLoadingIds, setRelatedLikeLoadingIds] = useState(() => new Set());

  const moveToLogin = () => {
    if (!recipe?.id) return;

    navigate("/login", {
      state: { from: `/recipes/${recipe.id}` },
    });
  };

  /**
   * 레시피가 바뀌면 현재 반응 상태 초기화
   */
  useEffect(() => {
    if (!recipe?.id) return;

    setLiked(false);
    setBookmarked(false);
    setLikeCount(Number(recipe.like_count ?? 0));
    setShareCopied(false);
    setRelatedLikedIds(new Set());
  }, [recipe?.id]);

  /**
   * 현재 로그인 사용자의
   * 좋아요 / 즐겨찾기 상태 조회
   */
  useEffect(() => {
    if (authLoading || !recipe?.id) return;

    if (!user) {
      setLiked(false);
      setBookmarked(false);
      return;
    }

    const loadMyReactions = async () => {
      try {
        const [likeResult, bookmarkResult] = await Promise.all([
          supabase
            .from("recipe_likes")
            .select("id")
            .eq("recipe_id", recipe.id)
            .eq("user_id", user.id)
            .maybeSingle(),

          supabase
            .from("recipe_bookmarks")
            .select("id")
            .eq("recipe_id", recipe.id)
            .eq("user_id", user.id)
            .maybeSingle(),
        ]);

        if (likeResult.error) {
          console.error("레시피 좋아요 상태 조회 오류:", likeResult.error);
        } else {
          setLiked(Boolean(likeResult.data));
        }

        if (bookmarkResult.error) {
          console.error("레시피 즐겨찾기 상태 조회 오류:", bookmarkResult.error);
        } else {
          setBookmarked(Boolean(bookmarkResult.data));
        }
      } catch (error) {
        console.error("좋아요/즐겨찾기 상태 조회 오류:", error);
      }
    };

    loadMyReactions();
  }, [authLoading, user?.id, recipe?.id]);

  /**
   * 연관 레시피의 좋아요 상태 조회
   */
  useEffect(() => {
    if (authLoading || relatedRecipes.length === 0) return;

    if (!user) {
      setRelatedLikedIds(new Set());
      return;
    }

    const loadRelatedLikes = async () => {
      const relatedRecipeIds = relatedRecipes.map(item => item.id);

      const { data, error } = await supabase
        .from("recipe_likes")
        .select("recipe_id")
        .eq("user_id", user.id)
        .in("recipe_id", relatedRecipeIds);

      if (error) {
        console.error("연관 레시피 좋아요 상태 조회 오류:", error);
        return;
      }

      setRelatedLikedIds(new Set((data || []).map(item => item.recipe_id)));
    };

    loadRelatedLikes();
  }, [authLoading, user?.id, relatedRecipes]);

  /**
   * 현재 레시피 좋아요 토글
   *
   * recipe_likes INSERT/DELETE +
   * recipes.like_count 증감을
   * toggle_recipe_like RPC 내부에서 한 번에 처리한다.
   */
  const handleLikeToggle = async () => {
    if (authLoading || likeLoading || !recipe?.id) return;

    if (!user) {
      return moveToLogin();
    }

    try {
      setLikeLoading(true);

      const { data, error } = await supabase
        .rpc("toggle_recipe_like", {
          target_recipe_id: recipe.id,
        })
        .single();

      if (error) throw error;

      const nextLiked = Boolean(data?.is_liked);
      const nextLikeCount = Number(data?.new_like_count ?? 0);

      setLiked(nextLiked);
      setLikeCount(nextLikeCount);

      setRecipe(previousRecipe => {
        if (!previousRecipe || previousRecipe.id !== recipe.id) {
          return previousRecipe;
        }

        return {
          ...previousRecipe,
          like_count: nextLikeCount,
        };
      });
    } catch (error) {
      console.error("레시피 좋아요 처리 오류:", error);

      showNotification(error.message || "좋아요 처리에 실패했습니다.", "error");
    } finally {
      setLikeLoading(false);
    }
  };

  /**
   * 즐겨찾기 토글
   */
  const handleBookmarkToggle = async () => {
    if (authLoading || bookmarkLoading || !recipe?.id) return;

    if (!user) {
      return moveToLogin();
    }

    try {
      setBookmarkLoading(true);

      if (bookmarked) {
        const { error } = await supabase
          .from("recipe_bookmarks")
          .delete()
          .eq("recipe_id", recipe.id)
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("recipe_bookmarks").insert({
          recipe_id: recipe.id,
          user_id: user.id,
        });

        if (error) throw error;
      }

      setBookmarked(previousBookmarked => !previousBookmarked);
    } catch (error) {
      console.error("레시피 즐겨찾기 처리 오류:", error);

      showNotification(error.message || "즐겨찾기 처리에 실패했습니다.", "error");
    } finally {
      setBookmarkLoading(false);
    }
  };

  /**
   * 현재 페이지 주소 복사
   */
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);

      setShareCopied(true);

      window.setTimeout(() => {
        setShareCopied(false);
      }, 1500);
    } catch (error) {
      console.error("링크 복사 실패:", error);

      showNotification("링크를 복사하지 못했습니다.", "error");
    }
  };

  /**
   * 연관 레시피 좋아요 토글
   * 현재 레시피와 동일한 RPC 사용
   */
  const handleRelatedLikeToggle = async (event, relatedRecipe) => {
    event.stopPropagation();

    if (authLoading || !relatedRecipe?.id || relatedLikeLoadingIds.has(relatedRecipe.id)) {
      return;
    }

    if (!user) {
      return moveToLogin();
    }

    const recipeId = relatedRecipe.id;

    setRelatedLikeLoadingIds(previousIds => {
      const nextIds = new Set(previousIds);
      nextIds.add(recipeId);
      return nextIds;
    });

    try {
      const { data, error } = await supabase
        .rpc("toggle_recipe_like", {
          target_recipe_id: recipeId,
        })
        .single();

      if (error) throw error;

      const nextLiked = Boolean(data?.is_liked);
      const nextLikeCount = Number(data?.new_like_count ?? 0);

      setRelatedLikedIds(previousIds => {
        const nextIds = new Set(previousIds);

        if (nextLiked) {
          nextIds.add(recipeId);
        } else {
          nextIds.delete(recipeId);
        }

        return nextIds;
      });

      setRelatedRecipes(previousRecipes =>
        previousRecipes.map(item =>
          item.id === recipeId
            ? {
                ...item,
                like_count: nextLikeCount,
              }
            : item,
        ),
      );
    } catch (error) {
      console.error("연관 레시피 좋아요 처리 오류:", error);

      showNotification(error.message || "좋아요 처리에 실패했습니다.", "error");
    } finally {
      setRelatedLikeLoadingIds(previousIds => {
        const nextIds = new Set(previousIds);
        nextIds.delete(recipeId);
        return nextIds;
      });
    }
  };

  return {
    liked,
    bookmarked,
    likeCount,
    likeLoading,
    bookmarkLoading,
    shareCopied,
    relatedLikedIds,
    relatedLikeLoadingIds,
    handleLikeToggle,
    handleBookmarkToggle,
    handleShare,
    handleRelatedLikeToggle,
  };
}
