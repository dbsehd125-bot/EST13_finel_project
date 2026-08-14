/**
 * 커뮤니티 메인 페이지
 * - 커뮤니티 페이지 전체 상태와 기능을 조합
 * - 게시글 피드, 상세 모달, 글쓰기 모달, 삭제 확인 모달을 연결
 * - 실제 데이터 처리 로직은 각 custom hook에 위임
 */
import { useState } from "react";
import { useNavigate } from "react-router";

import { supabase } from "../../lib/supabaseClient";
import Layout from "../../components/Layout";
import ConfirmModal from "../../components/ConfirmModal";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";

import CommunityHeader from "./components/CommunityHeader";
import CommunityFeed from "./components/CommunityFeed";
import CommunityDetailModal from "./components/CommunityDetailModal";
import CommunityWriteModal from "./components/CommunityWriteModal";
import RecipePickerModal from "./components/RecipePickerModal";
import useCommunityFeed from "./hooks/useCommunityFeed";
import useCommunityComments from "./hooks/useCommunityComments";
import useCommunityWrite from "./hooks/useCommunityWrite";

import SEO from "../../components/SEO";

export default function Community() {
  const navigate = useNavigate();

  /**
   * profile도 같이 가져온다.
   *
   * 새 게시글 작성 시 Auth metadata가 아니라
   * profiles.nickname을 우선 사용하기 위해 필요하다.
   */
  const { user, profile, authLoading } = useAuth();

  const { showNotification } = useNotification();

  const [confirmModal, setConfirmModal] = useState({
    open: false,
    type: "",
  });

  const [deleteCommentId, setDeleteCommentId] = useState(null);

  const [confirmLoading, setConfirmLoading] = useState(false);

  function moveToLogin() {
    navigate("/login", {
      state: {
        from: "/community",
      },
    });
  }

  const feed = useCommunityFeed({
    user,
    authLoading,
    moveToLogin,
    showNotification,
  });

  const comments = useCommunityComments({
    user,
    selectedPost: feed.selectedPost,
    selectedPostId: feed.selectedPostId,
    setPosts: feed.setPosts,
    moveToLogin,
    showNotification,
  });

  const write = useCommunityWrite({
    user,

    /**
     * 현재 로그인 사용자의
     * profiles 데이터 전달
     */
    profile,

    authLoading,
    selectedPost: feed.selectedPost,
    selectedCategory: feed.selectedCategory,
    setPosts: feed.setPosts,
    fetchPosts: feed.fetchPosts,
    handleCategoryChange: feed.handleCategoryChange,
    moveToLogin,
  });

  function handleDetailModalOpen(postId) {
    feed.setSelectedPostId(postId);
  }

  function handleDetailModalClose() {
    feed.setSelectedPostId(null);

    comments.resetCommentState();
  }

  function closeConfirmModal() {
    setConfirmModal(previous => ({
      ...previous,
      open: false,
    }));
  }

  function handlePostDeleteRequest() {
    if (!user || !feed.selectedPost || feed.selectedPost.userId !== user.id) {
      return;
    }

    setConfirmModal({
      open: true,
      type: "post",
    });
  }

  async function handlePostDeleteConfirm() {
    if (!user || !feed.selectedPost || feed.selectedPost.userId !== user.id) {
      return;
    }

    const postId = feed.selectedPost.id;

    const imageUrl = feed.selectedPost.image;

    try {
      setConfirmLoading(true);

      const { error } = await supabase
        .from("community_posts")
        .delete()
        .eq("id", postId)
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      if (imageUrl) {
        await write.removeCommunityImageByUrl(imageUrl);
      }

      feed.setPosts(previousPosts => previousPosts.filter(post => post.id !== postId));

      closeConfirmModal();
      handleDetailModalClose();

      showNotification("게시글을 삭제했습니다.", "success");
    } catch (error) {
      console.error("게시글 삭제 오류:", error);

      showNotification(error.message || "게시글 삭제에 실패했습니다.", "error");
    } finally {
      setConfirmLoading(false);
    }
  }

  function handleCommentDeleteRequest(commentId) {
    if (!user || !feed.selectedPost) {
      return;
    }

    const targetComment = comments.comments.find(comment => comment.id === commentId);

    if (!targetComment || targetComment.userId !== user.id) {
      return;
    }

    setDeleteCommentId(commentId);

    setConfirmModal({
      open: true,
      type: "comment",
    });
  }

  async function handleCommentDeleteConfirm() {
    if (!deleteCommentId) {
      return;
    }

    try {
      setConfirmLoading(true);

      const deleted = await comments.deleteComment(deleteCommentId);

      if (!deleted) {
        return;
      }

      closeConfirmModal();

      setDeleteCommentId(null);
    } finally {
      setConfirmLoading(false);
    }
  }

  return (
    <Layout activeMenu="커뮤니티">
      <SEO
        title="요리 커뮤니티 | 깃깔나는 레시피"
        description="요리 후기와 질문, 자유로운 이야기를 나누고 다른 사용자의 레시피를 만나보세요."
      />
      <CommunityHeader
        selectedCategory={feed.selectedCategory}
        onCategoryChange={feed.handleCategoryChange}
        onWrite={write.handleWriteModalOpen}
      />

      <CommunityFeed
        posts={feed.posts}
        postsLoading={feed.postsLoading}
        pageError={feed.pageError}
        selectedCategory={feed.selectedCategory}
        loadingMore={feed.loadingMore}
        hasMorePosts={feed.hasMorePosts}
        loadMoreRef={feed.loadMoreRef}
        likeActionIds={feed.likeActionIds}
        bookmarkActionIds={feed.bookmarkActionIds}
        onRetry={feed.fetchPosts}
        onWrite={write.handleWriteModalOpen}
        onOpenDetail={handleDetailModalOpen}
        onLikeToggle={feed.handleLikeToggle}
        onBookmarkToggle={feed.handleBookmarkToggle}
        onRecipeNavigate={recipeId => navigate(`/recipes/${recipeId}`)}
      />

      <CommunityDetailModal
        open={Boolean(feed.selectedPost)}
        selectedPost={feed.selectedPost}
        user={user}
        comments={comments.comments}
        commentLoading={comments.commentLoading}
        commentText={comments.commentText}
        setCommentText={comments.setCommentText}
        commentSubmitting={comments.commentSubmitting}
        editingCommentId={comments.editingCommentId}
        editingCommentText={comments.editingCommentText}
        setEditingCommentText={comments.setEditingCommentText}
        commentActionId={comments.commentActionId}
        likeActionIds={feed.likeActionIds}
        bookmarkActionIds={feed.bookmarkActionIds}
        onClose={handleDetailModalClose}
        onEditPost={write.handlePostEditOpen}
        onDeletePost={handlePostDeleteRequest}
        onRecipeNavigate={recipeId => navigate(`/recipes/${recipeId}`)}
        onCommentEditStart={comments.handleCommentEditStart}
        onCommentDelete={handleCommentDeleteRequest}
        onCommentEditCancel={comments.handleCommentEditCancel}
        onCommentEditSave={comments.handleCommentEditSave}
        onLikeToggle={feed.handleLikeToggle}
        onBookmarkToggle={feed.handleBookmarkToggle}
        onCommentSubmit={comments.handleCommentSubmit}
      />

      <CommunityWriteModal
        open={write.writeModalOpen}
        editingPostId={write.editingPostId}
        writeForm={write.writeForm}
        writeError={write.writeError}
        writeSubmitting={write.writeSubmitting}
        fileInputRef={write.fileInputRef}
        onClose={write.handleWriteModalClose}
        onSubmit={write.handleWriteSubmit}
        onFormChange={write.handleWriteFormChange}
        onRecipePickerOpen={write.handleRecipePickerOpen}
        onRecipeClear={write.handleRecipeClear}
        onImageChange={write.handleImageChange}
        onRemoveImage={write.handleRemoveImage}
      />

      <RecipePickerModal
        open={write.recipePickerOpen}
        recipeSearch={write.recipeSearch}
        setRecipeSearch={write.setRecipeSearch}
        recipeResults={write.recipeResults}
        recipesLoading={write.recipesLoading}
        onClose={write.handleRecipePickerClose}
        onSelect={write.handleRecipeSelect}
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
        onCancel={() => {
          closeConfirmModal();

          setDeleteCommentId(null);
        }}
        onConfirm={
          confirmModal.type === "post" ? handlePostDeleteConfirm : handleCommentDeleteConfirm
        }
      />
    </Layout>
  );
}
