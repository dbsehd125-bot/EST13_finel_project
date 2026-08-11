import {
  AccessTimeOutlined,
  AddPhotoAlternateOutlined,
  Bookmark,
  BookmarkBorderOutlined,
  Favorite,
  FavoriteBorderOutlined,
  GroupOutlined,
  LightbulbOutlined,
  LocalDiningOutlined,
  RemoveRedEyeOutlined,
  ShareOutlined,
  Star,
  StarBorder,
} from "@mui/icons-material";

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";

import styles from "./RecipeDetail.module.css";
import Layout from "../../components/Layout";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { getCurrentAlanClientId, getNextAlanClientId, isFailoverError } from "../../utils/AlanApi";

const API_BASE = "/api/v1";

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user, authLoading } = useAuth();

  const [recipe, setRecipe] = useState(null);
  const [relatedRecipes, setRelatedRecipes] = useState([]);

  // 조회수 중복 증가 방지
  const lastViewedRecipeIdRef = useRef(null);

  // 공유
  const [shareCopied, setShareCopied] = useState(false);

  // Alan AI 단계 요약
  const [aiStepSummaries, setAiStepSummaries] = useState([]);
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [aiSummaryError, setAiSummaryError] = useState(false);

  // 연관 레시피 좋아요
  const [relatedLikedIds, setRelatedLikedIds] = useState(() => new Set());
  const [relatedLikeLoadingIds, setRelatedLikeLoadingIds] = useState(() => new Set());

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // 좋아요 / 즐겨찾기
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // 좋아요 / 즐겨찾기 중복 클릭 방지
  const [likeLoading, setLikeLoading] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  // 완성 후기
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  // 후기 별점
  const [reviewRating, setReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  // 후기 이미지
  const [reviewImageFile, setReviewImageFile] = useState(null);
  const [reviewImagePreview, setReviewImagePreview] = useState("");

  // 다른 레시피로 이동할 때 스크롤 맨 위로
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  /**
   * 레시피 상세 + 연관 레시피 조회
   */
  useEffect(() => {
    const fetchRecipeData = async () => {
      try {
        setLoading(true);
        setErrorMessage("");
        setRelatedRecipes([]);

        // 다른 레시피 이동 시 이전 상태 초기화
        setLiked(false);
        setBookmarked(false);
        setLikeCount(0);
        setShareCopied(false);
        setAiStepSummaries([]);
        setAiSummaryError(false);
        setRelatedLikedIds(new Set());

        /* =========================
           현재 레시피 조회
        ========================= */

        const { data: recipeData, error: recipeError } = await supabase
          .from("recipes")
          .select("*")
          .eq("id", id)
          .single();

        if (recipeError) {
          throw recipeError;
        }

        setRecipe(recipeData);

        // DB에 저장된 좋아요 수
        setLikeCount(recipeData.like_count ?? 0);

        /* =========================
           연관 레시피 조회
        ========================= */

        try {
          const { data: relatedData, error: relatedError } = await supabase
            .from("recipes")
            .select(
              `
              id,
              thumbnail_url,
              cuisine,
              title,
              cooking_time,
              difficulty,
              like_count
            `,
            )
            .eq("cuisine", recipeData.cuisine)
            .neq("id", recipeData.id)
            .limit(4);

          if (relatedError) {
            throw relatedError;
          }

          setRelatedRecipes(relatedData || []);
        } catch (relatedError) {
          console.error("연관 레시피 조회 실패:", relatedError);
          setRelatedRecipes([]);
        }
      } catch (error) {
        console.error("레시피 조회 실패:", error);

        setRecipe(null);
        setErrorMessage("레시피를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipeData();
  }, [id]);

  /**
   * 상세 페이지 진입 시 조회수 1 증가
   */
  useEffect(() => {
    if (!recipe?.id) {
      return;
    }

    if (lastViewedRecipeIdRef.current === recipe.id) {
      return;
    }

    lastViewedRecipeIdRef.current = recipe.id;

    const increaseViewCount = async () => {
      const { data, error } = await supabase.rpc("increment_recipe_view", {
        target_recipe_id: recipe.id,
      });

      if (error) {
        console.error("조회수 증가 실패:", error);
        return;
      }

      setRecipe(previousRecipe => {
        if (!previousRecipe || previousRecipe.id !== recipe.id) {
          return previousRecipe;
        }

        return {
          ...previousRecipe,
          view_count: Number(data ?? previousRecipe.view_count ?? 0),
        };
      });
    };

    increaseViewCount();
  }, [recipe?.id]);

  /**
   * 현재 로그인 사용자의
   * 좋아요 / 즐겨찾기 상태 조회
   */
  useEffect(() => {
    if (authLoading || !recipe?.id) {
      return;
    }

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
   * 현재 로그인 사용자의 연관 레시피 좋아요 상태 조회
   */
  useEffect(() => {
    if (authLoading || relatedRecipes.length === 0) {
      return;
    }

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
   * 완성 후기 조회
   */
  useEffect(() => {
    if (!recipe?.id) {
      return;
    }

    const fetchComments = async () => {
      try {
        setCommentLoading(true);
        setComments([]);
        setCommentText("");
        setReviewRating(0);
        setHoverRating(0);
        setReviewImageFile(null);
        setReviewImagePreview("");

        const { data, error } = await supabase
          .from("recipe_comments")
          .select("*")
          .eq("recipe_id", recipe.id)
          .order("created_at", {
            ascending: true,
          });

        if (error) {
          throw error;
        }

        setComments(data || []);
      } catch (error) {
        console.error("완성 후기 조회 오류:", error);

        setComments([]);
      } finally {
        setCommentLoading(false);
      }
    };

    fetchComments();
  }, [recipe?.id]);

  /**
   * Alan API로 각 조리 단계를 한 문장으로 요약
   */
  useEffect(() => {
    if (!recipe?.id || !Array.isArray(recipe.steps) || recipe.steps.length === 0) {
      setAiStepSummaries([]);
      setAiSummaryLoading(false);
      setAiSummaryError(false);
      return;
    }

    let cancelled = false;

    const fetchAiStepSummaries = async () => {
      try {
        setAiSummaryLoading(true);
        setAiSummaryError(false);
        setAiStepSummaries([]);

        const stepText = recipe.steps
          .map(
            step =>
              `${step.step}단계 | 제목: ${step.title || ""} | 설명: ${step.description || ""}`,
          )
          .join(" / ");

        const prompt =
          `다음 요리 레시피의 각 조리 단계를 핵심 행동만 남겨 한 문장으로 짧게 요약해줘. ` +
          `반드시 입력된 단계 개수와 같은 개수로 작성하고, 순서를 바꾸거나 단계를 합치지 마. ` +
          `응답은 다른 설명이나 마크다운 없이 순수 JSON 객체 하나만 반환해. ` +
          `JSON 형식은 {"summaries":[{"step":1,"summary":"요약 문장"}]} 이야. ` +
          `모든 summary는 한국어로 작성해. 레시피명: ${recipe.title}. 조리 단계: ${stepText}`;

        let alanClientId = getCurrentAlanClientId();
        let response = null;

        while (alanClientId) {
          const queryString = new URLSearchParams({
            content: prompt,
            client_id: alanClientId,
          }).toString();

          let currentResponse = null;

          try {
            currentResponse = await fetch(`${API_BASE}/question?${queryString}`);
          } catch (networkError) {
            console.warn("Alan AI 요약 네트워크 오류:", networkError);
            alanClientId = getNextAlanClientId();
            continue;
          }

          if (currentResponse.ok) {
            response = currentResponse;
            break;
          }

          if (isFailoverError(currentResponse.status)) {
            alanClientId = getNextAlanClientId();
            continue;
          }

          throw new Error(`Alan API 요청 실패 (Status: ${currentResponse.status})`);
        }

        if (!response) {
          throw new Error("Alan API 요청에 사용할 수 있는 Client ID가 없습니다.");
        }

        const data = await response.json();

        const rawContent =
          data.content || data.answer || (typeof data === "string" ? data : JSON.stringify(data));

        const cleanedContent = rawContent
          .replace(/```json/gi, "")
          .replace(/```/g, "")
          .trim();

        const parsed = JSON.parse(cleanedContent);

        if (!Array.isArray(parsed.summaries)) {
          throw new Error("Alan API 요약 응답 형식이 올바르지 않습니다.");
        }

        const summaryMap = new Map(
          parsed.summaries.map(item => [Number(item.step), String(item.summary || "").trim()]),
        );

        const normalizedSummaries = recipe.steps.map(step => ({
          step: step.step,
          summary:
            summaryMap.get(Number(step.step)) || step.description?.trim() || step.title || "",
        }));

        if (!cancelled) {
          setAiStepSummaries(normalizedSummaries);
        }
      } catch (error) {
        console.error("Alan AI 단계 요약 실패:", error);

        if (!cancelled) {
          setAiSummaryError(true);

          setAiStepSummaries(
            recipe.steps.map(step => ({
              step: step.step,
              summary: step.description?.trim() || step.title || "",
            })),
          );
        }
      } finally {
        if (!cancelled) {
          setAiSummaryLoading(false);
        }
      }
    };

    fetchAiStepSummaries();

    return () => {
      cancelled = true;
    };
  }, [recipe?.id]);

  /**
   * 후기 평균 별점
   */
  const averageRating = useMemo(() => {
    if (comments.length === 0) {
      return 0;
    }

    const validRatings = comments
      .map(comment => Number(comment.rating))
      .filter(rating => rating >= 1 && rating <= 5);

    if (validRatings.length === 0) {
      return 0;
    }

    const total = validRatings.reduce((sum, rating) => sum + rating, 0);

    return total / validRatings.length;
  }, [comments]);

  /**
   * 로그인 페이지 이동
   */
  const moveToLogin = () => {
    navigate("/login", {
      state: {
        from: `/recipes/${recipe.id}`,
      },
    });
  };

  /**
   * 좋아요 토글
   */
  const handleLikeToggle = async () => {
    if (authLoading || likeLoading || !recipe) {
      return;
    }

    if (!user) {
      moveToLogin();
      return;
    }

    try {
      setLikeLoading(true);

      if (liked) {
        const { error } = await supabase
          .from("recipe_likes")
          .delete()
          .eq("recipe_id", recipe.id)
          .eq("user_id", user.id);

        if (error) {
          throw error;
        }
      } else {
        const { error } = await supabase.from("recipe_likes").insert({
          recipe_id: recipe.id,
          user_id: user.id,
        });

        if (error) {
          throw error;
        }
      }

      const nextLikeCount = liked ? Math.max(0, likeCount - 1) : likeCount + 1;

      const { error: countUpdateError } = await supabase
        .from("recipes")
        .update({
          like_count: nextLikeCount,
        })
        .eq("id", recipe.id);

      if (countUpdateError) {
        throw countUpdateError;
      }

      setLiked(!liked);
      setLikeCount(nextLikeCount);

      setRecipe(previousRecipe => ({
        ...previousRecipe,
        like_count: nextLikeCount,
      }));
    } catch (error) {
      console.error("레시피 좋아요 처리 오류:", error);

      alert(error.message || "좋아요 처리에 실패했습니다.");
    } finally {
      setLikeLoading(false);
    }
  };

  /**
   * 현재 상세 페이지 주소 클립보드 복사
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
      alert("링크를 복사하지 못했습니다.");
    }
  };

  /**
   * 연관 레시피 좋아요 토글
   */
  const handleRelatedLikeToggle = async (event, relatedRecipe) => {
    event.stopPropagation();

    if (authLoading || !relatedRecipe?.id || relatedLikeLoadingIds.has(relatedRecipe.id)) {
      return;
    }

    if (!user) {
      moveToLogin();
      return;
    }

    const recipeId = relatedRecipe.id;
    const isLiked = relatedLikedIds.has(recipeId);

    setRelatedLikeLoadingIds(previousIds => {
      const nextIds = new Set(previousIds);
      nextIds.add(recipeId);
      return nextIds;
    });

    try {
      if (isLiked) {
        const { error } = await supabase
          .from("recipe_likes")
          .delete()
          .eq("recipe_id", recipeId)
          .eq("user_id", user.id);

        if (error) {
          throw error;
        }
      } else {
        const { error } = await supabase.from("recipe_likes").insert({
          recipe_id: recipeId,
          user_id: user.id,
        });

        if (error) {
          throw error;
        }
      }

      const previousLikeCount = Number(relatedRecipe.like_count ?? 0);
      const nextLikeCount = isLiked ? Math.max(0, previousLikeCount - 1) : previousLikeCount + 1;

      const { error: countUpdateError } = await supabase
        .from("recipes")
        .update({
          like_count: nextLikeCount,
        })
        .eq("id", recipeId);

      if (countUpdateError) {
        throw countUpdateError;
      }

      setRelatedLikedIds(previousIds => {
        const nextIds = new Set(previousIds);

        if (isLiked) {
          nextIds.delete(recipeId);
        } else {
          nextIds.add(recipeId);
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
      alert(error.message || "좋아요 처리에 실패했습니다.");
    } finally {
      setRelatedLikeLoadingIds(previousIds => {
        const nextIds = new Set(previousIds);
        nextIds.delete(recipeId);
        return nextIds;
      });
    }
  };

  /**
   * 즐겨찾기 토글
   */
  const handleBookmarkToggle = async () => {
    if (authLoading || bookmarkLoading || !recipe) {
      return;
    }

    if (!user) {
      moveToLogin();
      return;
    }

    try {
      setBookmarkLoading(true);

      if (bookmarked) {
        const { error } = await supabase
          .from("recipe_bookmarks")
          .delete()
          .eq("recipe_id", recipe.id)
          .eq("user_id", user.id);

        if (error) {
          throw error;
        }
      } else {
        const { error } = await supabase.from("recipe_bookmarks").insert({
          recipe_id: recipe.id,
          user_id: user.id,
        });

        if (error) {
          throw error;
        }
      }

      setBookmarked(!bookmarked);
    } catch (error) {
      console.error("레시피 즐겨찾기 처리 오류:", error);

      alert(error.message || "즐겨찾기 처리에 실패했습니다.");
    } finally {
      setBookmarkLoading(false);
    }
  };

  /**
   * 후기 이미지 선택
   */
  const handleReviewImageChange = event => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 첨부할 수 있습니다.");
      event.target.value = "";
      return;
    }

    const maxFileSize = 2 * 1024 * 1024;

    if (file.size > maxFileSize) {
      alert("이미지는 2MB 이하만 첨부할 수 있습니다.");
      event.target.value = "";
      return;
    }

    if (reviewImagePreview) {
      URL.revokeObjectURL(reviewImagePreview);
    }

    const previewUrl = URL.createObjectURL(file);

    setReviewImageFile(file);
    setReviewImagePreview(previewUrl);
  };

  /**
   * 선택한 후기 이미지 제거
   */
  const handleRemoveReviewImage = () => {
    if (reviewImagePreview) {
      URL.revokeObjectURL(reviewImagePreview);
    }

    setReviewImageFile(null);
    setReviewImagePreview("");
  };

  /**
   * 후기 이미지 Storage 업로드
   */
  const uploadReviewImage = async file => {
    if (!file || !user) {
      return null;
    }

    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "jpg";

    const imagePath = `reviews/${user.id}/${crypto.randomUUID()}.${fileExtension}`;

    const { error: uploadError } = await supabase.storage
      .from("recipe-images")
      .upload(imagePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: publicUrlData } = supabase.storage.from("recipe-images").getPublicUrl(imagePath);

    return publicUrlData.publicUrl;
  };

  /**
   * 완성 후기 등록
   */
  const handleCommentSubmit = async event => {
    event.preventDefault();

    if (authLoading || commentSubmitting || !recipe) {
      return;
    }

    if (!user) {
      moveToLogin();
      return;
    }

    /**
     * 별점은 필수
     */
    if (reviewRating < 1) {
      alert("별점을 선택해주세요.");
      return;
    }

    const trimmedComment = commentText.trim();

    let uploadedImageUrl = null;

    try {
      setCommentSubmitting(true);

      /**
       * 이미지가 있으면 먼저 Storage 업로드
       */
      if (reviewImageFile) {
        uploadedImageUrl = await uploadReviewImage(reviewImageFile);
      }

      const nickname =
        user.user_metadata?.nickname ||
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "사용자";

      /**
       * 내용은 선택사항
       * 이미지도 선택사항
       * 별점만 필수
       */
      const { data, error } = await supabase
        .from("recipe_comments")
        .insert({
          recipe_id: recipe.id,
          user_id: user.id,
          nickname,
          rating: reviewRating,
          content: trimmedComment || null,
          image_url: uploadedImageUrl || null,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setComments(previousComments => [...previousComments, data]);

      setCommentText("");
      setReviewRating(0);
      setHoverRating(0);

      if (reviewImagePreview) {
        URL.revokeObjectURL(reviewImagePreview);
      }

      setReviewImageFile(null);
      setReviewImagePreview("");
    } catch (error) {
      console.error("완성 후기 등록 오류:", error);

      alert(error.message || "완성 후기 등록에 실패했습니다.");
    } finally {
      setCommentSubmitting(false);
    }
  };

  /**
   * Supabase created_at 날짜
   * YYYY.MM.DD
   */
  const formatDate = dateString => {
    if (!dateString) {
      return "";
    }

    const date = new Date(dateString);

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    return `${year}.${month}.${day}`;
  };

  /* =========================
     로딩
  ========================= */

  if (loading) {
    return (
      <Layout activeMenu="레시피 둘러보기">
        <div className={styles.stateMessage}>레시피를 불러오는 중입니다.</div>
      </Layout>
    );
  }

  /* =========================
     조회 실패
  ========================= */

  if (errorMessage || !recipe) {
    return (
      <Layout activeMenu="레시피 둘러보기">
        <div className={styles.stateMessage}>{errorMessage || "레시피를 찾을 수 없습니다."}</div>
      </Layout>
    );
  }

  return (
    <Layout activeMenu="레시피 둘러보기">
      {/* =========================
          대표 이미지
      ========================= */}

      <section className={styles.hero}>
        <img src={recipe.thumbnail_url} alt={recipe.title} />
      </section>

      {/* =========================
          레시피 기본 정보
      ========================= */}

      <section className={styles.intro}>
        <p className={`text-sm ${styles.category}`}>{recipe.cuisine}</p>

        <h1 className={`font-display dtext-4xl ${styles.title}`}>{recipe.title}</h1>

        <p className={`text-m ${styles.description}`}>{recipe.summary}</p>

        <div className={styles.authorRow}>
          <div className={styles.author}>
            <div className={styles.authorImage} />

            <div>
              <p className={`text-sm ${styles.authorName}`}>{recipe.nickname || "사용자"}</p>

              <p className={`text-s ${styles.date}`}>{formatDate(recipe.created_at)}</p>
            </div>
          </div>

          {/* 실제 후기 평균 별점 */}
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

      {/* =========================
          레시피 요약 정보
      ========================= */}

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

      {/* =========================
          액션 버튼
      ========================= */}

      <section className={styles.actions}>
        <button
          type="button"
          className="text-sm"
          onClick={handleLikeToggle}
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
          onClick={handleBookmarkToggle}
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
          onClick={handleShare}
        >
          <ShareOutlined />
          {shareCopied ? "복사됨" : "공유"}
        </button>
      </section>

      {/* =========================
          AI 핵심 조리 과정
      ========================= */}

      {recipe.steps?.length > 0 && (
        <section className={styles.aiSummary}>
          <div className={styles.aiSummaryHeader}>
            <h2 className="text-lg">✨ AI가 정리한 핵심 조리 과정</h2>

            {aiSummaryLoading && <span className="text-s">AI 요약 중...</span>}
          </div>

          {aiSummaryLoading && aiStepSummaries.length === 0 ? (
            <p className={`text-sm ${styles.aiSummaryLoading}`}>
              조리 과정을 간단하게 정리하고 있습니다.
            </p>
          ) : (
            <ol>
              {(aiStepSummaries.length > 0
                ? aiStepSummaries
                : recipe.steps.map(step => ({
                    step: step.step,
                    summary: step.description?.trim() || step.title || "",
                  }))
              ).map(step => (
                <li key={`summary-${step.step}`} className="text-sm">
                  <span className="text-s">{step.step}</span>

                  <p>{step.summary}</p>
                </li>
              ))}
            </ol>
          )}

          {aiSummaryError && (
            <p className={`text-s ${styles.aiSummaryNotice}`}>
              AI 요약을 불러오지 못해 기존 조리 설명을 표시하고 있습니다.
            </p>
          )}
        </section>
      )}

      {/* =========================
          조리 과정
      ========================= */}

      {recipe.steps?.length > 0 && (
        <section className={styles.processSection}>
          <h2 className={`font-display dtext-2xl ${styles.sectionTitle}`}>조리 과정</h2>

          <div className={styles.steps}>
            {recipe.steps.map((step, index) => (
              <article
                key={step.step}
                className={`
                    ${styles.step}
                    ${index % 2 === 1 ? styles.stepReverse : ""}
                    ${!step.image ? styles.stepWithoutImage : ""}
                  `}
              >
                {step.image && (
                  <div className={styles.stepImageArea}>
                    <img
                      className={styles.stepImage}
                      src={step.image}
                      alt={`${step.step}단계 ${step.title}`}
                      loading="lazy"
                    />
                  </div>
                )}

                <div className={styles.stepContent}>
                  <div className={styles.stepHeader}>
                    <div className={styles.stepTitle}>
                      <span className="text-sm">{step.step}</span>

                      <h3 className="text-lg">{step.title}</h3>
                    </div>

                    {step.time && <span className={`text-s ${styles.stepTime}`}>{step.time}</span>}
                  </div>

                  <p className={`text-sm ${styles.stepDescription}`}>{step.description}</p>

                  {step.tip && (
                    <div className={styles.stepTip}>
                      <LightbulbOutlined fontSize="small" />

                      <span className="text-sm">{step.tip}</span>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* =========================
          완성 후기
      ========================= */}

      <section className={styles.reviewSection}>
        <h2 className={`font-display dtext-2xl ${styles.sectionTitle}`}>완성 후기</h2>

        {/* 후기 목록 */}
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

        {/* =========================
            후기 작성 폼
        ========================= */}

        <form className={styles.commentForm} onSubmit={handleCommentSubmit}>
          <div className={styles.reviewFormContent}>
            {/* 별점 */}
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

            {/* 이미지 미리보기 */}
            {reviewImagePreview && (
              <div className={styles.reviewImagePreview}>
                <img src={reviewImagePreview} alt="후기 이미지 미리보기" />

                <button
                  type="button"
                  className={styles.removeReviewImage}
                  onClick={handleRemoveReviewImage}
                >
                  삭제
                </button>
              </div>
            )}

            {/* 내용 */}
            <input
              className="text-sm"
              type="text"
              value={commentText}
              onChange={event => setCommentText(event.target.value)}
              placeholder="완성 후기를 남겨보세요 (선택)"
              maxLength={300}
              disabled={commentSubmitting}
            />

            {/* 이미지 첨부 */}
            <div className={styles.reviewFormActions}>
              <label className={styles.imageUploadButton}>
                <AddPhotoAlternateOutlined />

                <span className="text-sm">사진 추가</span>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleReviewImageChange}
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

      {/* =========================
          연관 레시피
      ========================= */}

      {relatedRecipes.length > 0 && (
        <section className={styles.relatedSection}>
          <h2 className={`font-display dtext-2xl ${styles.relatedTitle}`}>
            이 레시피와 함께 보면 좋아요
          </h2>

          <div className={styles.relatedList}>
            {relatedRecipes.map(relatedRecipe => (
              <article
                key={relatedRecipe.id}
                className={styles.relatedCard}
                onClick={() => navigate(`/recipes/${relatedRecipe.id}`)}
              >
                <div className={styles.relatedImageArea}>
                  <img src={relatedRecipe.thumbnail_url} alt={relatedRecipe.title} />

                  <span className={`text-s ${styles.relatedTag}`}>{relatedRecipe.cuisine}</span>

                  <button
                    type="button"
                    className={`${styles.cardFavorite} ${
                      relatedLikedIds.has(relatedRecipe.id) ? styles.cardFavoriteActive : ""
                    }`}
                    aria-label={
                      relatedLikedIds.has(relatedRecipe.id) ? "레시피 좋아요 취소" : "레시피 좋아요"
                    }
                    aria-pressed={relatedLikedIds.has(relatedRecipe.id)}
                    disabled={relatedLikeLoadingIds.has(relatedRecipe.id)}
                    onClick={event => handleRelatedLikeToggle(event, relatedRecipe)}
                  >
                    {relatedLikedIds.has(relatedRecipe.id) ? (
                      <Favorite fontSize="small" />
                    ) : (
                      <FavoriteBorderOutlined fontSize="small" />
                    )}
                  </button>
                </div>

                <div className={styles.relatedContent}>
                  <h3 className="text-lg">{relatedRecipe.title}</h3>

                  <div className={`text-s ${styles.relatedMeta}`}>
                    <span>
                      <AccessTimeOutlined fontSize="inherit" />

                      {relatedRecipe.cooking_time}
                    </span>

                    <span>
                      <LocalDiningOutlined fontSize="inherit" />

                      {relatedRecipe.difficulty}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </Layout>
  );
}
