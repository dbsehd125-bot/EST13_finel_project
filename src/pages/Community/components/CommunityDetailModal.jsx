/**
 * 커뮤니티 게시글 상세 모달
 * - 선택한 게시글의 작성자 프로필, 내용, 이미지, 연결 레시피 표시
 * - 게시글 좋아요/북마크 및 작성자 수정·삭제 기능 제공
 * - 댓글 작성자의 현재 profiles 정보 표시
 */
import { Dialog, IconButton } from "@mui/material";

import {
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

import UserAvatar from "../../../components/UserAvatar";

import styles from "../Community.module.css";

export default function CommunityDetailModal({
  open,
  selectedPost,
  user,
  comments,
  commentLoading,
  commentText,
  setCommentText,
  commentSubmitting,
  editingCommentId,
  editingCommentText,
  setEditingCommentText,
  commentActionId,
  likeActionIds,
  bookmarkActionIds,
  onClose,
  onEditPost,
  onDeletePost,
  onRecipeNavigate,
  onCommentEditStart,
  onCommentDelete,
  onCommentEditCancel,
  onCommentEditSave,
  onLikeToggle,
  onBookmarkToggle,
  onCommentSubmit,
}) {
  if (!selectedPost) {
    return null;
  }

  const postNickname = selectedPost.profile?.nickname || selectedPost.nickname || "사용자";

  const postAvatarUrl = selectedPost.profile?.avatar_url || null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
              <UserAvatar src={postAvatarUrl} name={postNickname} size="md" />

              <div>
                <p className={styles.modalNickname}>{postNickname}</p>

                <p className={styles.modalTime}>{selectedPost.time}</p>
              </div>
            </div>

            <div className={styles.modalHeaderButtons}>
              {user?.id === selectedPost.userId && (
                <>
                  <IconButton type="button" aria-label="게시글 수정" onClick={onEditPost}>
                    <EditOutlined />
                  </IconButton>

                  <IconButton type="button" aria-label="게시글 삭제" onClick={onDeletePost}>
                    <DeleteOutlined />
                  </IconButton>
                </>
              )}

              <IconButton type="button" aria-label="닫기" onClick={onClose}>
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
                    onClick={() => onRecipeNavigate(selectedPost.recipeId)}
                  >
                    📖 {selectedPost.recipeName}
                  </button>
                ) : (
                  <span
                    className={styles.recipeButton}
                    style={{
                      cursor: "default",
                    }}
                  >
                    📖 {selectedPost.recipeName}
                  </span>
                ))}
            </div>

            <div className={styles.modalComments}>
              <p className={styles.commentCount}>댓글 {comments.length}</p>

              {commentLoading ? (
                <p>댓글을 불러오는 중입니다.</p>
              ) : comments.length > 0 ? (
                comments.map(comment => {
                  const commentNickname = comment.profile?.nickname || comment.writer || "사용자";

                  const commentAvatarUrl = comment.profile?.avatar_url || null;

                  return (
                    <div key={comment.id} className={styles.modalCommentItem}>
                      <UserAvatar src={commentAvatarUrl} name={commentNickname} size="sm" />

                      <div className={styles.commentContent}>
                        <div className={styles.commentTopRow}>
                          <div className={styles.commentWriter}>
                            <strong>{commentNickname}</strong>

                            <span>{comment.time}</span>
                          </div>

                          {user?.id === comment.userId && editingCommentId !== comment.id && (
                            <div className={styles.commentManageButtons}>
                              <button
                                type="button"
                                onClick={() => onCommentEditStart(comment)}
                                disabled={commentActionId === comment.id}
                              >
                                수정
                              </button>

                              <button
                                type="button"
                                onClick={() => onCommentDelete(comment.id)}
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
                                onClick={onCommentEditCancel}
                                disabled={commentActionId === comment.id}
                              >
                                취소
                              </button>

                              <button
                                type="button"
                                onClick={() => onCommentEditSave(comment.id)}
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
                  );
                })
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
                  onClick={() => onLikeToggle(selectedPost.id)}
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
                onClick={() => onBookmarkToggle(selectedPost.id)}
              >
                {selectedPost.bookmarked ? <Bookmark /> : <BookmarkBorderOutlined />}
              </button>
            </div>

            <form className={styles.commentForm} onSubmit={onCommentSubmit}>
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
    </Dialog>
  );
}
