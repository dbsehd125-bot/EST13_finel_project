/**
 * 레시피 완성 후기 관리 Custom Hook
 * - 현재 레시피의 후기 목록 조회 및 평균 별점 계산
 * - 후기 별점, 내용, 첨부 이미지 입력 상태 관리
 * - 이미지 유효성 검사와 Supabase Storage 업로드
 * - 후기 DB 등록 실패 시 먼저 업로드한 이미지 자동 삭제
 * - 새로운 완성 후기 등록 및 입력값 초기화
 */
import { useEffect, useMemo, useState } from "react";

import { supabase } from "../../../lib/supabaseClient";

const REVIEW_IMAGE_BUCKET = "recipe-images";

export default function useRecipeReviews({
  recipe,
  user,
  authLoading,
  navigate,
  showNotification,
}) {
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewImageFile, setReviewImageFile] = useState(null);
  const [reviewImagePreview, setReviewImagePreview] = useState("");

  /**
   * 레시피별 완성 후기 조회
   */
  useEffect(() => {
    if (!recipe?.id) return;

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
          .order("created_at", { ascending: true });

        if (error) throw error;

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
   * 이미지 미리보기 Object URL 정리
   */
  useEffect(() => {
    return () => {
      if (reviewImagePreview) {
        URL.revokeObjectURL(reviewImagePreview);
      }
    };
  }, [reviewImagePreview]);

  /**
   * 평균 별점
   */
  const averageRating = useMemo(() => {
    if (comments.length === 0) return 0;

    const validRatings = comments
      .map(comment => Number(comment.rating))
      .filter(rating => rating >= 1 && rating <= 5);

    if (validRatings.length === 0) return 0;

    return validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length;
  }, [comments]);

  const moveToLogin = () => {
    if (!recipe?.id) return;

    navigate("/login", {
      state: { from: `/recipes/${recipe.id}` },
    });
  };

  /**
   * 후기 이미지 선택
   */
  const handleReviewImageChange = event => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showNotification("이미지 파일만 첨부할 수 있습니다.", "warning");

      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showNotification("이미지는 2MB 이하만 첨부할 수 있습니다.", "warning");

      event.target.value = "";
      return;
    }

    if (reviewImagePreview) {
      URL.revokeObjectURL(reviewImagePreview);
    }

    setReviewImageFile(file);
    setReviewImagePreview(URL.createObjectURL(file));
  };

  /**
   * 선택한 이미지 제거
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
   *
   * 기존에는 public URL만 반환했지만,
   * DB insert가 실패했을 때 파일을 다시 삭제할 수 있도록
   * Storage path도 함께 반환한다.
   */
  const uploadReviewImage = async file => {
    if (!file || !user) return null;

    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "jpg";

    const imagePath = `reviews/${user.id}/${crypto.randomUUID()}.${fileExtension}`;

    const { error: uploadError } = await supabase.storage
      .from(REVIEW_IMAGE_BUCKET)
      .upload(imagePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from(REVIEW_IMAGE_BUCKET)
      .getPublicUrl(imagePath);

    return {
      url: publicUrlData.publicUrl,
      path: imagePath,
    };
  };

  /**
   * 완성 후기 등록
   */
  const handleCommentSubmit = async event => {
    event.preventDefault();

    if (authLoading || commentSubmitting || !recipe?.id) return;

    if (!user) {
      return moveToLogin();
    }

    if (reviewRating < 1) {
      showNotification("별점을 선택해주세요.", "warning");
      return;
    }

    const trimmedComment = commentText.trim();

    let uploadedImageUrl = null;
    let uploadedImagePath = null;

    try {
      setCommentSubmitting(true);

      /**
       * 이미지가 있다면 먼저 Storage에 업로드
       */
      if (reviewImageFile) {
        const uploadResult = await uploadReviewImage(reviewImageFile);

        uploadedImageUrl = uploadResult?.url || null;
        uploadedImagePath = uploadResult?.path || null;
      }

      const nickname =
        user.user_metadata?.nickname ||
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "사용자";

      /**
       * 후기 DB 등록
       */
      const { data, error } = await supabase
        .from("recipe_comments")
        .insert({
          recipe_id: recipe.id,
          user_id: user.id,
          nickname,
          rating: reviewRating,
          content: trimmedComment || null,
          image_url: uploadedImageUrl,
        })
        .select()
        .single();

      if (error) throw error;

      setComments(previousComments => [...previousComments, data]);

      setCommentText("");
      setReviewRating(0);
      setHoverRating(0);

      if (reviewImagePreview) {
        URL.revokeObjectURL(reviewImagePreview);
      }

      setReviewImageFile(null);
      setReviewImagePreview("");

      showNotification("완성 후기를 등록했습니다.", "success");
    } catch (error) {
      console.error("완성 후기 등록 오류:", error);

      /**
       * Storage 업로드까지는 성공했는데
       * recipe_comments insert가 실패한 경우
       *
       * 사용되지 않는 이미지가 Storage에 남지 않도록 롤백한다.
       */
      if (uploadedImagePath) {
        const { error: removeError } = await supabase.storage
          .from(REVIEW_IMAGE_BUCKET)
          .remove([uploadedImagePath]);

        if (removeError) {
          console.error("후기 이미지 롤백 삭제 실패:", removeError);
        }
      }

      showNotification(error.message || "완성 후기 등록에 실패했습니다.", "error");
    } finally {
      setCommentSubmitting(false);
    }
  };

  return {
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
    averageRating,
    handleReviewImageChange,
    handleRemoveReviewImage,
    handleCommentSubmit,
  };
}
