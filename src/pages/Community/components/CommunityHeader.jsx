/**
 * 커뮤니티 상단 영역 컴포넌트
 * - 커뮤니티 제목과 설명 표시
 * - 최신/인기/북마크/요리 후기/질문/자유 이야기 카테고리 필터 제공
 * - 글쓰기 버튼을 통해 게시글 작성 모달 실행
 */
import { Button } from "@mui/material";
import { EditOutlined } from "@mui/icons-material";
import { categories } from "../communityUtils";
import styles from "../Community.module.css";

export default function CommunityHeader({ selectedCategory, onCategoryChange, onWrite }) {
  function renderCategoryButton(category) {
    const isSelected = selectedCategory === category;

    return (
      <Button
        key={category}
        type="button"
        variant={isSelected ? "contained" : "outlined"}
        onClick={() => onCategoryChange(category)}
        className={styles.categoryButton}
        sx={{
          width: "auto",
          minWidth: 0,
          flex: "0 0 auto",
          padding: { xs: "7px 16px", sm: "8px 18px" },
          color: isSelected ? "#fff" : "var(--brand-primary)",
          backgroundColor: isSelected ? "var(--brand-primary)" : "transparent",
          borderColor: "var(--brand-primary)",
          borderRadius: "999px",
          whiteSpace: "nowrap",
          fontSize: { xs: "13px", sm: "14px" },
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
    <section className={styles.communityHeader}>
      <div className={styles.titleArea}>
        <h1 className={`font-display dtext-5xl ${styles.title_h1}`}>커뮤니티</h1>

        <p className={`text-m ${styles.title_p}`}>음식과 레시피를 중심으로 나누는 이야기.</p>
      </div>

      <div className={styles.categoryBar}>
        <div className={styles.category}>
          <div className={styles.categoryRow}>
            {categories.slice(0, 3).map(renderCategoryButton)}
          </div>

          <div className={styles.categoryRow}>{categories.slice(3).map(renderCategoryButton)}</div>
        </div>

        <Button
          type="button"
          variant="contained"
          startIcon={<EditOutlined />}
          className={styles.writeButton}
          onClick={onWrite}
          sx={{
            flexShrink: 0,
            color: "#fff",
            backgroundColor: "var(--brand-primary)",
            borderRadius: "999px",
            padding: { xs: "8px 16px", sm: "9px 18px" },
            whiteSpace: "nowrap",
            fontSize: { xs: "13px", sm: "14px" },
            boxShadow: "none",
            "&:hover": {
              backgroundColor: "var(--brand-primary-dark)",
              boxShadow: "none",
            },
            "& .MuiButton-startIcon": {
              marginRight: { xs: "4px", sm: "8px" },
            },
          }}
        >
          글쓰기
        </Button>
      </div>
    </section>
  );
}
