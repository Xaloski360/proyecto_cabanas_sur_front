// src/pages/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  API_URL,
  getToken,
  fetchReservasAdmin, // helper admin
  fetchCabanas,
  createCabana,
  updateCabana,
  deleteCabana,
  fetchMe,
  logoutUser,
  validarPago,
} from "../api";

const emptyCabana = {
  id: null,
  nombre: "",
  descripcion: "",
  capacidad: "",
  precio_noche: "",
  estado: "disponible",
  imagen_url: "",
};

// Helper format moneda
const money = (value) => {
  if (value == null || Number.isNaN(Number(value))) return "$ 0";
  const n = Number(value);
  return `$ ${n.toLocaleString("es-CL")}`;
};

// Noches entre dos fechas
function diffNoches(desde, hasta) {
  const d1 = new Date(desde);
  const d2 = new Date(hasta);
  if (Number.isNaN(d1.getTime()) || Number.isNaN(d2.getTime())) return null;
  const ms = d2.getTime() - d1.getTime();
  const noches = Math.round(ms / (1000 * 60 * 60 * 24));
  return noches > 0 ? noches : 1;
}

// Badge para estado de pago
function getBadgePago(reserva) {
  const estado = reserva.estado_pago;

  if (!estado) {
    return <span className="text-[11px] text-slate-500">Sin comprobante</span>;
  }

  if (estado === "pendiente") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-amber-100 text-amber-800">
        En revisión
      </span>
    );
  }

  if (estado === "validado") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-emerald-100 text-emerald-800">
        Pago confirmado
      </span>
    );
  }

  // cualquier otro estado (ej: rechazado)
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-red-100 text-red-700">
      Rechazado
    </span>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [me, setMe] = useState(null);
  const [loadingMe, setLoadingMe] = useState(true);

  const [reservas, setReservas] = useState([]);
  const [loadingReservas, setLoadingReservas] = useState(false);

  const [cabanas, setCabanas] = useState([]);
  const [loadingCabanas, setLoadingCabanas] = useState(false);

  const [formCabana, setFormCabana] = useState(emptyCabana);
  const [savingCabana, setSavingCabana] = useState(false);
  const [validandoPagoId, setValidandoPagoId] = useState(null);

  // filtros para el PDF
  const [filtroDesde, setFiltroDesde] = useState("");
  const [filtroHasta, setFiltroHasta] = useState("");

  // modal de huéspedes
  const [reservaHuespedes, setReservaHuespedes] = useState(null);

  // -----------------------------
  // Cargar información inicial
  // -----------------------------
  useEffect(() => {
    (async () => {
      try {
        setLoadingMe(true);
        const user = await fetchMe();
        setMe(user);

        const roles = (user.roles || []).map((r) => r.name || r);
        if (!roles.includes("admin")) {
          toast.error("No tienes permisos de administrador.");
          navigate("/", { replace: true });
          return;
        }

        await Promise.all([loadReservas(), loadCabanas()]);
      } catch (e) {
        console.error(e);
        toast.error(e.message || "No se pudo cargar el panel.");
        navigate("/login?redirect=/admin", { replace: true });
      } finally {
        setLoadingMe(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadReservas() {
    try {
      setLoadingReservas(true);
      const data = await fetchReservasAdmin(); // todas las reservas con cabana, user, huespedes
      setReservas(Array.isArray(data) ? data : data.data || []);
    } catch (e) {
      console.error(e);
      toast.error(e.message || "No se pudieron cargar las reservas.");
    } finally {
      setLoadingReservas(false);
    }
  }

  async function loadCabanas() {
    try {
      setLoadingCabanas(true);
      const data = await fetchCabanas();
      setCabanas(Array.isArray(data) ? data : data.data || []);
    } catch (e) {
      console.error(e);
      toast.error(e.message || "No se pudieron cargar las cabañas.");
    } finally {
      setLoadingCabanas(false);
    }
  }

  // -----------------------------
  // Formulario de cabañas
  // -----------------------------
  function handleCabanaChange(e) {
    const { name, value } = e.target;
    setFormCabana((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleEditCabana(cabana) {
    setFormCabana({
      id: cabana.id,
      nombre: cabana.nombre || "",
      descripcion: cabana.descripcion || "",
      capacidad: cabana.capacidad?.toString() || "",
      precio_noche: cabana.precio_noche?.toString() || "",
      estado: cabana.estado || "disponible",
      imagen_url: cabana.imagen_url || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleResetForm() {
    setFormCabana(emptyCabana);
  }

  async function handleSubmitCabana(e) {
    e.preventDefault();
    if (savingCabana) return;

    try {
      setSavingCabana(true);

      const payload = {
        nombre: formCabana.nombre,
        descripcion: formCabana.descripcion,
        capacidad: Number(formCabana.capacidad),
        precio_noche: Number(formCabana.precio_noche),
        estado: formCabana.estado,
        imagen_url: formCabana.imagen_url || null,
      };

      if (!payload.nombre || !payload.capacidad || !payload.precio_noche) {
        toast.error("Nombre, capacidad y precio/noche son obligatorios.");
        return;
      }

      if (formCabana.id) {
        await updateCabana(formCabana.id, payload);
        toast.success("Cabaña actualizada.");
      } else {
        await createCabana(payload);
        toast.success("Cabaña creada.");
      }

      handleResetForm();
      await loadCabanas();
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Error al guardar la cabaña.");
    } finally {
      setSavingCabana(false);
    }
  }

  async function handleDeleteCabana(cabana) {
    if (!window.confirm(`¿Eliminar la cabaña "${cabana.nombre}"?`)) return;

    try {
      await deleteCabana(cabana.id);
      toast.success("Cabaña eliminada.");
      await loadCabanas();
    } catch (e) {
      console.error(e);
      toast.error(e.message || "No se pudo eliminar la cabaña.");
    }
  }

  async function handleLogout() {
    try {
      await logoutUser();
    } catch {
      // ignoramos error
    } finally {
      toast.success("Sesión cerrada.");
      navigate("/", { replace: true });
    }
  }

  // -----------------------------
  // Validar pago (admin)
  // -----------------------------
  async function handleValidarPago(reserva) {
    const pago = reserva.ultimo_pago;
    if (!pago) {
      toast.error("No hay comprobante para validar en esta reserva.");
      return;
    }

    if (!window.confirm("¿Confirmar el pago de esta reserva?")) return;

    try {
      setValidandoPagoId(pago.id);
      await validarPago(pago.id);
      toast.success("Pago validado y reserva actualizada.");
      await loadReservas();
    } catch (e) {
      console.error(e);
      toast.error(e.message || "No se pudo validar el pago.");
    } finally {
      setValidandoPagoId(null);
    }
  }

  // -----------------------------
  // Descarga de reporte PDF
  // -----------------------------
  function descargarReportePdf() {
    const params = new URLSearchParams();
    if (filtroDesde) params.append("desde", filtroDesde);
    if (filtroHasta) params.append("hasta", filtroHasta);

    fetch(`${API_URL}/api/reportes/ocupacion/pdf?${params.toString()}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("No se pudo generar el PDF");
        }
        return res.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "reporte_ocupacion.pdf";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        toast.success("Reporte PDF descargado.");
      })
      .catch((err) => {
        console.error(err);
        toast.error(err.message || "Error al descargar el reporte.");
      });
  }

  // -----------------------------
  // Modal huéspedes
  // -----------------------------
  function abrirHuespedes(reserva) {
    setReservaHuespedes(reserva);
  }

  function cerrarHuespedes() {
    setReservaHuespedes(null);
  }

  // -----------------------------
  // Render
  // -----------------------------
  if (loadingMe) {
    return <p className="p-6">Cargando panel de administración…</p>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      {/* Encabezado */}
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Panel de administración
          </h1>
          {me && (
            <p className="text-sm text-slate-500">
              Bienvenido(a), <span className="font-semibold">{me.name}</span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Link
            to="/"
            className="px-3 py-1.5 rounded border border-slate-300 hover:bg-slate-50"
          >
            Sitio público
          </Link>
          <Link
            to="/cuenta"
            className="px-3 py-1.5 rounded border border-slate-300 hover:bg-slate-50"
          >
            Mi cuenta
          </Link>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded bg-red-500 text-white hover:bg-red-600"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* Sección de reservas + PDF */}
      <section className="bg-white border rounded-2xl shadow-sm p-4 md:p-6">
        <div className="flex items-center justify-between mb-4 gap-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Reservas registradas
          </h2>
          {loadingReservas && (
            <span className="text-xs text-slate-500">Cargando…</span>
          )}
        </div>

        {/* Filtros y botón de PDF */}
        <div className="flex flex-wrap items-end gap-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Desde
            </label>
            <input
              type="date"
              value={filtroDesde}
              onChange={(e) => setFiltroDesde(e.target.value)}
              className="border rounded-md px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Hasta
            </label>
            <input
              type="date"
              value={filtroHasta}
              onChange={(e) => setFiltroHasta(e.target.value)}
              className="border rounded-md px-2 py-1 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={descargarReportePdf}
            className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
          >
            📄 Descargar reporte PDF
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border-t border-b">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left border-b text-slate-500">
                  #
                </th>
                <th className="px-3 py-2 text-left border-b text-slate-500">
                  Cabaña
                </th>
                <th className="px-3 py-2 text-left border-b text-slate-500">
                  Cliente
                </th>
                <th className="px-3 py-2 text-left border-b text-slate-500">
                  Huéspedes
                </th>
                <th className="px-3 py-2 text-left border-b text-slate-500">
                  Fechas
                </th>
                <th className="px-3 py-2 text-left border-b text-slate-500">
                  Estado
                </th>
                <th className="px-3 py-2 text-left border-b text-slate-500">
                  Pago
                </th>
              </tr>
            </thead>
            <tbody>
              {reservas.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-3 py-4 text-center text-slate-500"
                  >
                    No hay reservas registradas.
                  </td>
                </tr>
              )}

              {reservas.map((r, idx) => {
                const cabanaNombre = r.cabana?.nombre || `#${r.cabana_id}`;
                const clienteNombre = r.user?.name || `ID ${r.user_id}`;
                const clienteEmail = r.user?.email || "";
                const huespedes = Array.isArray(r.huespedes)
                  ? r.huespedes
                  : [];

                const inicio = r.fecha_inicio?.slice(0, 10) || "";
                const fin = r.fecha_fin?.slice(0, 10) || "";
                const noches = diffNoches(r.fecha_inicio, r.fecha_fin);
                const cantPersonas = r.cantidad_personas || 1;

                // montos
                const totalReserva =
                  typeof r.monto_total === "number"
                    ? r.monto_total
                    : noches && r.precio_noche
                    ? noches * r.precio_noche
                    : 0;

                // seña mínima sugerida (30% del total)
                const seniaSugerida =
                  totalReserva > 0 ? Math.round(totalReserva * 0.3) : 0;

                // Monto pagado:
                // - Si hay senia_monto guardada, usamos eso.
                // - Si hay monto en el último pago, usamos ese.
                // - Si no hay nada pero el pago está validado, asumimos al menos la seña sugerida (30%).
                let pagado = 0;

                if (r.estado_pago === "validado") {
                  if (typeof r.senia_monto === "number" && r.senia_monto > 0) {
                    pagado = r.senia_monto;
                  } else if (
                    r.ultimo_pago &&
                    typeof r.ultimo_pago.monto === "number" &&
                    r.ultimo_pago.monto > 0
                  ) {
                    pagado = r.ultimo_pago.monto;
                  } else {
                    // Fallback más realista: se asume que al menos se pagó la seña (30%)
                    pagado = seniaSugerida;
                  }
                }

                const saldo = Math.max(totalReserva - pagado, 0);
                const porcPagado =
                  totalReserva > 0
                    ? Math.round((pagado / totalReserva) * 100)
                    : 0;





                const estadoColor =
                  r.estado === "confirmada"
                    ? "bg-emerald-100 text-emerald-700"
                    : r.estado === "cancelada"
                    ? "bg-red-100 text-red-700"
                    : r.estado === "checkin"
                    ? "bg-blue-100 text-blue-700"
                    : r.estado === "pagada"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-slate-100 text-slate-700";

                return (
                  <tr key={r.id}>
                    <td className="px-3 py-2 border-b align-top text-slate-500">
                      {idx + 1}
                    </td>
                    <td className="px-3 py-2 border-b align-top">
                      <span className="font-medium text-slate-800">
                        {cabanaNombre}
                      </span>
                      {r.con_mascotas && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-100">
                          🐾 Con mascota(s)
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 border-b align-top text-slate-700">
                      {clienteNombre}
                      {clienteEmail && (
                        <div className="text-[11px] text-slate-400">
                          {clienteEmail}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 border-b align-top">
                      {huespedes.length === 0 ? (
                        <span className="text-[11px] text-slate-500">
                          Sin registro
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => abrirHuespedes(r)}
                          className="px-2 py-1 text-[11px] rounded border border-slate-300 text-slate-700 hover:bg-slate-50"
                        >
                          Ver ({huespedes.length})
                        </button>
                      )}
                    </td>
                    <td className="px-3 py-2 border-b align-top text-slate-700">
                      {inicio} → {fin}
                      {noches && (
                        <div className="text-[11px] text-slate-400">
                          {noches} noche{noches > 1 ? "s" : ""} ·{" "}
                          {cantPersonas} persona
                          {cantPersonas > 1 ? "s" : ""}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 border-b align-top">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${estadoColor}`}
                      >
                        {r.estado}
                      </span>
                    </td>
                    <td className="px-3 py-2 border-b align-top">
                      <div className="flex flex-col gap-1 text-xs">
                        {getBadgePago(r)}

                        <div className="mt-1 space-y-0.5">
                          <div>
                            Total:{" "}
                            <span className="font-semibold">
                              {money(totalReserva)}
                            </span>
                          </div>
                          <div>
                            Pagado:{" "}
                            <span className="font-semibold">
                              {money(pagado)}
                            </span>
                            {totalReserva > 0 && (
                              <span className="text-[11px] text-slate-500">
                                {" "}
                                ({porcPagado}%)
                              </span>
                            )}
                          </div>
                          <div>
                            Saldo:{" "}
                            <span className="font-semibold text-amber-700">
                              {money(saldo)}
                            </span>
                          </div>
                        </div>

                        {r.ultimo_pago?.archivo_url && (
                          <a
                            href={r.ultimo_pago.archivo_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-blue-600 underline"
                          >
                            Ver comprobante
                          </a>
                        )}

                        {r.estado_pago === "pendiente" && r.ultimo_pago && (
                          <button
                            type="button"
                            onClick={() => handleValidarPago(r)}
                            disabled={validandoPagoId === r.ultimo_pago.id}
                            className="mt-1 px-2 py-0.5 text-[11px] rounded border border-emerald-500 text-emerald-700 hover:bg-emerald-50 disabled:opacity-60"
                          >
                            {validandoPagoId === r.ultimo_pago.id
                              ? "Validando…"
                              : "Confirmar pago"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Sección de cabañas */}
      <section className="bg-white border rounded-2xl shadow-sm p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Gestión de cabañas
          </h2>
          {loadingCabanas && (
            <span className="text-xs text-slate-500">Cargando…</span>
          )}
        </div>

        {/* Formulario */}
        <form
          onSubmit={handleSubmitCabana}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">
              Nombre
            </label>
            <input
              type="text"
              name="nombre"
              value={formCabana.nombre}
              onChange={handleCabanaChange}
              className="border rounded-md px-3 py-2 text-sm"
              placeholder="Ej: Osiris"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">
              Capacidad
            </label>
            <input
              type="number"
              name="capacidad"
              value={formCabana.capacidad}
              onChange={handleCabanaChange}
              className="border rounded-md px-3 py-2 text-sm"
              min={1}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">
              Precio / noche
            </label>
            <input
              type="number"
              name="precio_noche"
              value={formCabana.precio_noche}
              onChange={handleCabanaChange}
              className="border rounded-md px-3 py-2 text-sm"
              min={0}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">
              Estado
            </label>
            <select
              name="estado"
              value={formCabana.estado}
              onChange={handleCabanaChange}
              className="border rounded-md px-3 py-2 text-sm"
            >
              <option value="disponible">Disponible</option>
              <option value="ocupado">Ocupado</option>
              <option value="mantenimiento">En mantenimiento</option>
            </select>
          </div>

          <div className="flex flex-col gap-1 md:col-span-2 lg:col-span-3">
            <label className="text-sm font-medium text-slate-700">
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={formCabana.descripcion}
              onChange={handleCabanaChange}
              className="border rounded-md px-3 py-2 text-sm min-h-[60px]"
              placeholder="Describe brevemente la cabaña, comodidades, etc."
            />
          </div>

          <div className="flex flex-col gap-1 md:col-span-2 lg:col-span-3">
            <label className="text-sm font-medium text-slate-700">
              URL imagen principal
            </label>
            <input
              type="text"
              name="imagen_url"
              value={formCabana.imagen_url}
              onChange={handleCabanaChange}
              className="border rounded-md px-3 py-2 text-sm"
              placeholder="https://tuservidor.com/imagenes/osiris.jpg"
            />
            <p className="text-xs text-slate-500">
              Pega aquí la URL de la imagen principal de la cabaña. Se mostrará
              en el detalle y en las tarjetas públicas.
            </p>
          </div>

          <div className="flex items-end gap-2 md:col-span-2 lg:col-span-3">
            <button
              type="submit"
              disabled={savingCabana}
              className="px-4 py-2 rounded-md bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60"
            >
              {savingCabana
                ? "Guardando…"
                : formCabana.id
                ? "Actualizar cabaña"
                : "Crear cabaña"}
            </button>
            {formCabana.id && (
              <button
                type="button"
                onClick={handleResetForm}
                className="px-3 py-2 rounded-md border border-slate-300 text-sm hover:bg-slate-50"
              >
                Cancelar edición
              </button>
            )}
          </div>
        </form>

        {/* Tabla de cabañas */}
        <div className="border-t pt-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">
            Cabañas registradas
          </h3>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border-t border-b">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left border-b text-slate-500">
                    #
                  </th>
                  <th className="px-3 py-2 text-left border-b text-slate-500">
                    Cabaña
                  </th>
                  <th className="px-3 py-2 text-left border-b text-slate-500">
                    Capacidad
                  </th>
                  <th className="px-3 py-2 text-left border-b text-slate-500">
                    Precio / noche
                  </th>
                  <th className="px-3 py-2 text-left border-b text-slate-500">
                    Estado
                  </th>
                  <th className="px-3 py-2 text-left border-b text-slate-500">
                    Imagen
                  </th>
                  <th className="px-3 py-2 text-left border-b text-slate-500">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {cabanas.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-3 py-4 text-center text-slate-500"
                    >
                      No hay cabañas registradas.
                    </td>
                  </tr>
                )}

                {cabanas.map((c, idx) => {
                  const estadoColor =
                    c.estado === "disponible"
                      ? "bg-emerald-100 text-emerald-700"
                      : c.estado === "ocupado"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-amber-100 text-amber-700";

                  const thumb =
                    c.imagen_url && c.imagen_url.trim() !== ""
                      ? c.imagen_url
                      : "https://picsum.photos/seed/cabana-thumb/120/80";

                  return (
                    <tr key={c.id}>
                      <td className="px-3 py-2 border-b align-top text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="px-3 py-2 border-b align-top">
                        <div className="font-medium text-slate-800">
                          {c.nombre}
                        </div>
                        <div className="text-xs text-slate-500 max-w-xs">
                          {c.descripcion}
                        </div>
                      </td>
                      <td className="px-3 py-2 border-b align-top text-slate-700">
                        {c.capacidad}
                      </td>
                      <td className="px-3 py-2 border-b align-top text-slate-700">
                        {money(c.precio_noche)}
                      </td>
                      <td className="px-3 py-2 border-b align-top">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${estadoColor}`}
                        >
                          {c.estado}
                        </span>
                      </td>
                      <td className="px-3 py-2 border-b align-top">
                        <img
                          src={thumb}
                          alt={`Miniatura ${c.nombre}`}
                          className="w-20 h-14 object-cover rounded border"
                        />
                      </td>
                      <td className="px-3 py-2 border-b align-top">
                        <div className="flex flex-wrap gap-1">
                          <button
                            type="button"
                            onClick={() => handleEditCabana(c)}
                            className="px-2 py-1 text-xs rounded border border-slate-300 hover:bg-slate-50"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCabana(c)}
                            className="px-2 py-1 text-xs rounded border border-red-300 text-red-600 hover:bg-red-50"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* MODAL HUÉSPEDES */}
      {reservaHuespedes && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full mx-4 p-6 relative">
            <button
              onClick={cerrarHuespedes}
              className="absolute top-3 right-3 text-slate-500 hover:text-slate-800 text-lg"
            >
              ×
            </button>

            <h3 className="text-lg font-semibold text-slate-900 mb-3">
              Huéspedes de la reserva #{reservaHuespedes.id}
            </h3>

            {(() => {
              const hs = Array.isArray(reservaHuespedes.huespedes)
                ? reservaHuespedes.huespedes
                : [];

              if (hs.length === 0) {
                return (
                  <p className="text-sm text-slate-500">
                    No hay huéspedes registrados para esta reserva.
                  </p>
                );
              }

              return (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm border-t border-b">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-3 py-2 text-left border-b text-slate-500">
                          Nombre
                        </th>
                        <th className="px-3 py-2 text-left border-b text-slate-500">
                          RUT / Doc.
                        </th>
                        <th className="px-3 py-2 text-left border-b text-slate-500">
                          Teléfono
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {hs.map((h) => {
                        const nombre =
                          h.nombre || h.nombre_completo || h.full_name || "-";
                        const rut =
                          h.rut ||
                          h.documento ||
                          h.documento_identidad ||
                          "—";
                        const telefono =
                          h.telefono || h.phone || h.celular || "—";

                        return (
                          <tr key={h.id || `${nombre}-${rut}`}>
                            <td className="px-3 py-2 border-b">{nombre}</td>
                            <td className="px-3 py-2 border-b">{rut}</td>
                            <td className="px-3 py-2 border-b">{telefono}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })()}

            <div className="mt-4 flex justify-end">
              <button
                onClick={cerrarHuespedes}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
