/**
 * 커뮤니티 댓글 관리 Custom Hook
 * - 선택한 게시글의 댓글 목록 조회
 * - 댓글 작성자의 profiles 정보 조회
 * - 댓글 작성, 수정, 삭제 처리
 */
import { useEffect, useState } from "react";

import { supabase } from "../../../lib/supabaseClient";
import { getUserNickname } from "../../../utils/userProfile";
import { mapComment } from "../communityUtils";

/**
 * 댓글 작성자의 현재 profiles 정보를 한 번에 조회해서 붙인다.
 */
async function attachProfilesToComments(comments) {
  if (!Array.isArray(comments) || comments.length === 0) {
    return [];
  }

  const userIds = [...new Set(comments.map(comment => comment.userId).filter(Boolean))];

  if (userIds.length === 0) {
    return comments.map(comment => ({
      ...comment,
      profile: null,
    }));
  }

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("user_id, nickname, avatar_url")
    .in("user_id", userIds);

  if (error) {
    console.error("댓글 작성자 프로필 조회 오류:", error);

    return comments.map(comment => ({
      ...comment,
      profile: null,
    }));
  }

  const profileMap = new Map((profiles || []).map(profile => [profile.user_id, profile]));

  return comments.map(comment => ({
    ...comment,
    profile: profileMap.get(comment.userId) || null,
  }));
}

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

  /**
   * 댓글 목록 + 작성자 profiles 조회
   */
  useEffect(() => {
    if (!selectedPostId) {
      setComments([]);
      setCommentText("");

      return undefined;
    }

    let mounted = true;

    async function loadComments() {
      try {
        setCommentLoading(true);

        const { data, error } = await supabase
          .from("community_comments")
          .select("*")
          .eq("post_id", selectedPostId)
          .order("created_at", {
            ascending: true,
          });

        if (error) {
          throw error;
        }

        const mappedComments = (data ?? []).map(mapComment);

        const commentsWithProfiles = await attachProfilesToComments(mappedComments);

        if (!mounted) return;

        setComments(commentsWithProfiles);
      } catch (error) {
        console.error("댓글 조회 오류:", error);

        if (mounted) {
          setComments([]);
        }
      } finally {
        if (mounted) {
          setCommentLoading(false);
        }
      }
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
    if (!user || comment.userId !== user.id) {
      return;
    }

    setEditingCommentId(comment.id);
    setEditingCommentText(comment.content);
  }

  function handleCommentEditCancel() {
    setEditingCommentId(null);
    setEditingCommentText("");
  }

  async function handleCommentEditSave(commentId) {
    if (!user || commentActionId) return;

    const trimmedContent = editingCommentText.trim();

    if (!trimmedContent) {
      showNotification("댓글 내용을 입력해주세요.", "warning");

      return;
    }

    try {
      setCommentActionId(commentId);

      const { data, error } = await supabase
        .from("community_comments")
        .update({
          content: trimmedContent,
        })
        .eq("id", commentId)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;

      setComments(previousComments =>
        previousComments.map(comment =>
          comment.id === commentId
            ? {
                ...comment,
                content: data.content,
              }
            : comment,
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
    if (!user || !selectedPost || !commentId) {
      return false;
    }

    try {
      setCommentActionId(commentId);

      const { error } = await supabase
        .from("community_comments")
        .delete()
        .eq("id", commentId)
        .eq("user_id", user.id);

      if (error) throw error;

      setComments(previousComments => previousComments.filter(comment => comment.id !== commentId));

      setPosts(previousPosts =>
        previousPosts.map(post =>
          post.id === selectedPost.id
            ? {
                ...post,
                comments: Math.max(0, post.comments - 1),
              }
            : post,
        ),
      );

      if (editingCommentId === commentId) {
        handleCommentEditCancel();
      }

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

  /**
   * 새 댓글 등록
   */
  async function handleCommentSubmit(event) {
    event.preventDefault();

    if (commentSubmitting) return;

    if (!user) {
      return moveToLogin();
    }

    const trimmedComment = commentText.trim();

    if (!selectedPost || !trimmedComment) {
      return;
    }

    try {
      setCommentSubmitting(true);

      const nickname = getUserNickname(user);

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

      if (error) {
        throw error;
      }

      const mappedComment = mapComment(data);

      /**
       * 새 댓글 등록 직후 현재 프로필을 조회해서 붙인다.
       */
      const { data: currentProfile, error: profileError } = await supabase
        .from("profiles")
        .select("user_id, nickname, avatar_url")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error("현재 댓글 작성자 프로필 조회 오류:", profileError);
      }

      setComments(previousComments => [
        ...previousComments,
        {
          ...mappedComment,
          profile: currentProfile || null,
        },
      ]);

      setCommentText("");

      setPosts(previousPosts =>
        previousPosts.map(post =>
          post.id === selectedPost.id
            ? {
                ...post,
                comments: post.comments + 1,
              }
            : post,
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
