// src/components/AdminRoute.jsx
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { fetchMe, getToken, clearToken } from "../api";

export default function AdminRoute() {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    async function check() {
      const token = getToken();
      const redirect = encodeURIComponent(
        location.pathname + location.search
      );

      // Si no hay token → mandar a login
      if (!token) {
        navigate(`/login?redirect=${redirect}`, { replace: true });
        return;
      }

      try {
        const me = await fetchMe();

        // roles puede venir como ["admin","usuario"] o como objetos
        const rawRoles =
          me?.roles ||
          me?.role_names || // por si en algún momento lo cambias
          [];

        const roleNames = Array.isArray(rawRoles)
          ? rawRoles.map((r) => (typeof r === "string" ? r : r.name))
          : [];

        if (roleNames.includes("admin")) {
          setAllowed(true);
        } else {
          // autenticado pero sin permiso → a su cuenta
          navigate("/cuenta", { replace: true });
        }
      } catch (e) {
        console.error("Error verificando rol admin:", e);
        clearToken();
        navigate(`/login?redirect=${redirect}`, { replace: true });
      } finally {
        setLoading(false);
      }
    }

    check();
  }, [navigate, location]);

  if (loading) {
    return (
      <div className="min-h-[200px] flex items-center justify-center text-sm text-slate-500">
        Verificando permisos…
      </div>
    );
  }

  if (!allowed) return null;

  return <Outlet />;
}
