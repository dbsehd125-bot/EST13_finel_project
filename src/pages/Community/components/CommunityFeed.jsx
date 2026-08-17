/**
 * 커뮤니티 게시글 피드 컴포넌트
 * - 조회된 커뮤니티 게시글 목록을 Masonry 형태로 출력
 * - 게시글 작성자 프로필 이미지 표시
 * - 게시글 카드의 좋아요, 북마크, 상세보기 이벤트 처리
 */
import Masonry from "@mui/lab/Masonry";
import useMediaQuery from "@mui/material/useMediaQuery";

import {
  Bookmark,
  BookmarkBorderOutlined,
  Favorite,
  FavoriteBorder,
  ModeCommentOutlined,
} from "@mui/icons-material";

import UserAvatar from "../../../components/UserAvatar";

import CommunityCardSkeleton from "./CommunityCardSkeleton";
import styles from "../Community.module.css";

export default function CommunityFeed({
  posts,
  postsLoading,
  pageError,
  selectedCategory,
  loadingMore,
  hasMorePosts,
  loadMoreRef,
  likeActionIds,
  bookmarkActionIds,
  onRetry,
  onWrite,
  onOpenDetail,
  onLikeToggle,
  onBookmarkToggle,
  onRecipeNavigate,
}) {
  /**
   * 커뮤니티 Masonry 반응형 컬럼
   *
   * 1200px 이상: 3열
   * 768px ~ 1199px: 2열
   * 767px 이하: 1열
   */
  const isDesktop = useMediaQuery("(min-width: 1200px)");
  const isTablet = useMediaQuery("(min-width: 768px)");

  const masonryColumns = isDesktop ? 3 : isTablet ? 2 : 1;

  if (postsLoading) {
    return (
      <section className={styles.cards}>
        <Masonry columns={masonryColumns} spacing={2}>
          {Array.from({ length: 9 }, (_, index) => (
            <CommunityCardSkeleton key={index} index={index} />
          ))}
        </Masonry>
      </section>
    );
  }

  if (pageError && posts.length === 0) {
    return (
      <section className={styles.cards}>
        <div className={styles.emptyState}>
          <p>{pageError}</p>

          <button
            type="button"
            onClick={() =>
              onRetry({
                reset: true,
                showLoading: true,
                category: selectedCategory,
              })
            }
          >
            다시 불러오기
          </button>
        </div>
      </section>
    );
  }

  if (posts.length === 0) {
    return (
      <section className={styles.cards}>
        <div className={styles.emptyState}>
          <p>아직 등록된 게시글이 없습니다.</p>

          <button type="button" onClick={onWrite}>
            첫 게시글 작성하기
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.cards}>
      <Masonry columns={masonryColumns} spacing={2}>
        {posts.map((post, index) => {
          const nickname = post.profile?.nickname || post.nickname || "사용자";

          const avatarUrl = post.profile?.avatar_url || null;

          return (
            <article key={post.id} className={styles.card} onClick={() => onOpenDetail(post.id)}>
              <div className={styles.profile}>
                <UserAvatar src={avatarUrl} name={nickname} size="md" />

                <div className={styles.profileName}>
                  <p className={styles.cardNickname}>{nickname}</p>

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
                  alt={post.imageAlt || `${nickname}님의 커뮤니티 게시글 이미지`}
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
                      style={{
                        border: 0,
                        font: "inherit",
                        cursor: "pointer",
                      }}
                      onClick={event => {
                        event.stopPropagation();

                        onRecipeNavigate(post.recipeId);
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
                    className={`${styles.likeButton} ${post.liked ? styles.activeLikeButton : ""}`}
                    aria-label={post.liked ? "좋아요 취소" : "좋아요"}
                    aria-pressed={post.liked}
                    disabled={likeActionIds.includes(post.id)}
                    onClick={() => onLikeToggle(post.id)}
                  >
                    {post.liked ? <Favorite /> : <FavoriteBorder />}

                    <span>{post.likes}</span>
                  </button>

                  <button
                    type="button"
                    className={styles.commentIconButton}
                    aria-label={`댓글 ${post.comments}개 보기`}
                    onClick={() => onOpenDetail(post.id)}
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
                  onClick={() => onBookmarkToggle(post.id)}
                >
                  {post.bookmarked ? <Bookmark /> : <BookmarkBorderOutlined />}
                </button>
              </div>
            </article>
          );
        })}
      </Masonry>

      {loadingMore && (
        <Masonry columns={masonryColumns} spacing={2} className={styles.moreSkeletons}>
          {Array.from({ length: 3 }, (_, index) => (
            <CommunityCardSkeleton key={`more-${index}`} index={index + 3} />
          ))}
        </Masonry>
      )}

      <div ref={loadMoreRef} className={styles.loadMoreTrigger} aria-hidden="true" />

      {!hasMorePosts && <p className={styles.endMessage}>모든 게시글을 불러왔습니다.</p>}

      {pageError && (
        <div className={styles.loadMoreError}>
          <span>{pageError}</span>

          <button
            type="button"
            onClick={() =>
              onRetry({
                category: selectedCategory,
              })
            }
          >
            다시 시도
          </button>
        </div>
      )}
    </section>
  );
}
