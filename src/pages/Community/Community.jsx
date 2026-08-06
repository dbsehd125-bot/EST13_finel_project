import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import {
  AddPhotoAlternateOutlined,
  Bookmark,
  BookmarkBorderOutlined,
  Close,
  EditOutlined,
  Favorite,
  FavoriteBorder,
  ModeCommentOutlined,
  SendOutlined,
} from "@mui/icons-material";
import { Button, Dialog, FormControl, IconButton, MenuItem, Select } from "@mui/material";
import Masonry from "@mui/lab/Masonry";

import { supabase } from "../../lib/supabaseClient";
import Layout from "../../components/Layout";
import styles from "./Community.module.css";

const categories = ["인기", "최신", "요리 후기", "질문", "자유 이야기"];
const writableCategories = ["요리 후기", "질문", "자유 이야기"];
const COMMUNITY_BUCKET = "community-images";

const initialWriteForm = {
  category: "자유 이야기",
  content: "",
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

export default function Community() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState("인기");
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
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

  const fileInputRef = useRef(null);

  const selectedPost = posts.find(post => post.id === selectedPostId) ?? null;
  const detailModalOpen = Boolean(selectedPost);

  const filteredPosts = useMemo(() => {
    const copiedPosts = [...posts];

    if (selectedCategory === "인기") {
      return copiedPosts.sort((a, b) => b.likes - a.likes);
    }

    if (selectedCategory === "최신") {
      return copiedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return copiedPosts.filter(post => post.category === selectedCategory);
  }, [posts, selectedCategory]);

  async function fetchPosts({ showLoading = false } = {}) {
    if (showLoading) {
      setPostsLoading(true);
    }

    setPageError("");

    const { data, error } = await supabase
      .from("community_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("커뮤니티 게시글 조회 오류:", error);
      setPageError("게시글을 불러오지 못했습니다.");

      if (showLoading) {
        setPostsLoading(false);
      }

      return false;
    }

    setPosts((data ?? []).map(mapPost));

    if (showLoading) {
      setPostsLoading(false);
    }

    return true;
  }

  useEffect(() => {
    let mounted = true;

    async function loadInitialData() {
      try {
        const {
          data: { user: currentUser },
          error: userError,
        } = await supabase.auth.getUser();

        if (!mounted) return;

        if (userError) {
          console.error("사용자 정보 조회 오류:", userError);
        }

        setUser(currentUser ?? null);
        setAuthLoading(false);

        await fetchPosts({ showLoading: true });
      } catch (error) {
        console.error("커뮤니티 초기 데이터 조회 오류:", error);

        if (mounted) {
          setPageError("게시글을 불러오지 못했습니다.");
          setPostsLoading(false);
          setAuthLoading(false);
        }
      }
    }

    loadInitialData();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
        setAuthLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

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

  async function getAuthenticatedUser() {
    if (user) return user;

    const {
      data: { user: currentUser },
      error,
    } = await supabase.auth.getUser();

    if (error || !currentUser) {
      return null;
    }

    setUser(currentUser);
    return currentUser;
  }

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
  }

  function handleLikeToggle(postId) {
    setPosts(previousPosts =>
      previousPosts.map(post => {
        if (post.id !== postId) return post;

        return {
          ...post,
          liked: !post.liked,
          likes: post.liked ? Math.max(0, post.likes - 1) : post.likes + 1,
        };
      }),
    );
  }

  function handleBookmarkToggle(postId) {
    setPosts(previousPosts =>
      previousPosts.map(post =>
        post.id === postId ? { ...post, bookmarked: !post.bookmarked } : post,
      ),
    );
  }

  async function handleWriteModalOpen() {
    if (authLoading) return;

    const currentUser = await getAuthenticatedUser();

    if (!currentUser) {
      moveToLogin();
      return;
    }

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

    if (file.size > 5 * 1024 * 1024) {
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

  async function handleWriteSubmit(event) {
    event.preventDefault();

    const currentUser = await getAuthenticatedUser();

    if (!currentUser) {
      moveToLogin();
      return;
    }

    const trimmedContent = writeForm.content.trim();
    const trimmedRecipeName = writeForm.recipeName.trim();

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

      const { imageUrl, uploadedPath } = await uploadCommunityImage(selectedImageFile, currentUser);
      uploadedImagePath = uploadedPath;

      const nickname =
        currentUser.user_metadata?.nickname ||
        currentUser.user_metadata?.full_name ||
        currentUser.email?.split("@")[0] ||
        "사용자";

      const submittedCategory = writeForm.category;

      const { error } = await supabase.from("community_posts").insert({
        user_id: currentUser.id,
        nickname,
        category: submittedCategory,
        content: trimmedContent,
        recipe_name: trimmedRecipeName || null,
        image_url: imageUrl,
      });

      if (error) throw error;

      // 등록 직후 DB에서 최신 게시글 목록을 다시 조회해 화면에 바로 반영
      await fetchPosts();

      setSelectedCategory(submittedCategory);
      setWriteModalOpen(false);
      resetWriteForm();
    } catch (error) {
      console.error("게시글 등록 오류:", error);

      if (uploadedImagePath) {
        await supabase.storage.from(COMMUNITY_BUCKET).remove([uploadedImagePath]);
      }

      setWriteError(error.message || "게시글 등록에 실패했습니다.");
    } finally {
      setWriteSubmitting(false);
    }
  }

  async function handleCommentSubmit(event) {
    event.preventDefault();

    const currentUser = await getAuthenticatedUser();

    if (!currentUser) {
      moveToLogin();
      return;
    }

    const trimmedComment = commentText.trim();

    if (!selectedPost || !trimmedComment) return;

    try {
      setCommentSubmitting(true);

      const nickname =
        currentUser.user_metadata?.nickname ||
        currentUser.user_metadata?.full_name ||
        currentUser.email?.split("@")[0] ||
        "사용자";

      const { data, error } = await supabase
        .from("community_comments")
        .insert({
          post_id: selectedPost.id,
          user_id: currentUser.id,
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
      alert(error.message || "댓글 등록에 실패했습니다.");
    } finally {
      setCommentSubmitting(false);
    }
  }

  function renderCategoryButton(category) {
    const isSelected = selectedCategory === category;

    return (
      <Button
        key={category}
        type="button"
        variant={isSelected ? "contained" : "outlined"}
        onClick={() => setSelectedCategory(category)}
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
          <div className={styles.emptyState}>
            <p>게시글을 불러오는 중입니다.</p>
          </div>
        ) : pageError ? (
          <div className={styles.emptyState}>
            <p>{pageError}</p>
          </div>
        ) : filteredPosts.length > 0 ? (
          <Masonry
            columns={{
              xs: 1,
              sm: 2,
              md: 3,
            }}
            spacing={2}
          >
            {filteredPosts.map(post => (
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
                  <img className={styles.cardImage} src={post.image} alt={post.imageAlt} />
                )}

                {post.recipeName && (
                  <div className={styles.cardRecipeArea}>
                    <span className={styles.cardRecipeButton}>📖 {post.recipeName}</span>
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
                    onClick={() => handleBookmarkToggle(post.id)}
                  >
                    {post.bookmarked ? <Bookmark /> : <BookmarkBorderOutlined />}
                  </button>
                </div>
              </article>
            ))}
          </Masonry>
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
                  <IconButton type="button" aria-label="닫기" onClick={handleDetailModalClose}>
                    <Close />
                  </IconButton>
                </div>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.modalPost}>
                  <p className={styles.modalPostText}>{selectedPost.content}</p>

                  {selectedPost.recipeName && (
                    <button type="button" className={styles.recipeButton}>
                      📖 {selectedPost.recipeName}
                    </button>
                  )}
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
                          <div className={styles.commentWriter}>
                            <strong>{comment.writer}</strong>
                            <span>{comment.time}</span>
                          </div>

                          <p>{comment.content}</p>

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
              <h2 className="font-display dtext-2xl">커뮤니티 글쓰기</h2>

              <p className="text-sm">음식과 레시피에 관한 이야기를 남겨보세요.</p>
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

            <label className={styles.writeField}>
              <span>연결할 레시피</span>

              <input
                name="recipeName"
                type="text"
                value={writeForm.recipeName}
                onChange={handleWriteFormChange}
                placeholder="레시피 이름을 입력해주세요. (선택)"
                maxLength={60}
              />
            </label>

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
              {writeSubmitting ? "등록 중..." : "등록하기"}
            </button>
          </div>
        </form>
      </Dialog>
    </Layout>
  );
}
