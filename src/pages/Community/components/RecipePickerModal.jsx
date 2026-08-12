/**
 * 커뮤니티 연결 레시피 선택 모달
 * - Supabase에 등록된 레시피를 제목으로 검색
 * - 검색 결과의 레시피 정보 표시
 * - 선택한 레시피를 커뮤니티 게시글에 연결
 */
import { Dialog, IconButton, Skeleton, TextField } from "@mui/material";
import { Close } from "@mui/icons-material";

export default function RecipePickerModal({
  open,
  recipeSearch,
  setRecipeSearch,
  recipeResults,
  recipesLoading,
  onClose,
  onSelect,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      sx={{
        "& .MuiDialog-container": { padding: "16px" },
        "& .MuiDialog-paper": {
          width: "560px !important",
          height: "420px !important",
          minHeight: "420px !important",
          maxHeight: "420px !important",
          maxWidth: "calc(100vw - 32px) !important",
          margin: "0 !important",
          borderRadius: "18px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          padding: "18px 20px 10px",
          flex: "0 0 auto",
        }}
      >
        <div>
          <h3 style={{ margin: 0, color: "var(--brand-brown)", fontSize: "20px" }}>레시피 찾기</h3>
          <p style={{ margin: "4px 0 0", color: "var(--brand-gray)", fontSize: "13px" }}>
            등록된 모든 레시피 중에서 연결할 레시피를 선택해주세요.
          </p>
        </div>
        <IconButton
          type="button"
          onClick={onClose}
          aria-label="닫기"
          sx={{ mt: "-6px", mr: "-6px" }}
        >
          <Close />
        </IconButton>
      </div>

      <div style={{ padding: "0 20px 14px", flex: "0 0 auto" }}>
        <TextField
          fullWidth
          size="small"
          value={recipeSearch}
          onChange={event => setRecipeSearch(event.target.value)}
          placeholder="레시피 이름으로 검색"
          autoFocus
          sx={{
            "& .MuiOutlinedInput-root": {
              height: "42px",
              borderRadius: "14px",
              backgroundColor: "var(--brand-cream)",
              fontFamily: "inherit",
              "&.Mui-focused fieldset": { borderColor: "var(--brand-primary)" },
            },
          }}
        />
      </div>

      <div
        style={{
          height: "270px",
          minHeight: "270px",
          maxHeight: "270px",
          overflowY: "auto",
          overflowX: "hidden",
          padding: "0 20px 16px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          boxSizing: "border-box",
          flex: "0 0 270px",
        }}
      >
        {recipesLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Skeleton
              key={index}
              variant="rounded"
              height={72}
              sx={{ height: "72px", minHeight: "72px", borderRadius: "14px", flexShrink: 0 }}
            />
          ))
        ) : recipeResults.length > 0 ? (
          recipeResults.map(recipe => (
            <button
              key={recipe.id}
              type="button"
              onClick={() => onSelect(recipe)}
              style={{
                width: "100%",
                height: "72px",
                minHeight: "72px",
                maxHeight: "72px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px",
                border: "1px solid var(--brand-divider)",
                borderRadius: "14px",
                backgroundColor: "#fff",
                textAlign: "left",
                cursor: "pointer",
                fontFamily: "inherit",
                boxSizing: "border-box",
                flexShrink: 0,
              }}
            >
              {recipe.thumbnail_url ? (
                <img
                  src={recipe.thumbnail_url}
                  alt={recipe.title}
                  style={{
                    width: "52px",
                    height: "52px",
                    objectFit: "cover",
                    borderRadius: "10px",
                    flexShrink: 0,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "10px",
                    backgroundColor: "var(--brand-primary)",
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                    fontSize: "10px",
                    flexShrink: 0,
                  }}
                >
                  No Image
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong
                  style={{
                    display: "block",
                    color: "var(--brand-brown)",
                    fontSize: "14px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {recipe.title}
                </strong>
                <span
                  style={{
                    display: "block",
                    marginTop: "4px",
                    color: "var(--brand-gray)",
                    fontSize: "12px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {[recipe.cuisine, recipe.cooking_time, recipe.difficulty]
                    .filter(Boolean)
                    .join(" · ") || "레시피"}
                </span>
              </div>
            </button>
          ))
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--brand-gray)",
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            {recipeSearch.trim() ? "검색 결과가 없습니다." : "등록된 레시피가 없습니다."}
          </div>
        )}
      </div>
    </Dialog>
  );
}
