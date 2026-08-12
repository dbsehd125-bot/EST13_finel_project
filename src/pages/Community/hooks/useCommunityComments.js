/**
 * 커뮤니티 댓글 관리 Custom Hook
 * - 선택한 게시글의 댓글 목록 조회
 * - 댓글 작성, 수정, 삭제 처리
 * - 댓글 작성자 확인 및 댓글 관련 상태 관리
 */
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { mapComment } from "../communityUtils";

export default function useCommunityComments({
  user,
  selectedPost,
  selectedPostId,
  setPosts,
  moveToLogin,
  showNotification,
}) {
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [commentActionId, setCommentActionId] = useState(null);

  useEffect(() => {
    if (!selectedPostId) {
      setComments([]);
      setCommentText("");
      return undefined;
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

    void loadComments();
    return () => {
      mounted = false;
    };
  }, [selectedPostId]);

  function resetCommentState() {
    setCommentText("");
    setEditingCommentId(null);
    setEditingCommentText("");
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

  async function deleteComment(commentId) {
    if (!user || !selectedPost || !commentId) return false;

    try {
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

      if (countUpdateError) console.error("댓글 수 갱신 오류:", countUpdateError);

      setComments(previousComments => previousComments.filter(comment => comment.id !== commentId));
      setPosts(previousPosts =>
        previousPosts.map(post =>
          post.id === selectedPost.id ? { ...post, comments: nextCommentCount } : post,
        ),
      );

      if (editingCommentId === commentId) handleCommentEditCancel();
      showNotification("댓글을 삭제했습니다.", "success");
      return true;
    } catch (error) {
      console.error("댓글 삭제 오류:", error);
      showNotification(error.message || "댓글 삭제에 실패했습니다.", "error");
      return false;
    } finally {
      setCommentActionId(null);
    }
  }

  async function handleCommentSubmit(event) {
    event.preventDefault();
    if (!user) return moveToLogin();

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

      if (countUpdateError) console.error("댓글 수 갱신 오류:", countUpdateError);

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

  return {
    comments,
    commentText,
    setCommentText,
    commentLoading,
    commentSubmitting,
    editingCommentId,
    editingCommentText,
    setEditingCommentText,
    commentActionId,
    resetCommentState,
    handleCommentEditStart,
    handleCommentEditCancel,
    handleCommentEditSave,
    deleteComment,
    handleCommentSubmit,
  };
}
