/**
 * 레시피 완성 후기 관리 Custom Hook
 * - 현재 레시피의 후기 목록 조회 및 평균 별점 계산
 * - 후기 별점, 내용, 첨부 이미지 입력 상태 관리
 * - 이미지 유효성 검사와 Supabase Storage 업로드
 * - 새로운 완성 후기 등록 및 입력값 초기화
 */
import { useEffect, useMemo, useState } from "react";

import { supabase } from "../../../lib/supabaseClient";

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

  useEffect(() => {
    return () => {
      if (reviewImagePreview) URL.revokeObjectURL(reviewImagePreview);
    };
  }, [reviewImagePreview]);

  const averageRating = useMemo(() => {
    if (comments.length === 0) return 0;

    const validRatings = comments
      .map(comment => Number(comment.rating))
      .filter(rating => rating >= 1 && rating <= 5);

    if (validRatings.length === 0) return 0;

    return validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length;
  }, [comments]);

  const moveToLogin = () => {
    navigate("/login", {
      state: { from: `/recipes/${recipe.id}` },
    });
  };

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

    if (reviewImagePreview) URL.revokeObjectURL(reviewImagePreview);

    setReviewImageFile(file);
    setReviewImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveReviewImage = () => {
    if (reviewImagePreview) URL.revokeObjectURL(reviewImagePreview);
    setReviewImageFile(null);
    setReviewImagePreview("");
  };

  const uploadReviewImage = async file => {
    if (!file || !user) return null;

    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const imagePath = `reviews/${user.id}/${crypto.randomUUID()}.${fileExtension}`;

    const { error: uploadError } = await supabase.storage
      .from("recipe-images")
      .upload(imagePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage.from("recipe-images").getPublicUrl(imagePath);
    return publicUrlData.publicUrl;
  };

  const handleCommentSubmit = async event => {
    event.preventDefault();

    if (authLoading || commentSubmitting || !recipe) return;
    if (!user) return moveToLogin();

    if (reviewRating < 1) {
      showNotification("별점을 선택해주세요.", "warning");
      return;
    }

    const trimmedComment = commentText.trim();
    let uploadedImageUrl = null;

    try {
      setCommentSubmitting(true);

      if (reviewImageFile) {
        uploadedImageUrl = await uploadReviewImage(reviewImageFile);
      }

      const nickname =
        user.user_metadata?.nickname ||
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "사용자";

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

      if (error) throw error;

      setComments(previousComments => [...previousComments, data]);
      setCommentText("");
      setReviewRating(0);
      setHoverRating(0);

      if (reviewImagePreview) URL.revokeObjectURL(reviewImagePreview);
      setReviewImageFile(null);
      setReviewImagePreview("");

      showNotification("완성 후기를 등록했습니다.", "success");
    } catch (error) {
      console.error("완성 후기 등록 오류:", error);
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
