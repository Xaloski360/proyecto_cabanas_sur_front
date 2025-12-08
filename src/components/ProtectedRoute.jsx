import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getToken } from "../api";

export default function ProtectedRoute() {
  const token = getToken();
  const location = useLocation();

  if (!token) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  return <Outlet />;
}
