// 성공/실패/경고 알림
import { Alert, Snackbar } from "@mui/material";

export default function Notification({
  open,
  message,
  severity = "success",
  onClose,
  autoHideDuration = 3000,
}) {
  function handleClose(event, reason) {
    if (reason === "clickaway") return;

    onClose();
  }

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={handleClose}
      anchorOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
      sx={{
        top: {
          xs: "76px !important",
          sm: "88px !important",
        },
      }}
    >
      <Alert
        onClose={handleClose}
        severity={severity}
        variant="filled"
        sx={{
          width: "100%",
          minWidth: {
            xs: "280px",
            sm: "340px",
          },

          maxWidth: "460px",

          alignItems: "center",

          borderRadius: "14px",
          boxShadow: "0 10px 30px rgba(64, 41, 31, 0.16)",

          fontFamily: "var(--font-body)",
          fontSize: "14px",

          "& .MuiAlert-icon": {
            alignItems: "center",
          },

          "& .MuiAlert-message": {
            display: "flex",
            alignItems: "center",
            padding: "5px 0",
          },
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
