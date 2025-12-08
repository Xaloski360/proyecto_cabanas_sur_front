// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { loginUser } from "../api";
import { toast } from "react-hot-toast";

export default function Login() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const redirectParam = params.get("redirect"); // puede venir desde ProtectedRoute

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const data = await loginUser(form);
      // data viene desde /api/login:
      // { message, token, user, roles }

      const user = data.user;
      const roles = data.roles || [];

      // guardamos info útil para el front
      if (user?.id) {
        localStorage.setItem("user_id", String(user.id));
      }
      localStorage.setItem("user_roles", JSON.stringify(roles));

      toast.success("Sesión iniciada 👌");

      // 1) Si venía un redirect explícito (por ejemplo al reservar)
      if (redirectParam) {
        navigate(redirectParam, { replace: true });
        return;
      }

      // 2) Si no hay redirect, decidimos según el rol
      if (roles.includes("admin")) {
        navigate("/admin", { replace: true });
      } else if (roles.includes("recepcionista")) {
        // si más adelante quieres un panel separado:
        // navigate("/recepcion", { replace: true });
        navigate("/admin", { replace: true }); // por ahora, mismo panel que admin
      } else {
        // rol "usuario" u otro → dashboard de usuario
        navigate("/cuenta", { replace: true });
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "No se pudo iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-semibold text-emerald-900 mb-6 text-center">
          Iniciar sesión
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Correo</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-md transition-colors disabled:opacity-60"
          >
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>

        <p className="mt-4 text-sm text-center">
          ¿No tienes cuenta?{" "}
          <Link
            to={`/register${
              redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : ""
            }`}
            className="text-emerald-700 font-medium hover:underline"
          >
            Crear cuenta
          </Link>
        </p>
      </div>
    </div>
  );
}

