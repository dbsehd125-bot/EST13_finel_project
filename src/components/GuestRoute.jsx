import { Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";

export default function GuestRoute({ children }) {
  const { isLoggedIn, authLoading } = useAuth();

  if (authLoading) {
    return null;
  }

  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return children;
}
