// 삭제 확인
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";

export default function ConfirmModal({
  open,
  title = "확인",
  message,
  confirmText = "확인",
  cancelText = "취소",
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onCancel}
      maxWidth={false}
      sx={{
        "& .MuiDialog-container": {
          padding: "16px",
        },

        "& .MuiDialog-paper": {
          width: "100%",
          maxWidth: "400px",
          margin: 0,

          borderRadius: "20px",

          boxShadow: "0 18px 50px rgba(64, 41, 31, 0.18)",
        },
      }}
    >
      <DialogTitle
        sx={{
          padding: "24px 24px 8px",

          color: "var(--brand-brown)",
          fontFamily: "var(--font-display)",
          fontSize: "20px",
          fontWeight: 600,
        }}
      >
        {title}
      </DialogTitle>

      <DialogContent
        sx={{
          padding: "8px 24px 20px !important",
        }}
      >
        <p
          style={{
            margin: 0,

            color: "#6b625e",
            fontFamily: "var(--font-body)",
            fontSize: "14px",
            lineHeight: 1.6,
          }}
        >
          {message}
        </p>
      </DialogContent>

      <DialogActions
        sx={{
          padding: "0 24px 24px",
          gap: "8px",
        }}
      >
        <Button
          type="button"
          onClick={onCancel}
          disabled={loading}
          sx={{
            minWidth: "84px",
            height: "42px",

            color: "var(--brand-brown)",
            backgroundColor: "var(--brand-cream)",

            borderRadius: "999px",

            fontFamily: "inherit",

            "&:hover": {
              backgroundColor: "var(--brand-beige)",
            },
          }}
        >
          {cancelText}
        </Button>

        <Button
          type="button"
          variant="contained"
          onClick={onConfirm}
          disabled={loading}
          sx={{
            minWidth: "92px",
            height: "42px",

            color: "#fff",
            backgroundColor: danger ? "#d94f27" : "var(--brand-primary)",

            borderRadius: "999px",

            fontFamily: "inherit",
            boxShadow: "none",

            "&:hover": {
              backgroundColor: danger ? "#bf4020" : "var(--brand-primary-dark)",
              boxShadow: "none",
            },
          }}
        >
          {loading ? "처리 중..." : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
