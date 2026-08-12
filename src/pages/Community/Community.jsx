import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import {
  AddPhotoAlternateOutlined,
  Bookmark,
  BookmarkBorderOutlined,
  Close,
  DeleteOutlined,
  EditOutlined,
  Favorite,
  FavoriteBorder,
  ModeCommentOutlined,
  SendOutlined,
} from "@mui/icons-material";
import {
  Button,
  Dialog,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Skeleton,
  TextField,
} from "@mui/material";
import Masonry from "@mui/lab/Masonry";

import { supabase } from "../../lib/supabaseClient";
import Layout from "../../components/Layout";
import Notification from "../../components/Notification";
import ConfirmModal from "../../components/ConfirmModal";
import { useAuth } from "../../context/AuthContext";
import styles from "./Community.module.css";

const categories = ["최신", "인기", "요리 후기", "질문", "자유 이야기"];
const writableCategories = ["요리 후기", "질문", "자유 이야기"];
const COMMUNITY_BUCKET = "community-images";
const POSTS_PER_PAGE = 9;

const initialWriteForm = {
  category: "자유 이야기",
  content: "",
  recipeId: "",
  recipeName: "",
  image: "",
};

function formatRelativeTime(dateString) {
  const createdAt = new Date(dateString);
  const diff = Date.now() - createdAt.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return "방금 전";
  if (diff < hour) return `${Math.floor(diff / minute)}분 전`;
  if (diff < day) return `${Math.floor(diff / hour)}시간 전`;
  if (diff < day * 2) return "어제";

  return createdAt.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function mapPost(row) {
  return {
    id: row.id,
    userId: row.user_id,
    nickname: row.nickname || "사용자",
    time: formatRelativeTime(row.created_at),
    createdAt: row.created_at,
    content: row.content,
    image: row.image_url || "",
    imageAlt: row.recipe_name || "커뮤니티 게시글 첨부 이미지",
    likes: row.like_count ?? 0,
    comments: row.comment_count ?? 0,
    category: row.category,
    recipeId: row.recipe_id ?? null,
    recipeName: row.recipe_name || "",
    liked: false,
    bookmarked: false,
  };
}

function mapComment(row) {
  return {
    id: row.id,
    userId: row.user_id,
    writer: row.nickname || "사용자",
    time: formatRelativeTime(row.created_at),
    content: row.content,
    likes: row.like_count ?? 0,
  };
}

function CommunityCardSkeleton({ index }) {
  const imageHeights = [220, 300, 250, 340, 280, 230, 320, 260, 360];

  return (
    <article className={`${styles.card} ${styles.skeletonCard}`}>
      <div className={styles.profile}>
        <Skeleton variant="circular" width={40} height={40} />

        <div className={styles.skeletonProfileText}>
          <Skeleton variant="text" width={92} height={22} />
          <Skeleton variant="text" width={58} height={18} />
        </div>
      </div>

      <div className={styles.comment}>
        <Skeleton variant="text" width="96%" height={24} />
        <Skeleton variant="text" width="88%" height={24} />
        <Skeleton variant="text" width="64%" height={24} />
      </div>

      <Skeleton
        variant="rectangular"
        width="100%"
        height={imageHeights[index % imageHeights.length]}
      />

      <div className={styles.icons}>
        <Skeleton variant="rounded" width={92} height={34} />
        <Skeleton variant="circular" width={34} height={34} />
      </div>
    </article>
  );
}

export default function Community() {
  const navigate = useNavigate();

  const { user, authLoading } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState("최신");
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [pageError, setPageError] = useState("");
  const [selectedPostId, setSelectedPostId] = useState(null);

  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);

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

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [commentActionId, setCommentActionId] = useState(null);

  // 좋아요/북마크 중복 클릭 방지
  const [likeActionIds, setLikeActionIds] = useState([]);
  const [bookmarkActionIds, setBookmarkActionIds] = useState([]);

  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [confirmModal, setConfirmModal] = useState({
    open: false,
    type: "",
  });
  const [deleteCommentId, setDeleteCommentId] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const fileInputRef = useRef(null);
  const loadMoreRef = useRef(null);
  const loadingMoreRef = useRef(false);

  const selectedPost = posts.find(post => post.id === selectedPostId) ?? null;
  const detailModalOpen = Boolean(selectedPost);

  function showNotification(message, severity = "success") {
    setNotification({ open: true, message, severity });
  }

  function closeNotification() {
    setNotification(previous => ({ ...previous, open: false }));
  }

  function closeConfirmModal() {
    if (confirmLoading) return;
    setConfirmModal({ open: false, type: "" });
    setDeleteCommentId(null);
  }

  // 좋아요/북마크 권한 문제 확인용 인증 상태 로그
  // access_token 같은 민감한 값은 출력하지 않는다.
  async function debugSupabaseAuth(actionName) {
    const { data, error } = await supabase.auth.getSession();
    const session = data?.session ?? null;

    console.group(`[Community] ${actionName} 인증 상태`);
    console.log("AuthContext user 존재:", Boolean(user));
    console.log("AuthContext user id:", user?.id ?? null);
    console.log("Supabase session 존재:", Boolean(session));
    console.log("Supabase session user id:", session?.user?.id ?? null);
    console.log("Supabase session email:", session?.user?.email ?? null);
    console.log(
      "AuthContext와 session user 일치:",
      Boolean(user?.id && session?.user?.id && user.id === session.user.id),
    );
    console.log("getSession error:", error ?? null);
    console.groupEnd();

    return session;
  }

  async function loadRecipes(searchTerm = "") {
    try {
      setRecipesLoading(true);

      let query = supabase
        .from("recipes")
        .select("id, title, thumbnail_url, cuisine, cooking_time, difficulty, created_at")
        .order("created_at", { ascending: false })
        .limit(50);

      const trimmedSearch = searchTerm.trim();

      if (trimmedSearch) {
        query = query.ilike("title", `%${trimmedSearch}%`);
      }

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
    setWriteForm(previousForm => ({
      ...previousForm,
      recipeId: "",
      recipeName: "",
    }));
    setWriteError("");
  }

  useEffect(() => {
    if (!recipePickerOpen) return undefined;

    const timer = window.setTimeout(() => {
      void loadRecipes(recipeSearch);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [recipePickerOpen, recipeSearch]);

  // 게시글 조회와 분리된 좋아요/북마크 상태 조회
  // 이 요청이 실패해도 게시글 자체는 정상적으로 표시된다.
  async function loadMyPostReactions(postIds) {
    if (!user || !postIds?.length) return;

    // 최초 상태 조회가 anon 요청으로 나가는지 확인할 때 사용
    await debugSupabaseAuth("좋아요/북마크 상태 조회");

    const [likeResult, bookmarkResult] = await Promise.allSettled([
      supabase
        .from("community_post_likes")
        .select("post_id")
        .eq("user_id", user.id)
        .in("post_id", postIds),
      supabase
        .from("community_post_bookmarks")
        .select("post_id")
        .eq("user_id", user.id)
        .in("post_id", postIds),
    ]);

    let likedPostIds = null;
    let bookmarkedPostIds = null;

    if (likeResult.status === "fulfilled") {
      const { data, error } = likeResult.value;

      if (error) {
        console.error("좋아요 상태 조회 오류:", error);
      } else {
        likedPostIds = new Set((data ?? []).map(row => row.post_id));
      }
    } else {
      console.error("좋아요 상태 조회 오류:", likeResult.reason);
    }

    if (bookmarkResult.status === "fulfilled") {
      const { data, error } = bookmarkResult.value;

      if (error) {
        console.error("북마크 상태 조회 오류:", error);
      } else {
        bookmarkedPostIds = new Set((data ?? []).map(row => row.post_id));
      }
    } else {
      console.error("북마크 상태 조회 오류:", bookmarkResult.reason);
    }

    if (!likedPostIds && !bookmarkedPostIds) return;

    const targetIds = new Set(postIds);

    setPosts(previousPosts =>
      previousPosts.map(post => {
        if (!targetIds.has(post.id)) return post;

        return {
          ...post,
          ...(likedPostIds ? { liked: likedPostIds.has(post.id) } : {}),
          ...(bookmarkedPostIds ? { bookmarked: bookmarkedPostIds.has(post.id) } : {}),
        };
      }),
    );
  }

  async function fetchPosts({
    reset = false,
    showLoading = false,
    category = selectedCategory,
  } = {}) {
    if (loadingMoreRef.current) {
      return false;
    }

    const from = reset ? 0 : posts.length;
    const to = from + POSTS_PER_PAGE - 1;

    if (showLoading) {
      setPostsLoading(true);
    } else if (!reset) {
      setLoadingMore(true);
    }

    loadingMoreRef.current = true;
    setPageError("");

    try {
      let query = supabase.from("community_posts").select("*");

      if (category === "요리 후기" || category === "질문" || category === "자유 이야기") {
        query = query.eq("category", category);
      }

      if (category === "인기") {
        query = query
          .order("like_count", { ascending: false })
          .order("created_at", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query.range(from, to);

      if (error) {
        throw error;
      }

      const mappedPosts = (data ?? []).map(mapPost);

      setPosts(previousPosts => {
        if (reset) {
          return mappedPosts;
        }

        const existingIds = new Set(previousPosts.map(post => post.id));
        const newPosts = mappedPosts.filter(post => !existingIds.has(post.id));

        return [...previousPosts, ...newPosts];
      });

      // 좋아요/북마크 조회는 게시글 조회와 완전히 분리한다.
      if (user && mappedPosts.length > 0) {
        void loadMyPostReactions(mappedPosts.map(post => post.id));
      }

      setHasMorePosts(mappedPosts.length === POSTS_PER_PAGE);

      return true;
    } catch (error) {
      console.error("커뮤니티 게시글 조회 오류:", error);
      setPageError("게시글을 불러오지 못했습니다.");
      return false;
    } finally {
      loadingMoreRef.current = false;

      if (showLoading) {
        setPostsLoading(false);
      }

      setLoadingMore(false);
    }
  }

  // 커뮤니티 페이지 최초 진입 시에만 전체 스켈레톤 UI 표시
  useEffect(() => {
    fetchPosts({
      reset: true,
      showLoading: true,
      category: "최신",
    });
  }, []);

  // 최초 게시글 조회보다 인증 확인이 늦게 끝나는 경우를 위한 보완 처리
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setPosts(previousPosts =>
        previousPosts.map(post => ({
          ...post,
          liked: false,
          bookmarked: false,
        })),
      );
      return;
    }

    if (posts.length > 0) {
      void loadMyPostReactions(posts.map(post => post.id));
    }
  }, [authLoading, user?.id]);

  useEffect(() => {
    const target = loadMoreRef.current;

    if (!target || postsLoading || categoryLoading || loadingMore || !hasMorePosts || pageError) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries;

        if (entry.isIntersecting && !loadingMoreRef.current) {
          fetchPosts({ category: selectedCategory });
        }
      },
      {
        root: null,
        rootMargin: "500px 0px",
        threshold: 0,
      },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [
    posts.length,
    postsLoading,
    categoryLoading,
    loadingMore,
    hasMorePosts,
    pageError,
    selectedCategory,
  ]);

  useEffect(() => {
    if (!selectedPostId) {
      setComments([]);
      setCommentText("");
      return;
    }

    let mounted = true;

    async function loadComments() {
      setCommentLoading(true);

      const { data, error } = await supabase
        .from("community_comments")
        .select("*")
        .eq("post_id", selectedPostId)
        .order("created_at", { ascending: true });

      if (!mounted) return;

      if (error) {
        console.error("댓글 조회 오류:", error);
        setComments([]);
      } else {
        setComments((data ?? []).map(mapComment));
      }

      setCommentLoading(false);
    }

    loadComments();

    return () => {
      mounted = false;
    };
  }, [selectedPostId]);

  function moveToLogin() {
    handleDetailModalClose();
    setWriteModalOpen(false);
    navigate("/login", { state: { from: "/community" } });
  }

  function handleDetailModalOpen(postId) {
    setSelectedPostId(postId);
  }

  function handleDetailModalClose() {
    setSelectedPostId(null);
    setCommentText("");
    setEditingCommentId(null);
    setEditingCommentText("");
  }

  async function handleLikeToggle(postId) {
    if (authLoading) return;

    if (!user) {
      moveToLogin();
      return;
    }

    const session = await debugSupabaseAuth("좋아요 클릭");

    if (!session) {
      console.error("좋아요 요청 중단: Supabase 세션이 없습니다.");
      showNotification("로그인 세션을 확인하지 못했습니다. 다시 로그인해주세요.", "error");
      return;
    }

    if (likeActionIds.includes(postId)) return;

    const targetPost = posts.find(post => post.id === postId);
    if (!targetPost) return;

    try {
      setLikeActionIds(previousIds => [...previousIds, postId]);

      if (targetPost.liked) {
        const { error } = await supabase
          .from("community_post_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("community_post_likes").insert({
          post_id: postId,
          user_id: user.id,
        });

        if (error) throw error;
      }

      const nextLikeCount = targetPost.liked
        ? Math.max(0, targetPost.likes - 1)
        : targetPost.likes + 1;

      // 기존 community_posts.like_count를 유지해서 인기순 정렬에도 반영한다.
      const { error: countUpdateError } = await supabase
        .from("community_posts")
        .update({ like_count: nextLikeCount })
        .eq("id", postId);

      if (countUpdateError) throw countUpdateError;

      setPosts(previousPosts =>
        previousPosts.map(post =>
          post.id === postId
            ? {
                ...post,
                liked: !targetPost.liked,
                likes: nextLikeCount,
              }
            : post,
        ),
      );
    } catch (error) {
      console.error("게시글 좋아요 처리 오류:", error);
      showNotification(error.message || "좋아요 처리에 실패했습니다.", "error");
    } finally {
      setLikeActionIds(previousIds => previousIds.filter(id => id !== postId));
    }
  }

  async function handleBookmarkToggle(postId) {
    if (authLoading) return;

    if (!user) {
      moveToLogin();
      return;
    }

    const session = await debugSupabaseAuth("북마크 클릭");

    if (!session) {
      console.error("북마크 요청 중단: Supabase 세션이 없습니다.");
      showNotification("로그인 세션을 확인하지 못했습니다. 다시 로그인해주세요.", "error");
      return;
    }

    if (bookmarkActionIds.includes(postId)) return;

    const targetPost = posts.find(post => post.id === postId);
    if (!targetPost) return;

    try {
      setBookmarkActionIds(previousIds => [...previousIds, postId]);

      if (targetPost.bookmarked) {
        const { error } = await supabase
          .from("community_post_bookmarks")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("community_post_bookmarks").insert({
          post_id: postId,
          user_id: user.id,
        });

        if (error) throw error;
      }

      setPosts(previousPosts =>
        previousPosts.map(post =>
          post.id === postId ? { ...post, bookmarked: !targetPost.bookmarked } : post,
        ),
      );
    } catch (error) {
      console.error("게시글 북마크 처리 오류:", error);
      showNotification(error.message || "북마크 처리에 실패했습니다.", "error");
    } finally {
      setBookmarkActionIds(previousIds => previousIds.filter(id => id !== postId));
    }
  }

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

    if (!user) {
      moveToLogin();
      return;
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

    const maxFileSize = 2 * 1024 * 1024;

    if (file.size > maxFileSize) {
      setWriteError("이미지는 2MB 이하만 등록할 수 있습니다.");
      event.target.value = "";
      return;
    }

    const imageUrl = URL.createObjectURL(file);

    setWriteForm(previousForm => {
      if (previousForm.image.startsWith("blob:")) {
        URL.revokeObjectURL(previousForm.image);
      }

      return { ...previousForm, image: imageUrl };
    });

    setSelectedImageFile(file);
    setWriteError("");
  }

  function handleRemoveImage() {
    setWriteForm(previousForm => {
      if (previousForm.image.startsWith("blob:")) {
        URL.revokeObjectURL(previousForm.image);
      }

      return { ...previousForm, image: "" };
    });

    setSelectedImageFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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

    return {
      imageUrl: data.publicUrl,
      uploadedPath: imagePath,
    };
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

    if (error) {
      console.error("커뮤니티 이미지 삭제 오류:", error);
    }
  }

  function handlePostDeleteRequest() {
    if (!user || !selectedPost || selectedPost.userId !== user.id) return;

    setConfirmModal({
      open: true,
      type: "post",
    });
  }

  async function handlePostDeleteConfirm() {
    if (!user || !selectedPost || selectedPost.userId !== user.id) return;

    const postId = selectedPost.id;
    const imageUrl = selectedPost.image;

    try {
      setConfirmLoading(true);

      const { error } = await supabase
        .from("community_posts")
        .delete()
        .eq("id", postId)
        .eq("user_id", user.id);

      if (error) throw error;

      if (imageUrl) {
        await removeCommunityImageByUrl(imageUrl);
      }

      setPosts(previousPosts => previousPosts.filter(post => post.id !== postId));
      setConfirmModal({ open: false, type: "" });
      handleDetailModalClose();
      showNotification("게시글을 삭제했습니다.", "success");
    } catch (error) {
      console.error("게시글 삭제 오류:", error);
      showNotification(error.message || "게시글 삭제에 실패했습니다.", "error");
    } finally {
      setConfirmLoading(false);
    }
  }

  function handleCommentEditStart(comment) {
    if (!user || comment.userId !== user.id) return;

    setEditingCommentId(comment.id);
    setEditingCommentText(comment.content);
  }

  function handleCommentEditCancel() {
    setEditingCommentId(null);
    setEditingCommentText("");
  }

  async function handleCommentEditSave(commentId) {
    if (!user) return;

    const trimmedContent = editingCommentText.trim();
    if (!trimmedContent) {
      showNotification("댓글 내용을 입력해주세요.", "warning");
      return;
    }

    try {
      setCommentActionId(commentId);

      const { data, error } = await supabase
        .from("community_comments")
        .update({ content: trimmedContent })
        .eq("id", commentId)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;

      setComments(previousComments =>
        previousComments.map(comment =>
          comment.id === commentId ? { ...comment, content: data.content } : comment,
        ),
      );

      handleCommentEditCancel();
      showNotification("댓글을 수정했습니다.", "success");
    } catch (error) {
      console.error("댓글 수정 오류:", error);
      showNotification(error.message || "댓글 수정에 실패했습니다.", "error");
    } finally {
      setCommentActionId(null);
    }
  }

  function handleCommentDeleteRequest(commentId) {
    if (!user || !selectedPost) return;

    const targetComment = comments.find(comment => comment.id === commentId);
    if (!targetComment || targetComment.userId !== user.id) return;

    setDeleteCommentId(commentId);
    setConfirmModal({
      open: true,
      type: "comment",
    });
  }

  async function handleCommentDeleteConfirm() {
    if (!user || !selectedPost || !deleteCommentId) return;

    const commentId = deleteCommentId;

    try {
      setConfirmLoading(true);
      setCommentActionId(commentId);

      const { error } = await supabase
        .from("community_comments")
        .delete()
        .eq("id", commentId)
        .eq("user_id", user.id);

      if (error) throw error;

      const nextCommentCount = Math.max(0, selectedPost.comments - 1);

      const { error: countUpdateError } = await supabase
        .from("community_posts")
        .update({ comment_count: nextCommentCount })
        .eq("id", selectedPost.id);

      if (countUpdateError) {
        console.error("댓글 수 갱신 오류:", countUpdateError);
      }

      setComments(previousComments => previousComments.filter(comment => comment.id !== commentId));
      setPosts(previousPosts =>
        previousPosts.map(post =>
          post.id === selectedPost.id ? { ...post, comments: nextCommentCount } : post,
        ),
      );

      if (editingCommentId === commentId) {
        handleCommentEditCancel();
      }

      setConfirmModal({ open: false, type: "" });
      setDeleteCommentId(null);
      showNotification("댓글을 삭제했습니다.", "success");
    } catch (error) {
      console.error("댓글 삭제 오류:", error);
      showNotification(error.message || "댓글 삭제에 실패했습니다.", "error");
    } finally {
      setCommentActionId(null);
      setConfirmLoading(false);
    }
  }

  async function handleWriteSubmit(event) {
    event.preventDefault();

    if (!user) {
      moveToLogin();
      return;
    }

    const trimmedContent = writeForm.content.trim();
    const selectedRecipeId = writeForm.recipeId ? Number(writeForm.recipeId) : null;
    const selectedRecipeName = writeForm.recipeName.trim() || null;

    if (!writeForm.category) {
      setWriteError("카테고리를 선택해주세요.");
      return;
    }

    if (!trimmedContent) {
      setWriteError("게시글 내용을 입력해주세요.");
      return;
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

              return {
                ...post,
                ...mapPost(data),
                liked: post.liked,
                bookmarked: post.bookmarked,
              };
            })
            .filter(post => {
              if (selectedCategory === "최신" || selectedCategory === "인기") return true;
              return post.category === selectedCategory;
            }),
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

      if (uploadedImagePath) {
        await supabase.storage.from(COMMUNITY_BUCKET).remove([uploadedImagePath]);
      }

      setWriteError(
        error.message ||
          (editingPostId ? "게시글 수정에 실패했습니다." : "게시글 등록에 실패했습니다."),
      );
    } finally {
      setWriteSubmitting(false);
    }
  }

  async function handleCommentSubmit(event) {
    event.preventDefault();

    if (!user) {
      moveToLogin();
      return;
    }

    const trimmedComment = commentText.trim();

    if (!selectedPost || !trimmedComment) return;

    try {
      setCommentSubmitting(true);

      const nickname =
        user.user_metadata?.nickname ||
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "사용자";

      const { data, error } = await supabase
        .from("community_comments")
        .insert({
          post_id: selectedPost.id,
          user_id: user.id,
          nickname,
          content: trimmedComment,
        })
        .select()
        .single();

      if (error) throw error;

      const nextCommentCount = selectedPost.comments + 1;

      const { error: countUpdateError } = await supabase
        .from("community_posts")
        .update({ comment_count: nextCommentCount })
        .eq("id", selectedPost.id);

      if (countUpdateError) {
        console.error("댓글 수 갱신 오류:", countUpdateError);
      }

      setComments(previousComments => [...previousComments, mapComment(data)]);
      setCommentText("");
      setPosts(previousPosts =>
        previousPosts.map(post =>
          post.id === selectedPost.id ? { ...post, comments: nextCommentCount } : post,
        ),
      );
    } catch (error) {
      console.error("댓글 등록 오류:", error);
      showNotification(error.message || "댓글 등록에 실패했습니다.", "error");
    } finally {
      setCommentSubmitting(false);
    }
  }

  async function handleCategoryChange(category) {
    if (category === selectedCategory || categoryLoading) {
      return;
    }

    setSelectedCategory(category);
    setCategoryLoading(true);
    setHasMorePosts(true);
    setSelectedPostId(null);
    setPageError("");

    try {
      // 카테고리 변경 시에는 기존 카드를 유지한 채 새 데이터를 요청한다.
      // showLoading을 전달하지 않기 때문에 전체 스켈레톤 UI가 다시 뜨지 않는다.
      await fetchPosts({
        reset: true,
        category,
      });
    } finally {
      setCategoryLoading(false);
    }
  }

  function renderCategoryButton(category) {
    const isSelected = selectedCategory === category;

    return (
      <Button
        key={category}
        type="button"
        variant={isSelected ? "contained" : "outlined"}
        onClick={() => handleCategoryChange(category)}
        className={styles.categoryButton}
        sx={{
          width: "auto",
          minWidth: 0,
          flex: "0 0 auto",

          padding: {
            xs: "7px 16px",
            sm: "8px 18px",
          },

          color: isSelected ? "#fff" : "var(--brand-primary)",

          backgroundColor: isSelected ? "var(--brand-primary)" : "transparent",

          borderColor: "var(--brand-primary)",
          borderRadius: "999px",
          whiteSpace: "nowrap",

          fontSize: {
            xs: "13px",
            sm: "14px",
          },

          boxShadow: "none",

          "&:hover": {
            color: isSelected ? "#fff" : "var(--brand-primary)",

            backgroundColor: isSelected ? "var(--brand-primary-dark)" : "var(--brand-cream)",

            borderColor: "var(--brand-primary-dark)",
            boxShadow: "none",
          },
        }}
      >
        {category}
      </Button>
    );
  }

  return (
    <Layout activeMenu="커뮤니티">
      <section className={styles.communityHeader}>
        <div className={styles.titleArea}>
          <h1 className={`font-display dtext-5xl ${styles.title_h1}`}>커뮤니티</h1>

          <p className={`text-m ${styles.title_p}`}>음식과 레시피를 중심으로 나누는 이야기.</p>
        </div>

        <div className={styles.categoryBar}>
          <div className={styles.category}>
            <div className={styles.categoryRow}>
              {categories.slice(0, 2).map(renderCategoryButton)}
            </div>

            <div className={styles.categoryRow}>
              {categories.slice(2).map(renderCategoryButton)}
            </div>
          </div>

          <Button
            type="button"
            variant="contained"
            startIcon={<EditOutlined />}
            className={styles.writeButton}
            onClick={handleWriteModalOpen}
            sx={{
              flexShrink: 0,

              color: "#fff",
              backgroundColor: "var(--brand-primary)",
              borderRadius: "999px",

              padding: {
                xs: "8px 16px",
                sm: "9px 18px",
              },

              whiteSpace: "nowrap",

              fontSize: {
                xs: "13px",
                sm: "14px",
              },

              boxShadow: "none",

              "&:hover": {
                backgroundColor: "var(--brand-primary-dark)",
                boxShadow: "none",
              },

              "& .MuiButton-startIcon": {
                marginRight: {
                  xs: "4px",
                  sm: "8px",
                },
              },
            }}
          >
            글쓰기
          </Button>
        </div>
      </section>

      <section className={styles.cards}>
        {postsLoading ? (
          <Masonry
            columns={{
              xs: 1,
              sm: 2,
              md: 3,
            }}
            spacing={2}
          >
            {Array.from({ length: 9 }, (_, index) => (
              <CommunityCardSkeleton key={index} index={index} />
            ))}
          </Masonry>
        ) : pageError && posts.length === 0 ? (
          <div className={styles.emptyState}>
            <p>{pageError}</p>

            <button
              type="button"
              onClick={() =>
                fetchPosts({ reset: true, showLoading: true, category: selectedCategory })
              }
            >
              다시 불러오기
            </button>
          </div>
        ) : posts.length > 0 ? (
          <>
            <Masonry
              columns={{
                xs: 1,
                sm: 2,
                md: 3,
              }}
              spacing={2}
            >
              {posts.map((post, index) => (
                <article
                  key={post.id}
                  className={styles.card}
                  onClick={() => handleDetailModalOpen(post.id)}
                >
                  <div className={styles.profile}>
                    <div className={styles.profileImage} />

                    <div className={styles.profileName}>
                      <p className={styles.cardNickname}>{post.nickname}</p>
                      <p className={styles.cardTime}>{post.time}</p>
                    </div>
                  </div>

                  <div className={styles.comment}>
                    <p className={styles.cardText}>{post.content}</p>
                  </div>

                  {post.image && (
                    <img
                      className={styles.cardImage}
                      src={post.image}
                      alt={post.imageAlt}
                      loading={index < 3 ? "eager" : "lazy"}
                      fetchPriority={index === 0 ? "high" : "auto"}
                      decoding="async"
                    />
                  )}

                  {post.recipeName && (
                    <div className={styles.cardRecipeArea}>
                      {post.recipeId ? (
                        <button
                          type="button"
                          className={styles.cardRecipeButton}
                          style={{ border: 0, font: "inherit", cursor: "pointer" }}
                          onClick={event => {
                            event.stopPropagation();
                            navigate(`/recipes/${post.recipeId}`);
                          }}
                        >
                          📖 {post.recipeName}
                        </button>
                      ) : (
                        <span className={styles.cardRecipeButton}>📖 {post.recipeName}</span>
                      )}
                    </div>
                  )}

                  <div className={styles.icons} onClick={event => event.stopPropagation()}>
                    <div className={styles.iconGroup}>
                      <button
                        type="button"
                        className={`${styles.likeButton} ${
                          post.liked ? styles.activeLikeButton : ""
                        }`}
                        aria-label={post.liked ? "좋아요 취소" : "좋아요"}
                        aria-pressed={post.liked}
                        disabled={likeActionIds.includes(post.id)}
                        onClick={() => handleLikeToggle(post.id)}
                      >
                        {post.liked ? <Favorite /> : <FavoriteBorder />}
                        <span>{post.likes}</span>
                      </button>

                      <button
                        type="button"
                        className={styles.commentIconButton}
                        aria-label={`댓글 ${post.comments}개 보기`}
                        onClick={() => handleDetailModalOpen(post.id)}
                      >
                        <ModeCommentOutlined />
                        <span>{post.comments}</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      className={`${styles.bookmarkButton} ${
                        post.bookmarked ? styles.activeBookmarkButton : ""
                      }`}
                      aria-label={post.bookmarked ? "북마크 취소" : "게시글 북마크"}
                      aria-pressed={post.bookmarked}
                      disabled={bookmarkActionIds.includes(post.id)}
                      onClick={() => handleBookmarkToggle(post.id)}
                    >
                      {post.bookmarked ? <Bookmark /> : <BookmarkBorderOutlined />}
                    </button>
                  </div>
                </article>
              ))}
            </Masonry>

            {loadingMore && (
              <Masonry
                columns={{
                  xs: 1,
                  sm: 2,
                  md: 3,
                }}
                spacing={2}
                className={styles.moreSkeletons}
              >
                {Array.from({ length: 3 }, (_, index) => (
                  <CommunityCardSkeleton key={`more-${index}`} index={index + 3} />
                ))}
              </Masonry>
            )}

            <div ref={loadMoreRef} className={styles.loadMoreTrigger} aria-hidden="true" />

            {!hasMorePosts && posts.length > 0 && (
              <p className={styles.endMessage}>모든 게시글을 불러왔습니다.</p>
            )}

            {pageError && posts.length > 0 && (
              <div className={styles.loadMoreError}>
                <span>{pageError}</span>
                <button type="button" onClick={() => fetchPosts({ category: selectedCategory })}>
                  다시 시도
                </button>
              </div>
            )}
          </>
        ) : (
          <div className={styles.emptyState}>
            <p>아직 등록된 게시글이 없습니다.</p>

            <button type="button" onClick={handleWriteModalOpen}>
              첫 게시글 작성하기
            </button>
          </div>
        )}
      </section>

      {/* 게시글 상세 모달 */}
      <Dialog
        open={detailModalOpen}
        onClose={handleDetailModalClose}
        maxWidth={false}
        sx={{
          "& .MuiDialog-container": {
            padding: {
              xs: "8px",
              sm: "24px",
              lg: "32px",
            },
          },

          "& .MuiDialog-paper": {
            width: {
              xs: "100%",
              sm: "680px",
              lg: "960px",
            },

            height: {
              xs: "calc(100dvh - 16px)",
              sm: "calc(100dvh - 48px)",
              lg: "640px",
            },

            maxWidth: "none",
            maxHeight: "none",
            margin: 0,

            borderRadius: {
              xs: "22px",
              sm: "28px",
              lg: "32px",
            },

            overflow: "hidden",
          },
        }}
      >
        {selectedPost && (
          <div className={`${styles.modal} ${!selectedPost.image ? styles.modalWithoutImage : ""}`}>
            {selectedPost.image && (
              <div className={styles.modalImageArea}>
                <img
                  className={styles.modalImage}
                  src={selectedPost.image}
                  alt={selectedPost.imageAlt}
                />
              </div>
            )}

            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <div className={styles.modalProfile}>
                  <div className={styles.modalProfileImage} />

                  <div>
                    <p className={styles.modalNickname}>{selectedPost.nickname}</p>

                    <p className={styles.modalTime}>{selectedPost.time}</p>
                  </div>
                </div>

                <div className={styles.modalHeaderButtons}>
                  {user?.id === selectedPost.userId && (
                    <>
                      <IconButton
                        type="button"
                        aria-label="게시글 수정"
                        onClick={handlePostEditOpen}
                      >
                        <EditOutlined />
                      </IconButton>

                      <IconButton
                        type="button"
                        aria-label="게시글 삭제"
                        onClick={handlePostDeleteRequest}
                      >
                        <DeleteOutlined />
                      </IconButton>
                    </>
                  )}

                  <IconButton type="button" aria-label="닫기" onClick={handleDetailModalClose}>
                    <Close />
                  </IconButton>
                </div>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.modalPost}>
                  <p className={styles.modalPostText}>{selectedPost.content}</p>

                  {selectedPost.recipeName &&
                    (selectedPost.recipeId ? (
                      <button
                        type="button"
                        className={styles.recipeButton}
                        onClick={() => navigate(`/recipes/${selectedPost.recipeId}`)}
                      >
                        📖 {selectedPost.recipeName}
                      </button>
                    ) : (
                      <span className={styles.recipeButton} style={{ cursor: "default" }}>
                        📖 {selectedPost.recipeName}
                      </span>
                    ))}
                </div>

                <div className={styles.modalComments}>
                  <p className={styles.commentCount}>댓글 {comments.length}</p>

                  {commentLoading ? (
                    <p>댓글을 불러오는 중입니다.</p>
                  ) : comments.length > 0 ? (
                    comments.map(comment => (
                      <div key={comment.id} className={styles.modalCommentItem}>
                        <div className={styles.commentProfileImage} />

                        <div className={styles.commentContent}>
                          <div className={styles.commentTopRow}>
                            <div className={styles.commentWriter}>
                              <strong>{comment.writer}</strong>
                              <span>{comment.time}</span>
                            </div>

                            {user?.id === comment.userId && editingCommentId !== comment.id && (
                              <div className={styles.commentManageButtons}>
                                <button
                                  type="button"
                                  onClick={() => handleCommentEditStart(comment)}
                                  disabled={commentActionId === comment.id}
                                >
                                  수정
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleCommentDeleteRequest(comment.id)}
                                  disabled={commentActionId === comment.id}
                                >
                                  삭제
                                </button>
                              </div>
                            )}
                          </div>

                          {editingCommentId === comment.id ? (
                            <div className={styles.commentEditArea}>
                              <textarea
                                value={editingCommentText}
                                onChange={event => setEditingCommentText(event.target.value)}
                                maxLength={300}
                                disabled={commentActionId === comment.id}
                              />

                              <div className={styles.commentEditButtons}>
                                <button
                                  type="button"
                                  onClick={handleCommentEditCancel}
                                  disabled={commentActionId === comment.id}
                                >
                                  취소
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleCommentEditSave(comment.id)}
                                  disabled={commentActionId === comment.id}
                                >
                                  {commentActionId === comment.id ? "저장 중..." : "저장"}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p>{comment.content}</p>
                          )}

                          <div className={styles.commentLike}>
                            <FavoriteBorder fontSize="small" />
                            <span>{comment.likes}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>아직 등록된 댓글이 없습니다.</p>
                  )}
                </div>
              </div>

              <div className={styles.modalFooter}>
                <div className={styles.modalActions}>
                  <div className={styles.modalStats}>
                    <button
                      type="button"
                      className={`${styles.modalLikeButton} ${
                        selectedPost.liked ? styles.activeModalAction : ""
                      }`}
                      disabled={likeActionIds.includes(selectedPost.id)}
                      onClick={() => handleLikeToggle(selectedPost.id)}
                    >
                      {selectedPost.liked ? <Favorite /> : <FavoriteBorder />}
                      <span>{selectedPost.likes}</span>
                    </button>

                    <div className={styles.modalCommentStat}>
                      <ModeCommentOutlined />
                      <span>{selectedPost.comments}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={`${styles.modalBookmarkButton} ${
                      selectedPost.bookmarked ? styles.activeModalAction : ""
                    }`}
                    aria-label={selectedPost.bookmarked ? "북마크 취소" : "북마크"}
                    disabled={bookmarkActionIds.includes(selectedPost.id)}
                    onClick={() => handleBookmarkToggle(selectedPost.id)}
                  >
                    {selectedPost.bookmarked ? <Bookmark /> : <BookmarkBorderOutlined />}
                  </button>
                </div>

                <form className={styles.commentForm} onSubmit={handleCommentSubmit}>
                  <input
                    type="text"
                    value={commentText}
                    onChange={event => setCommentText(event.target.value)}
                    placeholder="댓글을 남겨보세요..."
                    maxLength={300}
                    disabled={commentSubmitting}
                  />

                  <IconButton
                    type="submit"
                    aria-label="댓글 등록"
                    className={styles.sendButton}
                    disabled={commentSubmitting}
                  >
                    <SendOutlined />
                  </IconButton>
                </form>
              </div>
            </div>
          </div>
        )}
      </Dialog>

      {/* 글쓰기 모달 */}
      <Dialog
        open={writeModalOpen}
        onClose={handleWriteModalClose}
        maxWidth={false}
        sx={{
          "& .MuiDialog-container": {
            padding: {
              xs: "8px",
              sm: "24px",
            },
          },

          "& .MuiDialog-paper": {
            width: {
              xs: "100%",
              sm: "620px",
            },

            maxWidth: "none",

            maxHeight: {
              xs: "calc(100dvh - 16px)",
              sm: "calc(100dvh - 48px)",
            },

            margin: 0,

            borderRadius: {
              xs: "22px",
              sm: "28px",
            },

            overflow: "hidden",
          },
        }}
      >
        <form className={styles.writeModal} onSubmit={handleWriteSubmit}>
          <div className={styles.writeModalHeader}>
            <div>
              <h2 className="font-display dtext-2xl">
                {editingPostId ? "커뮤니티 글 수정" : "커뮤니티 글쓰기"}
              </h2>

              <p className="text-sm">
                {editingPostId
                  ? "작성한 게시글 내용을 수정할 수 있습니다."
                  : "음식과 레시피에 관한 이야기를 남겨보세요."}
              </p>
            </div>

            <IconButton type="button" aria-label="글쓰기 창 닫기" onClick={handleWriteModalClose}>
              <Close />
            </IconButton>
          </div>

          <div className={styles.writeModalBody}>
            <div className={styles.writeField}>
              <span>카테고리</span>

              <FormControl fullWidth size="small">
                <Select
                  name="category"
                  value={writeForm.category}
                  onChange={handleWriteFormChange}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        mt: 0.5,
                        borderRadius: "14px",
                        boxShadow: "0 8px 24px rgba(64, 41, 31, 0.12)",
                      },
                    },
                  }}
                  sx={{
                    minHeight: "48px",

                    color: "var(--brand-brown)",
                    backgroundColor: "var(--brand-cream)",
                    borderRadius: "16px",

                    fontFamily: "inherit",

                    fontSize: {
                      xs: "13px",
                      sm: "14px",
                    },

                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "var(--brand-divider)",
                    },

                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "var(--brand-primary)",
                    },

                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "var(--brand-primary)",
                      borderWidth: "1px",
                    },

                    "&.Mui-focused": {
                      boxShadow: "0 0 0 3px rgba(242, 107, 58, 0.12)",
                    },

                    "& .MuiSelect-select": {
                      display: "flex",
                      alignItems: "center",
                      padding: "12px 14px",
                    },
                  }}
                >
                  {writableCategories.map(category => (
                    <MenuItem
                      key={category}
                      value={category}
                      sx={{
                        fontFamily: "inherit",
                        fontSize: "14px",

                        "&.Mui-selected": {
                          color: "var(--brand-primary)",
                          backgroundColor: "var(--brand-cream)",
                        },

                        "&.Mui-selected:hover": {
                          backgroundColor: "var(--brand-beige)",
                        },
                      }}
                    >
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            <label className={styles.writeField}>
              <span>내용</span>

              <textarea
                name="content"
                value={writeForm.content}
                onChange={handleWriteFormChange}
                placeholder="어떤 이야기를 나누고 싶으신가요?"
                maxLength={500}
              />

              <small>{writeForm.content.length}/500</small>
            </label>

            <div className={styles.writeField}>
              <span>연결할 레시피</span>

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  width: "100%",
                }}
              >
                <button
                  type="button"
                  onClick={handleRecipePickerOpen}
                  style={{
                    flex: 1,
                    minHeight: "48px",
                    padding: "12px 14px",
                    border: "1px solid var(--brand-divider)",
                    borderRadius: "16px",
                    background: "var(--brand-cream)",
                    color: writeForm.recipeName ? "var(--brand-brown)" : "var(--brand-gray)",
                    fontFamily: "inherit",
                    fontSize: "14px",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  {writeForm.recipeName || "레시피 찾아보기"}
                </button>

                {writeForm.recipeId && (
                  <button
                    type="button"
                    onClick={handleRecipeClear}
                    style={{
                      flexShrink: 0,
                      padding: "0 14px",
                      border: "1px solid var(--brand-divider)",
                      borderRadius: "16px",
                      background: "#fff",
                      color: "var(--brand-gray)",
                      fontFamily: "inherit",
                      cursor: "pointer",
                    }}
                  >
                    연결 해제
                  </button>
                )}
              </div>

              <small style={{ alignSelf: "flex-start" }}>
                다른 사용자가 등록한 레시피도 검색해서 연결할 수 있습니다.
              </small>
            </div>

            <div className={styles.writeImageField}>
              <div className={styles.writeImageLabel}>
                <span>사진</span>
                <small>선택 사항 · 최대 2MB</small>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className={styles.hiddenFileInput}
              />

              {writeForm.image ? (
                <div className={styles.writeImagePreview}>
                  <img src={writeForm.image} alt="업로드 이미지 미리보기" />

                  <button
                    type="button"
                    className={styles.removeImageButton}
                    onClick={handleRemoveImage}
                  >
                    이미지 삭제
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className={styles.imageUploadButton}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <AddPhotoAlternateOutlined />
                  <span>사진 추가하기</span>
                </button>
              )}
            </div>

            <div
              className={`${styles.writeErrorSlot} ${writeError ? styles.writeErrorVisible : ""}`}
              role="alert"
              aria-live="polite"
            >
              {writeError || "\u00A0"}
            </div>
          </div>

          <div className={styles.writeModalFooter}>
            <button
              type="button"
              className={styles.cancelWriteButton}
              onClick={handleWriteModalClose}
            >
              취소
            </button>

            <button type="submit" className={styles.submitWriteButton} disabled={writeSubmitting}>
              {writeSubmitting
                ? editingPostId
                  ? "수정 중..."
                  : "등록 중..."
                : editingPostId
                  ? "수정하기"
                  : "등록하기"}
            </button>
          </div>
        </form>
      </Dialog>

      {/* 레시피 검색 모달 */}
      <Dialog
        open={recipePickerOpen}
        onClose={handleRecipePickerClose}
        maxWidth={false}
        sx={{
          "& .MuiDialog-container": {
            padding: "16px",
          },

          "& .MuiDialog-paper": {
            // ✅ 결과 개수와 무관하게 완전히 고정
            width: "560px !important",
            height: "420px !important",
            minHeight: "420px !important",
            maxHeight: "420px !important",

            maxWidth: "calc(100vw - 32px) !important",

            margin: "0 !important",
            borderRadius: "18px",
            overflow: "hidden",

            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        {/* 상단 */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",

            padding: "18px 20px 10px",

            flex: "0 0 auto",
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                color: "var(--brand-brown)",
                fontSize: "20px",
              }}
            >
              레시피 찾기
            </h3>

            <p
              style={{
                margin: "4px 0 0",
                color: "var(--brand-gray)",
                fontSize: "13px",
              }}
            >
              등록된 모든 레시피 중에서 연결할 레시피를 선택해주세요.
            </p>
          </div>

          <IconButton
            type="button"
            onClick={handleRecipePickerClose}
            aria-label="닫기"
            sx={{
              mt: "-6px",
              mr: "-6px",
            }}
          >
            <Close />
          </IconButton>
        </div>

        {/* 검색창 */}
        <div
          style={{
            padding: "0 20px 14px",
            flex: "0 0 auto",
          }}
        >
          <TextField
            fullWidth
            size="small"
            value={recipeSearch}
            onChange={event => setRecipeSearch(event.target.value)}
            placeholder="레시피 이름으로 검색"
            autoFocus
            sx={{
              "& .MuiOutlinedInput-root": {
                height: "42px",

                borderRadius: "14px",
                backgroundColor: "var(--brand-cream)",
                fontFamily: "inherit",

                "&.Mui-focused fieldset": {
                  borderColor: "var(--brand-primary)",
                },
              },
            }}
          />
        </div>

        {/* ✅ 검색 결과 영역 - 여기 크기도 완전히 고정 */}
        <div
          style={{
            height: "270px",
            minHeight: "270px",
            maxHeight: "270px",

            overflowY: "auto",
            overflowX: "hidden",

            padding: "0 20px 16px",

            display: "flex",
            flexDirection: "column",
            gap: "8px",

            boxSizing: "border-box",
            flex: "0 0 270px",
          }}
        >
          {recipesLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <Skeleton
                key={index}
                variant="rounded"
                height={72}
                sx={{
                  height: "72px",
                  minHeight: "72px",
                  borderRadius: "14px",
                  flexShrink: 0,
                }}
              />
            ))
          ) : recipeResults.length > 0 ? (
            recipeResults.map(recipe => (
              <button
                key={recipe.id}
                type="button"
                onClick={() => handleRecipeSelect(recipe)}
                style={{
                  width: "100%",

                  height: "72px",
                  minHeight: "72px",
                  maxHeight: "72px",

                  display: "flex",
                  alignItems: "center",
                  gap: "12px",

                  padding: "10px",

                  border: "1px solid var(--brand-divider)",
                  borderRadius: "14px",
                  backgroundColor: "#fff",

                  textAlign: "left",
                  cursor: "pointer",
                  fontFamily: "inherit",

                  boxSizing: "border-box",
                  flexShrink: 0,
                }}
              >
                {recipe.thumbnail_url ? (
                  <img
                    src={recipe.thumbnail_url}
                    alt={recipe.title}
                    style={{
                      width: "52px",
                      height: "52px",

                      objectFit: "cover",
                      borderRadius: "10px",
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "52px",
                      height: "52px",

                      borderRadius: "10px",
                      backgroundColor: "var(--brand-primary)",
                      color: "#fff",

                      display: "grid",
                      placeItems: "center",

                      fontSize: "10px",

                      flexShrink: 0,
                    }}
                  >
                    No Image
                  </div>
                )}

                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <strong
                    style={{
                      display: "block",

                      color: "var(--brand-brown)",
                      fontSize: "14px",

                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {recipe.title}
                  </strong>

                  <span
                    style={{
                      display: "block",
                      marginTop: "4px",

                      color: "var(--brand-gray)",
                      fontSize: "12px",

                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {[recipe.cuisine, recipe.cooking_time, recipe.difficulty]
                      .filter(Boolean)
                      .join(" · ") || "레시피"}
                  </span>
                </div>
              </button>
            ))
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",

                display: "flex",
                alignItems: "center",
                justifyContent: "center",

                color: "var(--brand-gray)",
                fontSize: "14px",
                textAlign: "center",
              }}
            >
              {recipeSearch.trim() ? "검색 결과가 없습니다." : "등록된 레시피가 없습니다."}
            </div>
          )}
        </div>
      </Dialog>
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={closeNotification}
      />

      <ConfirmModal
        open={confirmModal.open}
        title={confirmModal.type === "post" ? "게시글 삭제" : "댓글 삭제"}
        message={
          confirmModal.type === "post"
            ? "이 게시글을 삭제할까요? 삭제한 게시글은 복구할 수 없습니다."
            : "이 댓글을 삭제할까요? 삭제한 댓글은 복구할 수 없습니다."
        }
        confirmText="삭제하기"
        cancelText="취소"
        danger
        loading={confirmLoading}
        onCancel={closeConfirmModal}
        onConfirm={
          confirmModal.type === "post" ? handlePostDeleteConfirm : handleCommentDeleteConfirm
        }
      />
    </Layout>
  );
}
