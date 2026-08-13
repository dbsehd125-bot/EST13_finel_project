// 전역 success / error / warning / info
import { createContext, useContext, useState } from "react";
import { Alert, Snackbar } from "@mui/material";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  function showNotification(message, severity = "success") {
    setNotification({
      open: true,
      message,
      severity,
    });
  }

  function closeNotification(event, reason) {
    if (reason === "clickaway") return;

    setNotification(previous => ({
      ...previous,
      open: false,
    }));
  }

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}

      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={closeNotification}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{
          top: {
            xs: "76px !important",
            sm: "88px !important",
          },
        }}
      >
        <Alert
          onClose={closeNotification}
          severity={notification.severity}
          variant="filled"
          elevation={6}
          sx={{
            width: "100%",
            minWidth: {
              xs: "calc(100vw - 32px)",
              sm: "340px",
            },
            maxWidth: "480px",
            borderRadius: "16px",
            fontFamily: "var(--font-body)",
            fontSize: "14px",
            alignItems: "center",
            boxShadow: "0 12px 32px rgba(64, 41, 31, 0.18)",
            "&.MuiAlert-filledSuccess": {
              backgroundColor: "var(--brand-primary)",
            },
            "&.MuiAlert-filledInfo": {
              backgroundColor: "var(--brand-brown)",
            },
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error("useNotification은 NotificationProvider 내부에서 사용해야 합니다.");
  }

  return context;
}
