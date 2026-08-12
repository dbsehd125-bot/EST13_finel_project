/**
 * 커뮤니티 게시글 작성/수정 관리 Custom Hook
 * - 게시글 입력값과 작성·수정 상태 관리
 * - 첨부 이미지 검증 및 Supabase Storage 업로드
 * - 게시글과 연결할 레시피 검색 및 선택
 * - Supabase community_posts 테이블의 등록·수정 처리
 */
import { useEffect, useRef, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { COMMUNITY_BUCKET, initialWriteForm, mapPost } from "../communityUtils";

export default function useCommunityWrite({
  user,
  authLoading,
  selectedPost,
  selectedCategory,
  setPosts,
  fetchPosts,
  handleCategoryChange,
  moveToLogin,
}) {
  const [writeModalOpen, setWriteModalOpen] = useState(false);
  const [writeForm, setWriteForm] = useState(initialWriteForm);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [writeError, setWriteError] = useState("");
  const [writeSubmitting, setWriteSubmitting] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [originalPostImageUrl, setOriginalPostImageUrl] = useState("");
  const [recipePickerOpen, setRecipePickerOpen] = useState(false);
  const [recipeSearch, setRecipeSearch] = useState("");
  const [recipeResults, setRecipeResults] = useState([]);
  const [recipesLoading, setRecipesLoading] = useState(false);
  const fileInputRef = useRef(null);

  async function loadRecipes(searchTerm = "") {
    try {
      setRecipesLoading(true);
      let query = supabase
        .from("recipes")
        .select("id, title, thumbnail_url, cuisine, cooking_time, difficulty, created_at")
        .order("created_at", { ascending: false })
        .limit(50);

      const trimmedSearch = searchTerm.trim();
      if (trimmedSearch) query = query.ilike("title", `%${trimmedSearch}%`);

      const { data, error } = await query;
      if (error) throw error;
      setRecipeResults(data ?? []);
    } catch (error) {
      console.error("레시피 조회 오류:", error);
      setRecipeResults([]);
      setWriteError("레시피 목록을 불러오지 못했습니다.");
    } finally {
      setRecipesLoading(false);
    }
  }

  function handleRecipePickerOpen() {
    setRecipeSearch("");
    setRecipePickerOpen(true);
  }

  function handleRecipePickerClose() {
    setRecipePickerOpen(false);
    setRecipeSearch("");
  }

  function handleRecipeSelect(recipe) {
    setWriteForm(previousForm => ({
      ...previousForm,
      recipeId: String(recipe.id),
      recipeName: recipe.title,
    }));
    setWriteError("");
    handleRecipePickerClose();
  }

  function handleRecipeClear() {
    setWriteForm(previousForm => ({ ...previousForm, recipeId: "", recipeName: "" }));
    setWriteError("");
  }

  useEffect(() => {
    if (!recipePickerOpen) return undefined;
    const timer = window.setTimeout(() => void loadRecipes(recipeSearch), 250);
    return () => window.clearTimeout(timer);
  }, [recipePickerOpen, recipeSearch]);

  function handlePostEditOpen() {
    if (!user || !selectedPost || selectedPost.userId !== user.id) return;

    setEditingPostId(selectedPost.id);
    setOriginalPostImageUrl(selectedPost.image || "");
    setWriteForm({
      category: selectedPost.category,
      content: selectedPost.content,
      recipeId: selectedPost.recipeId ? String(selectedPost.recipeId) : "",
      recipeName: selectedPost.recipeName || "",
      image: selectedPost.image || "",
    });
    setSelectedImageFile(null);
    setWriteError("");
    setWriteModalOpen(true);
  }

  function handleWriteModalOpen() {
    if (authLoading) return;
    if (!user) return moveToLogin();

    setEditingPostId(null);
    setOriginalPostImageUrl("");
    setWriteForm(initialWriteForm);
    setSelectedImageFile(null);
    setWriteError("");
    setWriteModalOpen(true);
  }

  function resetWriteForm() {
    setWriteForm(previousForm => {
      if (previousForm.image.startsWith("blob:")) URL.revokeObjectURL(previousForm.image);
      return initialWriteForm;
    });
    setSelectedImageFile(null);
    setEditingPostId(null);
    setOriginalPostImageUrl("");
    setWriteError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleWriteModalClose() {
    if (writeSubmitting) return;
    setWriteModalOpen(false);
    resetWriteForm();
  }

  function handleWriteFormChange(event) {
    const { name, value } = event.target;
    setWriteForm(previousForm => ({ ...previousForm, [name]: value }));
    if (writeError) setWriteError("");
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setWriteError("이미지 파일만 등록할 수 있습니다.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setWriteError("이미지는 2MB 이하만 등록할 수 있습니다.");
      event.target.value = "";
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setWriteForm(previousForm => {
      if (previousForm.image.startsWith("blob:")) URL.revokeObjectURL(previousForm.image);
      return { ...previousForm, image: imageUrl };
    });
    setSelectedImageFile(file);
    setWriteError("");
  }

  function handleRemoveImage() {
    setWriteForm(previousForm => {
      if (previousForm.image.startsWith("blob:")) URL.revokeObjectURL(previousForm.image);
      return { ...previousForm, image: "" };
    });
    setSelectedImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function uploadCommunityImage(file, currentUser) {
    if (!file) return { imageUrl: null, uploadedPath: null };

    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const imagePath = `${currentUser.id}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from(COMMUNITY_BUCKET)
      .upload(imagePath, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false,
      });
    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(COMMUNITY_BUCKET).getPublicUrl(imagePath);
    return { imageUrl: data.publicUrl, uploadedPath: imagePath };
  }

  function getStoragePathFromPublicUrl(imageUrl) {
    if (!imageUrl) return null;
    const marker = `/storage/v1/object/public/${COMMUNITY_BUCKET}/`;
    const markerIndex = imageUrl.indexOf(marker);
    if (markerIndex === -1) return null;
    return decodeURIComponent(imageUrl.slice(markerIndex + marker.length));
  }

  async function removeCommunityImageByUrl(imageUrl) {
    const imagePath = getStoragePathFromPublicUrl(imageUrl);
    if (!imagePath) return;
    const { error } = await supabase.storage.from(COMMUNITY_BUCKET).remove([imagePath]);
    if (error) console.error("커뮤니티 이미지 삭제 오류:", error);
  }

  async function handleWriteSubmit(event) {
    event.preventDefault();
    if (!user) return moveToLogin();

    const trimmedContent = writeForm.content.trim();
    const selectedRecipeId = writeForm.recipeId ? Number(writeForm.recipeId) : null;
    const selectedRecipeName = writeForm.recipeName.trim() || null;

    if (!writeForm.category) return setWriteError("카테고리를 선택해주세요.");
    if (!trimmedContent) return setWriteError("게시글 내용을 입력해주세요.");

    let uploadedImagePath = null;

    try {
      setWriteSubmitting(true);
      setWriteError("");
      let nextImageUrl = writeForm.image || null;

      if (selectedImageFile) {
        const { imageUrl, uploadedPath } = await uploadCommunityImage(selectedImageFile, user);
        nextImageUrl = imageUrl;
        uploadedImagePath = uploadedPath;
      }

      const nickname =
        user.user_metadata?.nickname ||
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "사용자";
      const submittedCategory = writeForm.category;

      if (editingPostId) {
        const { data, error } = await supabase
          .from("community_posts")
          .update({
            category: submittedCategory,
            content: trimmedContent,
            recipe_id: selectedRecipeId,
            recipe_name: selectedRecipeId ? selectedRecipeName : null,
            image_url: nextImageUrl,
          })
          .eq("id", editingPostId)
          .eq("user_id", user.id)
          .select()
          .single();
        if (error) throw error;

        const previousImageUrl = originalPostImageUrl;
        setPosts(previousPosts =>
          previousPosts
            .map(post => {
              if (post.id !== editingPostId) return post;
              return { ...post, ...mapPost(data), liked: post.liked, bookmarked: post.bookmarked };
            })
            .filter(post =>
              selectedCategory === "최신" || selectedCategory === "인기"
                ? true
                : post.category === selectedCategory,
            ),
        );

        if (previousImageUrl && previousImageUrl !== nextImageUrl) {
          await removeCommunityImageByUrl(previousImageUrl);
        }

        setWriteModalOpen(false);
        resetWriteForm();
        return;
      }

      const { error } = await supabase.from("community_posts").insert({
        user_id: user.id,
        nickname,
        category: submittedCategory,
        content: trimmedContent,
        recipe_id: selectedRecipeId,
        recipe_name: selectedRecipeId ? selectedRecipeName : null,
        image_url: nextImageUrl,
      });
      if (error) throw error;

      if (selectedCategory !== submittedCategory) await handleCategoryChange(submittedCategory);
      else await fetchPosts({ reset: true, category: submittedCategory });

      setWriteModalOpen(false);
      resetWriteForm();
    } catch (error) {
      console.error(editingPostId ? "게시글 수정 오류:" : "게시글 등록 오류:", error);
      if (uploadedImagePath)
        await supabase.storage.from(COMMUNITY_BUCKET).remove([uploadedImagePath]);
      setWriteError(
        error.message ||
          (editingPostId ? "게시글 수정에 실패했습니다." : "게시글 등록에 실패했습니다."),
      );
    } finally {
      setWriteSubmitting(false);
    }
  }

  return {
    writeModalOpen,
    writeForm,
    writeError,
    writeSubmitting,
    editingPostId,
    recipePickerOpen,
    recipeSearch,
    setRecipeSearch,
    recipeResults,
    recipesLoading,
    fileInputRef,
    handleRecipePickerOpen,
    handleRecipePickerClose,
    handleRecipeSelect,
    handleRecipeClear,
    handlePostEditOpen,
    handleWriteModalOpen,
    handleWriteModalClose,
    handleWriteFormChange,
    handleImageChange,
    handleRemoveImage,
    handleWriteSubmit,
    removeCommunityImageByUrl,
  };
}
