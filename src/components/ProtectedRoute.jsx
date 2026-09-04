import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute() {
  const { auth } = useAuth();
  const location = useLocation();

  if (!auth.accessToken) {
    // 로그인 후 원래 가려던 화면으로 돌아오도록 경로를 넘긴다.
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}
