import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute() {
  const { auth } = useAuth();

  if (!auth.accessToken) {
    return <Navigate to="/auth" replace />;
  }
  return <Outlet />;
}
