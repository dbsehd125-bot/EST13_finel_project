/**
 * 커뮤니티 공통 유틸리티
 * - 게시글/댓글 데이터를 화면에서 사용하는 형태로 변환
 * - 날짜 표시 등 여러 커뮤니티 컴포넌트에서 공통으로 사용하는 함수 관리
 * - 커뮤니티에서 사용하는 공통 상수 관리
 */
export const categories = ["최신", "인기", "요리 후기", "질문", "자유 이야기"];
export const writableCategories = ["요리 후기", "질문", "자유 이야기"];
export const COMMUNITY_BUCKET = "community-images";
export const POSTS_PER_PAGE = 9;

export const initialWriteForm = {
  category: "자유 이야기",
  content: "",
  recipeId: "",
  recipeName: "",
  image: "",
};

export function formatRelativeTime(dateString) {
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

export function mapPost(row) {
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

export function mapComment(row) {
  return {
    id: row.id,
    userId: row.user_id,
    writer: row.nickname || "사용자",
    time: formatRelativeTime(row.created_at),
    content: row.content,
  };
}
