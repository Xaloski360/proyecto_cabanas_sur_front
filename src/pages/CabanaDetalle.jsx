// src/pages/CabanaDetalle.jsx
import { useEffect, useMemo, useState } from "react";
import {
  useParams,
  useSearchParams,
  useNavigate,
  Link,
} from "react-router-dom";
import { api, previewReserva, createReserva } from "../api";
import { toast } from "react-hot-toast";

export default function CabanaDetalle() {
  const { id } = useParams();
  const [qs] = useSearchParams();
  const navigate = useNavigate();

  // query params que vienen desde Disponibilidad
  const desde = qs.get("desde") || "";
  const hasta = qs.get("hasta") || "";
  const huespedes = Number(qs.get("huespedes") || 1);
  const reservarFlag = qs.get("reservar") === "1";

  const [cabana, setCabana] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [withPets, setWithPets] = useState(false);

  // cálculo opcional de noches
  const noches = useMemo(() => {
    if (!desde || !hasta) return null;
    const d1 = new Date(desde);
    const d2 = new Date(hasta);
    const diff = (d2 - d1) / (1000 * 60 * 60 * 24);
    return diff > 0 ? diff : null;
  }, [desde, hasta]);

  // cargar detalle de la cabaña
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const c = await api(`/api/cabanas/${id}`);
        setCabana(c);
      } catch (e) {
        console.error(e);
        setErr(e.message || "No se pudo cargar la cabaña.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // acción de reservar
  async function reservar() {
    if (saving) return;

    // 1) Validar fechas
    if (!desde || !hasta) {
      toast.error("Elige fechas válidas (desde / hasta) antes de reservar.");
      return;
    }

    // URL a la que volver después de registrarse / iniciar sesión
    const backTo = `/cabanas/${id}?desde=${encodeURIComponent(
      desde
    )}&hasta=${encodeURIComponent(
      hasta
    )}&huespedes=${encodeURIComponent(huespedes)}&reservar=1`;

    // 2) Si no hay token → enviar a REGISTRO con redirect
    const token =
      localStorage.getItem("auth_token") || localStorage.getItem("token");
    if (!token) {
      toast.error("Crea tu cuenta para continuar con la reserva.");
      navigate(`/register?redirect=${encodeURIComponent(backTo)}`);
      return;
    }

    try {
      setSaving(true);

      // 3) Confirmar sesión contra el back
      let me;
      try {
        me = await api("/api/me"); // api() ya manda el Bearer del localStorage
      } catch (e) {
        const msg = (e?.message || "").toLowerCase();
        if (msg.includes("unauthenticated") || msg.includes("401")) {
          // sesión caducada
          localStorage.removeItem("auth_token");
          localStorage.removeItem("token");
          toast.error("Sesión expirada. Inicia sesión para continuar.");
          navigate(`/login?redirect=${encodeURIComponent(backTo)}`);
          return;
        }
        throw e;
      }

      if (!me?.id) {
        // fallback defensivo
        localStorage.removeItem("auth_token");
        localStorage.removeItem("token");
        toast.error("Inicia sesión para continuar.");
        navigate(`/login?redirect=${encodeURIComponent(backTo)}`);
        return;
      }

      // 4) Payload base para preview y creación
      const payload = {
        cabana_id: cabana.id,
        fecha_inicio: desde,
        fecha_fin: hasta,
        cantidad_personas: huespedes,
        con_mascotas: withPets,
        // senia_monto: 0, // si más adelante lo quieres usar
      };

      // 5) Preview / validación de disponibilidad y tarifa
      try {
        const preview = await previewReserva(payload);
        if (!preview.disponible) {
          toast.error(
            preview.mensaje ||
              "La cabaña no está disponible en ese rango de fechas."
          );
          return;
        }
        // Podrías usar preview.noches, preview.monto_total, etc.
        // por ahora sólo validamos.
      } catch (e) {
        console.error("Error en preview de reserva:", e);
        // Si falla preview, dejamos que el store haga la validación de solape.
      }

      // 6) Crear la reserva real
      await createReserva(payload);

      toast.success("¡Reserva creada con éxito!");
      navigate("/cuenta", { replace: true });
    } catch (e) {
      console.error(e);
      const msg =
        (e?.message || "").includes("no está disponible") ||
        (e?.message || "").includes("no esta disponible")
          ? e.message
          : e?.message || "No se pudo crear la reserva.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  // ------------------- render -------------------

  if (loading) return <p className="p-6">Cargando cabaña…</p>;
  if (err) return <p className="p-6 text-red-600">{err}</p>;
  if (!cabana)
    return (
      <p className="p-6 text-red-600">No se encontró la cabaña solicitada.</p>
    );

  const imagenPrincipal =
    cabana.imagen_url && cabana.imagen_url.trim() !== ""
      ? cabana.imagen_url
      : "https://picsum.photos/seed/cabana/1200/500";

  const precioNoche = cabana.precio_noche ?? 0;
  const precioEstimado =
    noches && precioNoche ? noches * Number(precioNoche) : null;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {cabana.nombre}
          </h1>
          <p className="text-sm text-slate-500">
            Capacidad {cabana.capacidad} personas · Estado:{" "}
            <span className="font-medium">
              {cabana.estado === "disponible" ? "Disponible" : cabana.estado}
            </span>
            <br />
            Huéspedes seleccionados:{" "}
            <span className="font-semibold">{huespedes}</span>
          </p>
        </div>
        <Link
          to={-1}
          className="px-3 py-1.5 rounded border border-slate-300 text-sm hover:bg-slate-50"
        >
          ← Volver
        </Link>
      </div>

      {/* Layout principal */}
      <div className="grid md:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)] gap-6">
        {/* Columna imagen + descripción */}
        <div className="space-y-4">
          <div className="rounded-2xl overflow-hidden border">
            <img
              alt={`Cabaña ${cabana.nombre}`}
              className="w-full h-64 object-cover"
              src={imagenPrincipal}
            />
          </div>

          {cabana.descripcion && (
            <div className="bg-white border rounded-2xl p-4 text-sm text-slate-700 leading-relaxed">
              {cabana.descripcion}
            </div>
          )}
        </div>

        {/* Columna reserva */}
        <aside className="bg-white border rounded-2xl p-4 space-y-3">
          <div className="flex items-baseline justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Desde
              </p>
              <p className="text-lg font-semibold text-slate-900">
                ${precioNoche?.toLocaleString?.("es-CL") ?? precioNoche}
                <span className="text-xs text-slate-500 font-normal">
                  {" "}
                  / noche
                </span>
              </p>
            </div>

            {(desde || hasta) && (
              <p className="text-xs text-right text-slate-500">
                {desde || "¿?"} → {hasta || "¿?"}
                {noches && (
                  <>
                    <br />
                    <span className="font-medium">{noches}</span>{" "}
                    {noches === 1 ? "noche" : "noches"}
                  </>
                )}
              </p>
            )}
          </div>

          {precioEstimado && (
            <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
              Estimación base para tu estancia:{" "}
              <span className="font-semibold">
                ${precioEstimado.toLocaleString("es-CL")}
              </span>
              <br />
              <span className="text-[11px] text-emerald-800">
                El valor final se calcula dinámicamente al confirmar la
                reserva (temporadas, personas y mascotas).
              </span>
            </p>
          )}

          {/* Mascotas */}
          <label className="flex items-center gap-2 text-xs text-slate-700">
            <input
              type="checkbox"
              className="rounded border-slate-300"
              checked={withPets}
              onChange={(e) => setWithPets(e.target.checked)}
            />
            Viajo con mascota(s)
          </label>

          <button
            onClick={reservar}
            disabled={saving}
            aria-busy={saving}
            className={`w-full rounded-lg text-white font-semibold py-2 text-sm transition
              ${
                saving
                  ? "bg-emerald-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            title={saving ? "Reservando…" : "Reservar"}
          >
            {saving ? "Reservando…" : "Reservar ahora"}
          </button>

          {reservarFlag && (
            <p className="text-xs text-slate-500 mt-1">
              Estás a un paso de confirmar tu estadía. Revisa las fechas y
              confirma tu reserva.
            </p>
          )}

          {!desde || !hasta ? (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mt-2">
              Para ver la estimación de valor y reservar, vuelve a{" "}
              <Link
                to={`/disponibilidad?cabana=${id}`}
                className="underline font-medium"
              >
                Disponibilidad
              </Link>{" "}
              y elige un rango de fechas.
            </p>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
