/**
 * 레시피 상세 페이지 공통 유틸리티
 * - Supabase 날짜 값을 YYYY.MM.DD 형식으로 변환
 * - 여러 RecipeDetail 컴포넌트에서 함께 사용하는 단순 변환 함수 관리
 */
export function formatDate(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
}
