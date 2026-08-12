/**
 * 커뮤니티 게시글 피드 관리 Custom Hook
 * - Supabase에서 게시글 목록 조회 및 카테고리별 정렬/필터링
 * - 무한 스크롤을 위한 페이지 단위 추가 조회
 * - 게시글 좋아요 및 북마크 상태 조회·변경
 * - 커뮤니티 피드에서 사용하는 게시글 관련 상태 관리
 */
import { useEffect, useRef, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { mapPost, POSTS_PER_PAGE } from "../communityUtils";

export default function useCommunityFeed({ user, authLoading, moveToLogin, showNotification }) {
  const [selectedCategory, setSelectedCategory] = useState("최신");
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [pageError, setPageError] = useState("");
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [likeActionIds, setLikeActionIds] = useState([]);
  const [bookmarkActionIds, setBookmarkActionIds] = useState([]);

  const loadMoreRef = useRef(null);
  const loadingMoreRef = useRef(false);
  const selectedPost = posts.find(post => post.id === selectedPostId) ?? null;

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

  async function loadMyPostReactions(postIds) {
    if (!user || !postIds?.length) return;

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
      if (error) console.error("좋아요 상태 조회 오류:", error);
      else likedPostIds = new Set((data ?? []).map(row => row.post_id));
    } else {
      console.error("좋아요 상태 조회 오류:", likeResult.reason);
    }

    if (bookmarkResult.status === "fulfilled") {
      const { data, error } = bookmarkResult.value;
      if (error) console.error("북마크 상태 조회 오류:", error);
      else bookmarkedPostIds = new Set((data ?? []).map(row => row.post_id));
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
    if (loadingMoreRef.current) return false;

    const from = reset ? 0 : posts.length;
    const to = from + POSTS_PER_PAGE - 1;

    if (showLoading) setPostsLoading(true);
    else if (!reset) setLoadingMore(true);

    loadingMoreRef.current = true;
    setPageError("");

    try {
      let query = supabase.from("community_posts").select("*");

      if (["요리 후기", "질문", "자유 이야기"].includes(category)) {
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
      if (error) throw error;

      const mappedPosts = (data ?? []).map(mapPost);
      setPosts(previousPosts => {
        if (reset) return mappedPosts;
        const existingIds = new Set(previousPosts.map(post => post.id));
        return [...previousPosts, ...mappedPosts.filter(post => !existingIds.has(post.id))];
      });

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
      if (showLoading) setPostsLoading(false);
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    void fetchPosts({ reset: true, showLoading: true, category: "최신" });
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setPosts(previousPosts =>
        previousPosts.map(post => ({ ...post, liked: false, bookmarked: false })),
      );
      return;
    }

    if (posts.length > 0) void loadMyPostReactions(posts.map(post => post.id));
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
          void fetchPosts({ category: selectedCategory });
        }
      },
      { root: null, rootMargin: "500px 0px", threshold: 0 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [
    posts.length,
    postsLoading,
    categoryLoading,
    loadingMore,
    hasMorePosts,
    pageError,
    selectedCategory,
  ]);

  async function handleLikeToggle(postId) {
    if (authLoading) return;
    if (!user) return moveToLogin();

    const session = await debugSupabaseAuth("좋아요 클릭");
    if (!session) {
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

      const { error: countUpdateError } = await supabase
        .from("community_posts")
        .update({ like_count: nextLikeCount })
        .eq("id", postId);
      if (countUpdateError) throw countUpdateError;

      setPosts(previousPosts =>
        previousPosts.map(post =>
          post.id === postId ? { ...post, liked: !targetPost.liked, likes: nextLikeCount } : post,
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
    if (!user) return moveToLogin();

    const session = await debugSupabaseAuth("북마크 클릭");
    if (!session) {
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

  async function handleCategoryChange(category) {
    if (category === selectedCategory || categoryLoading) return;

    setSelectedCategory(category);
    setCategoryLoading(true);
    setHasMorePosts(true);
    setSelectedPostId(null);
    setPageError("");

    try {
      await fetchPosts({ reset: true, category });
    } finally {
      setCategoryLoading(false);
    }
  }

  return {
    selectedCategory,
    posts,
    setPosts,
    postsLoading,
    categoryLoading,
    loadingMore,
    hasMorePosts,
    pageError,
    selectedPostId,
    setSelectedPostId,
    selectedPost,
    loadMoreRef,
    likeActionIds,
    bookmarkActionIds,
    fetchPosts,
    handleLikeToggle,
    handleBookmarkToggle,
    handleCategoryChange,
  };
}
