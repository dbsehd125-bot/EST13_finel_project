/**
 * 커뮤니티 게시글 피드 관리 Custom Hook
 * - Supabase에서 게시글 목록 조회 및 카테고리별 정렬/필터링
 * - 게시글은 먼저 화면에 표시하고 profiles 정보는 후속 조회
 * - 무한 스크롤을 위한 페이지 단위 추가 조회
 * - 게시글 좋아요 및 북마크 상태 조회·변경
 * - 게시글 좋아요는 RPC를 통해 원자적으로 처리
 */
import { useEffect, useRef, useState } from "react";

import { supabase } from "../../../lib/supabaseClient";
import { mapPost, POSTS_PER_PAGE } from "../communityUtils";

/**
 * 게시글 작성자의 현재 profiles 정보를 한 번에 조회해서 붙인다.
 */
async function attachProfilesToPosts(posts) {
  if (!Array.isArray(posts) || posts.length === 0) {
    return [];
  }

  const userIds = [...new Set(posts.map(post => post.userId).filter(Boolean))];

  if (userIds.length === 0) {
    return posts.map(post => ({
      ...post,
      profile: null,
    }));
  }

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("user_id, nickname, avatar_url")
    .in("user_id", userIds);

  if (error) {
    console.error("게시글 작성자 프로필 조회 오류:", error);

    return posts.map(post => ({
      ...post,
      profile: null,
    }));
  }

  const profileMap = new Map((profiles || []).map(profile => [profile.user_id, profile]));

  return posts.map(post => ({
    ...post,
    profile: profileMap.get(post.userId) || null,
  }));
}

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
  const bookmarkOffsetRef = useRef(0);

  const selectedPost = posts.find(post => post.id === selectedPostId) ?? null;

  /**
   * 현재 사용자의 게시글 좋아요 / 북마크 상태 조회
   */
  async function loadMyPostReactions(postIds) {
    if (!user || !postIds?.length) {
      return;
    }

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

    if (!likedPostIds && !bookmarkedPostIds) {
      return;
    }

    const targetIds = new Set(postIds);

    setPosts(previousPosts =>
      previousPosts.map(post => {
        if (!targetIds.has(post.id)) {
          return post;
        }

        return {
          ...post,

          ...(likedPostIds
            ? {
                liked: likedPostIds.has(post.id),
              }
            : {}),

          ...(bookmarkedPostIds
            ? {
                bookmarked: bookmarkedPostIds.has(post.id),
              }
            : {}),
        };
      }),
    );
  }

  /**
   * 게시글 작성자 profiles 후속 조회
   *
   * 게시글 자체는 먼저 화면에 렌더링하고
   * profiles 요청은 첫 화면 표시를 막지 않는다.
   */
  async function loadPostProfiles(targetPosts) {
    if (!targetPosts?.length) {
      return;
    }

    const postsWithProfiles = await attachProfilesToPosts(targetPosts);

    const profileMap = new Map(postsWithProfiles.map(post => [post.id, post.profile]));

    setPosts(previousPosts =>
      previousPosts.map(post => {
        if (!profileMap.has(post.id)) {
          return post;
        }

        return {
          ...post,
          profile: profileMap.get(post.id) || null,
        };
      }),
    );
  }

  /**
   * 게시글 조회
   */
  async function fetchPosts({
    reset = false,
    showLoading = false,
    category = selectedCategory,
  } = {}) {
    if (loadingMoreRef.current) {
      return false;
    }

    if (showLoading) {
      setPostsLoading(true);
    } else if (!reset) {
      setLoadingMore(true);
    }

    loadingMoreRef.current = true;

    setPageError("");

    try {
      let mappedPosts = [];
      let fetchedCount = 0;

      /**
       * 북마크 탭
       *
       * 먼저 현재 사용자의 북마크 목록을 조회한 다음
       * 해당 post_id에 해당하는 게시글만 다시 조회한다.
       */
      if (category === "북마크") {
        if (!user) {
          if (reset) {
            setPosts([]);
          }

          setHasMorePosts(false);

          return true;
        }

        const from = reset ? 0 : bookmarkOffsetRef.current;

        const to = from + POSTS_PER_PAGE - 1;

        const { data: bookmarkRows, error: bookmarkError } = await supabase
          .from("community_post_bookmarks")
          .select("post_id, created_at")
          .eq("user_id", user.id)
          .order("created_at", {
            ascending: false,
          })
          .range(from, to);

        if (bookmarkError) {
          throw bookmarkError;
        }

        const rows = bookmarkRows ?? [];

        fetchedCount = rows.length;

        if (reset) {
          bookmarkOffsetRef.current = 0;
        }

        bookmarkOffsetRef.current = from + rows.length;

        const bookmarkedPostIds = rows.map(row => row.post_id);

        if (bookmarkedPostIds.length > 0) {
          const { data: postRows, error: postsError } = await supabase
            .from("community_posts")
            .select("*")
            .in("id", bookmarkedPostIds);

          if (postsError) {
            throw postsError;
          }

          /**
           * .in() 조회는 전달한 id 배열 순서를
           * 그대로 보장하지 않기 때문에
           * 북마크 생성 최신순으로 다시 정렬한다.
           */
          const orderMap = new Map(bookmarkedPostIds.map((id, index) => [id, index]));

          mappedPosts = (postRows ?? [])
            .map(mapPost)
            .map(post => ({
              ...post,
              bookmarked: true,
            }))
            .sort((a, b) => orderMap.get(a.id) - orderMap.get(b.id));
        }
      } else {
        const from = reset ? 0 : posts.length;

        const to = from + POSTS_PER_PAGE - 1;

        let query = supabase.from("community_posts").select("*");

        if (["요리 후기", "질문", "자유 이야기"].includes(category)) {
          query = query.eq("category", category);
        }

        if (category === "인기") {
          query = query
            .order("like_count", {
              ascending: false,
            })
            .order("created_at", {
              ascending: false,
            });
        } else {
          query = query.order("created_at", {
            ascending: false,
          });
        }

        const { data, error } = await query.range(from, to);

        if (error) {
          throw error;
        }

        mappedPosts = (data ?? []).map(mapPost);

        fetchedCount = mappedPosts.length;
      }

      /**
       * profiles 요청을 기다리지 않고
       * 게시글부터 바로 화면에 표시한다.
       */
      setPosts(previousPosts => {
        if (reset) {
          return mappedPosts;
        }

        const existingIds = new Set(previousPosts.map(post => post.id));

        return [...previousPosts, ...mappedPosts.filter(post => !existingIds.has(post.id))];
      });

      setHasMorePosts(fetchedCount === POSTS_PER_PAGE);

      /**
       * profiles는 첫 렌더링 이후
       * 비동기로 적용한다.
       */
      void loadPostProfiles(mappedPosts);

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

  /**
   * 최초 진입
   */
  useEffect(() => {
    void fetchPosts({
      reset: true,
      showLoading: true,
      category: "최신",
    });
  }, []);

  /**
   * 로그인 상태 또는 게시글 목록이 변경되면
   * 현재 사용자의 좋아요 / 북마크 상태를 조회한다.
   *
   * 좋아요 / 북마크 조회는 여기서만 실행해서
   * fetchPosts 내부와 중복 요청되지 않도록 한다.
   */
  const postIdsKey = posts.map(post => post.id).join(",");

  useEffect(() => {
    if (authLoading) {
      return;
    }

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

    if (!postIdsKey) {
      return;
    }

    const postIds = postIdsKey.split(",").map(Number);

    void loadMyPostReactions(postIds);
  }, [authLoading, user?.id, postIdsKey]);

  /**
   * 무한 스크롤
   */
  useEffect(() => {
    const target = loadMoreRef.current;

    if (!target || postsLoading || categoryLoading || loadingMore || !hasMorePosts || pageError) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries;

        if (entry.isIntersecting && !loadingMoreRef.current) {
          void fetchPosts({
            category: selectedCategory,
          });
        }
      },
      {
        root: null,
        rootMargin: "500px 0px",
        threshold: 0,
      },
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

  /**
   * 게시글 좋아요
   *
   * 좋아요 추가/취소는
   * toggle_community_post_like RPC에서 처리한다.
   *
   * community_post_likes에 INSERT/DELETE가 발생하면
   * 기존 DB trigger가 community_posts.like_count를 갱신하고,
   * RPC는 최종 liked 상태와 like_count를 반환한다.
   */
  async function handleLikeToggle(postId) {
    if (authLoading) {
      return;
    }

    if (!user) {
      return moveToLogin();
    }

    if (likeActionIds.includes(postId)) {
      return;
    }

    const targetPost = posts.find(post => post.id === postId);

    if (!targetPost) {
      return;
    }

    try {
      setLikeActionIds(previousIds => [...previousIds, postId]);

      const { data, error } = await supabase.rpc("toggle_community_post_like", {
        target_post_id: postId,
      });

      if (error) {
        throw error;
      }

      /**
       * PostgreSQL RETURNS TABLE 함수는
       * Supabase에서 배열 형태로 반환된다.
       */
      const result = Array.isArray(data) ? data[0] : data;

      if (!result) {
        throw new Error("좋아요 처리 결과를 받지 못했습니다.");
      }

      const nextLiked = Boolean(result.is_liked);

      const nextLikeCount = Number(result.new_like_count ?? 0);

      /**
       * 카드와 상세 모달은 같은 posts 상태를 사용하므로
       * 여기 한 번만 갱신하면 양쪽 UI가 동시에 반영된다.
       */
      setPosts(previousPosts =>
        previousPosts.map(post =>
          post.id === postId
            ? {
                ...post,
                liked: nextLiked,
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

  /**
   * 게시글 북마크 추가 / 취소
   */
  async function handleBookmarkToggle(postId) {
    if (authLoading) {
      return;
    }

    if (!user) {
      return moveToLogin();
    }

    if (bookmarkActionIds.includes(postId)) {
      return;
    }

    const targetPost = posts.find(post => post.id === postId);

    if (!targetPost) {
      return;
    }

    try {
      setBookmarkActionIds(previousIds => [...previousIds, postId]);

      if (targetPost.bookmarked) {
        const { error } = await supabase
          .from("community_post_bookmarks")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);

        if (error) {
          throw error;
        }
      } else {
        const { error } = await supabase.from("community_post_bookmarks").insert({
          post_id: postId,
          user_id: user.id,
        });

        if (error) {
          throw error;
        }
      }

      setPosts(previousPosts => {
        /**
         * 북마크 탭에서 북마크를 취소했다면
         * 더 이상 북마크 목록에 존재하면 안 되므로
         * 해당 카드를 즉시 제거한다.
         */
        if (selectedCategory === "북마크" && targetPost.bookmarked) {
          return previousPosts.filter(post => post.id !== postId);
        }

        return previousPosts.map(post =>
          post.id === postId
            ? {
                ...post,
                bookmarked: !targetPost.bookmarked,
              }
            : post,
        );
      });
    } catch (error) {
      console.error("게시글 북마크 처리 오류:", error);

      showNotification(error.message || "북마크 처리에 실패했습니다.", "error");
    } finally {
      setBookmarkActionIds(previousIds => previousIds.filter(id => id !== postId));
    }
  }

  /**
   * 카테고리 변경
   */
  async function handleCategoryChange(category) {
    if (category === selectedCategory || categoryLoading) {
      return;
    }

    /**
     * 북마크 목록은 로그인 사용자만 볼 수 있음
     */
    if (category === "북마크") {
      if (authLoading) {
        return;
      }

      if (!user) {
        moveToLogin();

        return;
      }
    }

    bookmarkOffsetRef.current = 0;

    setSelectedCategory(category);

    setCategoryLoading(true);

    setHasMorePosts(true);

    setSelectedPostId(null);

    setPageError("");

    try {
      await fetchPosts({
        reset: true,
        category,
      });
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
