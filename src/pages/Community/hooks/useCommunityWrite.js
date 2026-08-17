/**
 * 커뮤니티 게시글 작성/수정 관리 Custom Hook
 * - 게시글 입력값과 작성·수정 상태 관리
 * - 첨부 이미지 검증
 * - 업로드 전 브라우저에서 이미지 리사이즈 및 WebP 압축
 * - Supabase Storage 업로드
 * - 게시글과 연결할 레시피 검색 및 선택
 * - Supabase community_posts 테이블의 등록·수정 처리
 * - 새 게시글 작성 시 profiles.nickname을 우선 사용
 */
import { useEffect, useRef, useState } from "react";

import { supabase } from "../../../lib/supabaseClient";
import { getProfileNickname } from "../../../utils/userProfile";

import { COMMUNITY_BUCKET, initialWriteForm, mapPost } from "../communityUtils";

/**
 * 커뮤니티 이미지 최적화 설정
 *
 * - 카드/상세 모달에서 사용하는 이미지이므로
 *   지나치게 큰 원본 해상도를 그대로 저장하지 않는다.
 * - 긴 변 기준 최대 1200px
 * - WebP 품질 80%
 */
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 1200;
const IMAGE_QUALITY = 0.8;

/**
 * File 객체를 ImageBitmap으로 디코딩한 뒤
 * 비율을 유지하면서 최대 1200px 이하로 축소한다.
 *
 * 최종 이미지는 WebP Blob으로 변환한다.
 */
async function optimizeImage(file) {
  const imageBitmap = await createImageBitmap(file);

  try {
    const originalWidth = imageBitmap.width;
    const originalHeight = imageBitmap.height;

    const longestSide = Math.max(originalWidth, originalHeight);

    /**
     * 원본이 이미 1200px 이하인 경우에도
     * WebP 압축은 적용한다.
     */
    const scale = longestSide > MAX_IMAGE_DIMENSION ? MAX_IMAGE_DIMENSION / longestSide : 1;

    const targetWidth = Math.max(1, Math.round(originalWidth * scale));

    const targetHeight = Math.max(1, Math.round(originalHeight * scale));

    const canvas = document.createElement("canvas");

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("이미지 최적화를 위한 Canvas를 생성하지 못했습니다.");
    }

    /**
     * 이미지 축소 시 품질 개선
     */
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    context.drawImage(imageBitmap, 0, 0, targetWidth, targetHeight);

    const optimizedBlob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        blob => {
          if (!blob) {
            reject(new Error("이미지 압축에 실패했습니다."));

            return;
          }

          resolve(blob);
        },
        "image/webp",
        IMAGE_QUALITY,
      );
    });

    /**
     * Storage 업로드와 기존 selectedImageFile 로직을
     * 그대로 사용할 수 있도록 File 객체로 다시 변환한다.
     */
    const optimizedFile = new File([optimizedBlob], `${crypto.randomUUID()}.webp`, {
      type: "image/webp",
      lastModified: Date.now(),
    });

    return optimizedFile;
  } finally {
    imageBitmap.close();
  }
}

export default function useCommunityWrite({
  user,
  profile,
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
        .order("created_at", {
          ascending: false,
        })
        .limit(50);

      const trimmedSearch = searchTerm.trim();

      if (trimmedSearch) {
        query = query.ilike("title", `%${trimmedSearch}%`);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

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
    setWriteForm(previousForm => ({
      ...previousForm,

      recipeId: "",

      recipeName: "",
    }));

    setWriteError("");
  }

  useEffect(() => {
    if (!recipePickerOpen) {
      return undefined;
    }

    const timer = window.setTimeout(() => void loadRecipes(recipeSearch), 250);

    return () => window.clearTimeout(timer);
  }, [recipePickerOpen, recipeSearch]);

  function handlePostEditOpen() {
    if (!user || !selectedPost || selectedPost.userId !== user.id) {
      return;
    }

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
    if (authLoading) {
      return;
    }

    if (!user) {
      return moveToLogin();
    }

    setEditingPostId(null);

    setOriginalPostImageUrl("");

    setWriteForm(initialWriteForm);

    setSelectedImageFile(null);

    setWriteError("");

    setWriteModalOpen(true);
  }

  function resetWriteForm() {
    setWriteForm(previousForm => {
      if (previousForm.image.startsWith("blob:")) {
        URL.revokeObjectURL(previousForm.image);
      }

      return initialWriteForm;
    });

    setSelectedImageFile(null);

    setEditingPostId(null);

    setOriginalPostImageUrl("");

    setWriteError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleWriteModalClose() {
    if (writeSubmitting) {
      return;
    }

    setWriteModalOpen(false);

    resetWriteForm();
  }

  function handleWriteFormChange(event) {
    const { name, value } = event.target;

    setWriteForm(previousForm => ({
      ...previousForm,

      [name]: value,
    }));

    if (writeError) {
      setWriteError("");
    }
  }

  /**
   * 이미지 선택
   *
   * 1. 이미지 파일인지 확인
   * 2. 원본 2MB 이하인지 확인
   * 3. 브라우저에서 최대 1200px로 리사이즈
   * 4. WebP 80% 품질로 압축
   * 5. 압축된 File을 preview 및 Storage 업로드 대상으로 사용
   */
  async function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setWriteError("이미지 파일만 등록할 수 있습니다.");

      event.target.value = "";

      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setWriteError("이미지는 2MB 이하만 등록할 수 있습니다.");

      event.target.value = "";

      return;
    }

    try {
      setWriteError("");

      const optimizedFile = await optimizeImage(file);

      if (optimizedFile.size > MAX_IMAGE_SIZE) {
        throw new Error("최적화된 이미지가 2MB를 초과합니다.");
      }

      const imageUrl = URL.createObjectURL(optimizedFile);

      setWriteForm(previousForm => {
        if (previousForm.image.startsWith("blob:")) {
          URL.revokeObjectURL(previousForm.image);
        }

        return {
          ...previousForm,
          image: imageUrl,
        };
      });

      /**
       * 여기부터는 원본 file이 아니라
       * 최적화된 WebP File을 사용한다.
       */
      setSelectedImageFile(optimizedFile);
    } catch (error) {
      console.error("커뮤니티 이미지 최적화 오류:", error);

      setSelectedImageFile(null);

      setWriteError(error.message || "이미지를 처리하지 못했습니다.");

      event.target.value = "";
    }
  }

  function handleRemoveImage() {
    setWriteForm(previousForm => {
      if (previousForm.image.startsWith("blob:")) {
        URL.revokeObjectURL(previousForm.image);
      }

      return {
        ...previousForm,

        image: "",
      };
    });

    setSelectedImageFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  /**
   * 최적화된 커뮤니티 이미지 업로드
   *
   * handleImageChange 단계에서 모든 신규 이미지는
   * WebP로 변환되므로 .webp 확장자로 저장한다.
   */
  async function uploadCommunityImage(file, currentUser) {
    if (!file) {
      return {
        imageUrl: null,
        uploadedPath: null,
      };
    }

    const imagePath = `${currentUser.id}/` + `${crypto.randomUUID()}.webp`;

    const { error: uploadError } = await supabase.storage
      .from(COMMUNITY_BUCKET)
      .upload(imagePath, file, {
        /**
         * 이미지 파일은 UUID 경로를 사용하므로
         * 같은 URL의 내용이 변경되지 않는다.
         *
         * 브라우저/CDN 캐시를 길게 유지한다.
         */
        cacheControl: "31536000",

        contentType: "image/webp",

        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from(COMMUNITY_BUCKET).getPublicUrl(imagePath);

    return {
      imageUrl: data.publicUrl,

      uploadedPath: imagePath,
    };
  }

  function getStoragePathFromPublicUrl(imageUrl) {
    if (!imageUrl) {
      return null;
    }

    const marker = `/storage/v1/object/public/` + `${COMMUNITY_BUCKET}/`;

    const markerIndex = imageUrl.indexOf(marker);

    if (markerIndex === -1) {
      return null;
    }

    return decodeURIComponent(imageUrl.slice(markerIndex + marker.length));
  }

  async function removeCommunityImageByUrl(imageUrl) {
    const imagePath = getStoragePathFromPublicUrl(imageUrl);

    if (!imagePath) {
      return;
    }

    const { error } = await supabase.storage.from(COMMUNITY_BUCKET).remove([imagePath]);

    if (error) {
      console.error("커뮤니티 이미지 삭제 오류:", error);
    }
  }

  async function handleWriteSubmit(event) {
    event.preventDefault();

    if (!user) {
      return moveToLogin();
    }

    const trimmedContent = writeForm.content.trim();

    const selectedRecipeId = writeForm.recipeId ? Number(writeForm.recipeId) : null;

    const selectedRecipeName = writeForm.recipeName.trim() || null;

    if (!writeForm.category) {
      return setWriteError("카테고리를 선택해주세요.");
    }

    if (!trimmedContent) {
      return setWriteError("게시글 내용을 입력해주세요.");
    }

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

      /**
       * 새 게시글 작성자의 닉네임
       *
       * 1순위: profiles.nickname
       * 2순위: Auth metadata nickname
       * 3순위: Auth metadata full_name
       * 4순위: 이메일 앞부분
       *
       * profiles가 현재 사용자 프로필의 기준 데이터이므로
       * profile.nickname을 최우선으로 사용한다.
       */
      const authFallbackNickname =
        user.user_metadata?.nickname ||
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "사용자";

      const nickname = getProfileNickname(profile, authFallbackNickname);

      const submittedCategory = writeForm.category;

      /**
       * 게시글 수정
       */
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

        if (error) {
          throw error;
        }

        const previousImageUrl = originalPostImageUrl;

        setPosts(previousPosts =>
          previousPosts
            .map(post => {
              if (post.id !== editingPostId) {
                return post;
              }

              return {
                ...post,
                ...mapPost(data),

                liked: post.liked,

                bookmarked: post.bookmarked,

                /**
                 * 기존 피드에 붙어 있던
                 * 현재 profiles 정보 유지
                 */
                profile: post.profile,
              };
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

      /**
       * 새 게시글 등록
       */
      const { error } = await supabase.from("community_posts").insert({
        user_id: user.id,

        nickname,

        category: submittedCategory,

        content: trimmedContent,

        recipe_id: selectedRecipeId,

        recipe_name: selectedRecipeId ? selectedRecipeName : null,

        image_url: nextImageUrl,
      });

      if (error) {
        throw error;
      }

      if (selectedCategory !== submittedCategory) {
        await handleCategoryChange(submittedCategory);
      } else {
        await fetchPosts({
          reset: true,

          category: submittedCategory,
        });
      }

      setWriteModalOpen(false);

      resetWriteForm();
    } catch (error) {
      console.error(editingPostId ? "게시글 수정 오류:" : "게시글 등록 오류:", error);

      /**
       * 이미지 업로드 성공 후
       * DB 저장이 실패했다면
       * orphan 이미지 삭제
       */
      if (uploadedImagePath) {
        const { error: rollbackError } = await supabase.storage
          .from(COMMUNITY_BUCKET)
          .remove([uploadedImagePath]);

        if (rollbackError) {
          console.error("커뮤니티 이미지 롤백 삭제 오류:", rollbackError);
        }
      }

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

    handlePostEditOpen,
    handleWriteModalOpen,
    handleWriteModalClose,
    handleWriteSubmit,
    handleWriteFormChange,

    handleRecipePickerOpen,
    handleRecipePickerClose,
    handleRecipeSelect,
    handleRecipeClear,

    handleImageChange,
    handleRemoveImage,

    removeCommunityImageByUrl,
  };
}
