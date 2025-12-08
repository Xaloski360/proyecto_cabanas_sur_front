// src/pages/Account.jsx
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchMisReservas,
  cancelarReserva,
  updateReserva,
  fetchMe,
  logoutUser,
  clearToken,
  subirComprobantePago,
} from "../api";
import { toast } from "react-hot-toast";
import GuestManager from "../components/GuestManager";

function formatDate(d) {
  if (!d) return "";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return d;
  return date.toLocaleDateString("es-CL", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function toInputDate(d) {
  if (!d) return "";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function diffNoches(desde, hasta) {
  const d1 = new Date(desde);
  const d2 = new Date(hasta);
  if (Number.isNaN(d1.getTime()) || Number.isNaN(d2.getTime())) return null;
  const ms = d2.getTime() - d1.getTime();
  const noches = Math.round(ms / (1000 * 60 * 60 * 24));
  return noches > 0 ? noches : 1;
}

// helper para CLP
function formatCLP(value) {
  if (value == null) return "0";
  const num = Number(value) || 0;
  return num.toLocaleString("es-CL");
}

// Estado visual unificado (usa estado + estado_pago)
function getEstadoVisual(reserva) {
  const estado = reserva.estado;
  const pago = reserva.estado_pago;

  if (pago === "pendiente") {
    return {
      texto: "En revisión",
      badgeClass: "bg-amber-100 text-amber-800",
    };
  }

  if (pago === "validado") {
    return {
      texto: "Confirmada",
      badgeClass: "bg-emerald-100 text-emerald-800",
    };
  }

  if (estado === "pendiente") {
    return {
      texto: "Pendiente de pago",
      badgeClass: "bg-slate-100 text-slate-700",
    };
  }

  if (estado === "cancelada") {
    return {
      texto: "Cancelada",
      badgeClass: "bg-red-100 text-red-700",
    };
  }

  return {
    texto: estado || "Pendiente",
    badgeClass: "bg-slate-100 text-slate-700",
  };
}

export default function Account() {
  const [user, setUser] = useState(null);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [cancelingId, setCancelingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editDesde, setEditDesde] = useState("");
  const [editHasta, setEditHasta] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const [detalleReserva, setDetalleReserva] = useState(null);

  // filtros historial
  const [histEstadoFilter, setHistEstadoFilter] = useState("todos");
  const [histYearFilter, setHistYearFilter] = useState("todos");

  // pago / comprobante
  const [referenciasPago, setReferenciasPago] = useState({});
  const [archivosPago, setArchivosPago] = useState({});
  const [subiendoPagoId, setSubiendoPagoId] = useState(null);

  const navigate = useNavigate();

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [me, res] = await Promise.all([
        fetchMe().catch(() => null),
        fetchMisReservas(),
      ]);

      setUser(me);
      setReservas(Array.isArray(res) ? res : []);
    } catch (e) {
      console.error(e);
      setError(e.message || "No se pudo cargar tu información.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Redirigir a /admin si el usuario tiene rol admin
  useEffect(() => {
    if (!user) return;

    const roles = (user.roles || []).map((r) => r.name || r);
    if (roles.includes("admin")) {
      navigate("/admin", { replace: true });
    }
  }, [user, navigate]);

  async function handleCancelar(id) {
    if (!window.confirm("¿Seguro que deseas cancelar esta reserva?")) return;
    setCancelingId(id);
    try {
      await cancelarReserva(id);
      toast.success("Reserva cancelada.");
      await loadData();
    } catch (e) {
      console.error(e);
      toast.error(e.message || "No se pudo cancelar la reserva.");
    } finally {
      setCancelingId(null);
    }
  }

  function startEdit(reserva) {
    setEditingId(reserva.id);
    setEditDesde(toInputDate(reserva.fecha_inicio));
    setEditHasta(toInputDate(reserva.fecha_fin));
  }

  function cancelEdit() {
    setEditingId(null);
    setEditDesde("");
    setEditHasta("");
  }

  async function saveEdit(reserva) {
    if (!editDesde || !editHasta) {
      toast.error("Debes seleccionar ambas fechas.");
      return;
    }

    const d1 = new Date(editDesde);
    const d2 = new Date(editHasta);
    if (d2 <= d1) {
      toast.error("La fecha de término debe ser posterior a la de inicio.");
      return;
    }

    setSavingEdit(true);
    try {
      await updateReserva(reserva.id, {
        fecha_inicio: editDesde,
        fecha_fin: editHasta,
      });
      toast.success("Reserva actualizada.");
      await loadData();
      cancelEdit();
    } catch (e) {
      console.error(e);
      toast.error(e.message || "No se pudo actualizar la reserva.");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleLogout() {
    try {
      await logoutUser();
    } catch (e) {
      console.error(e);
    } finally {
      clearToken();
      localStorage.removeItem("user_id");
      localStorage.removeItem("user_roles");
      navigate("/", { replace: true });
    }
  }

  function handleComprobante() {
    toast("Descarga de comprobante disponible en la siguiente versión.", {
      icon: "📄",
    });
  }

  function handleDetalle(reserva) {
    setDetalleReserva(reserva);
  }

  function handleCloseDetalle() {
    setDetalleReserva(null);
  }

  function handleRebook(reserva) {
    const cabanaId = reserva.cabana_id || reserva.cabana?.id;
    if (!cabanaId) {
      toast.error("No se pudo identificar la cabaña para re-reservar.");
      return;
    }

    const desde = toInputDate(reserva.fecha_inicio) || "";
    const hasta = toInputDate(reserva.fecha_fin) || "";
    const url = `/cabanas/${cabanaId}?desde=${encodeURIComponent(
      desde
    )}&hasta=${encodeURIComponent(hasta)}&huespedes=2&reservar=1`;

    navigate(url);
  }

  // comprobante: handlers
  function handleReferenciaChange(reservaId, value) {
    setReferenciasPago((prev) => ({
      ...prev,
      [reservaId]: value,
    }));
  }

  function handleArchivoChange(reservaId, file) {
    setArchivosPago((prev) => ({
      ...prev,
      [reservaId]: file || null,
    }));
  }

  async function handleUploadComprobante(reserva) {
    const reservaId = reserva.id;
    const file = archivosPago[reservaId];

    if (!file) {
      toast.error("Selecciona un archivo de comprobante.");
      return;
    }

    const referencia = referenciasPago[reservaId] || "";

    const formData = new FormData();
    formData.append("reserva_id", Number(reservaId));
    formData.append("referencia", referencia);
    formData.append("archivo", file);

    try {
      setSubiendoPagoId(reservaId);
      await subirComprobantePago(formData);
      toast.success("Comprobante enviado. Lo revisaremos a la brevedad.");
      await loadData();
      setArchivosPago((prev) => ({
        ...prev,
        [reservaId]: null,
      }));
    } catch (e) {
      console.error(e);
      toast.error(e.message || "No se pudo subir el comprobante.");
    } finally {
      setSubiendoPagoId(null);
    }
  }

  const today = new Date();

  const proximas = reservas.filter(
    (r) => new Date(r.fecha_fin) >= today && r.estado !== "cancelada"
  );
  const historial = reservas.filter(
    (r) => new Date(r.fecha_fin) < today || r.estado === "cancelada"
  );

  const hasReservas = reservas.length > 0;

  const histYears = useMemo(() => {
    const years = new Set();
    historial.forEach((r) => {
      const d = new Date(r.fecha_inicio || r.fecha_fin);
      if (!Number.isNaN(d.getTime())) years.add(d.getFullYear());
    });
    return Array.from(years).sort();
  }, [historial]);

  const historialFiltrado = useMemo(
    () =>
      historial.filter((r) => {
        if (histEstadoFilter !== "todos" && r.estado !== histEstadoFilter) {
          return false;
        }
        if (histYearFilter !== "todos") {
          const d = new Date(r.fecha_inicio || r.fecha_fin);
          if (Number.isNaN(d.getTime())) return false;
          if (d.getFullYear().toString() !== histYearFilter) return false;
        }
        return true;
      }),
    [historial, histEstadoFilter, histYearFilter]
  );

  return (
    <div className="min-h-screen bg-emerald-50 py-8 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-emerald-900">
              Mi cuenta
            </h1>
            {user && (
              <p className="text-sm text-slate-500">
                Bienvenido(a),{" "}
                <span className="font-medium">{user.name}</span>
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50"
            >
              Ir al inicio
            </button>
            <button
              onClick={() => navigate("/disponibilidad")}
              className="px-4 py-2 rounded-lg border border-emerald-500 text-emerald-700 text-sm font-medium hover:bg-emerald-50"
            >
              Buscar cabañas disponibles
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg font-medium"
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* Bloque de datos de transferencia */}
        <section className="mb-6 bg-sky-50 border border-sky-100 rounded-2xl p-4 md:p-5">
          <h2 className="text-sm font-semibold text-sky-900 mb-2">
            Cómo pagar tu reserva
          </h2>
          <p className="text-xs text-sky-900 mb-2">
            Realiza una transferencia bancaria usando estos datos. Luego, sube
            el comprobante en la reserva correspondiente para que podamos
            validarlo y confirmar tu pago.
          </p>
          <div className="grid gap-2 text-xs text-sky-950 md:grid-cols-2">
            <div>
              <p>
                <span className="font-semibold">Banco:</span> Banco de Chile
              </p>
              <p>
                <span className="font-semibold">Tipo de cuenta:</span> Cuenta
                Corriente
              </p>
              <p>
                <span className="font-semibold">N° de cuenta:</span> 12-345-6789
              </p>
            </div>
            <div>
              <p>
                <span className="font-semibold">Titular:</span> Cabañas del Sur
                Austral SpA
              </p>
              <p>
                <span className="font-semibold">RUT:</span> 76.123.456-7
              </p>
              <p>
                <span className="font-semibold">Correo:</span>{" "}
                pagos@cabanasdelsur.cl
              </p>
            </div>
          </div>
          <p className="mt-2 text-xs text-sky-900">
            Asunto sugerido en el correo:{" "}
            <span className="font-mono">
              Pago reserva #{`{ID_RESERVA}`} - {user?.name || "Cliente"}
            </span>
          </p>
        </section>

        {loading && <p>Cargando tu información…</p>}
        {error && (
          <p className="text-red-600 mb-4 bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-sm">
            {error}
          </p>
        )}

        {!loading && !hasReservas && !error && (
          <div className="border border-dashed rounded-xl p-6 text-center text-slate-500">
            <p className="mb-2 font-medium">
              Aún no tienes reservas registradas.
            </p>
            <p className="text-sm mb-3">
              Explora nuestras cabañas y vive tu próxima estadía en el Sur
              Austral.
            </p>
            <button
              onClick={() => navigate("/disponibilidad")}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"
            >
              Ver disponibilidad
            </button>
          </div>
        )}

        {/* Próximas reservas */}
        {!loading && proximas.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-emerald-900 mb-3">
              Próximas estadías
            </h2>
            <div className="space-y-4">
              {proximas.map((reserva) => {
                const inicio = formatDate(reserva.fecha_inicio);
                const fin = formatDate(reserva.fecha_fin);
                const nombreCabana = reserva.cabana?.nombre || "Cabaña";
                const isEditing = editingId === reserva.id;
                const noches = diffNoches(
                  reserva.fecha_inicio,
                  reserva.fecha_fin
                );

                // precio y total dinámicos desde la reserva
                const precioNoche =
                  reserva.precio_noche ??
                  reserva.cabana?.precio_noche ??
                  reserva.cabana?.precio ??
                  null;

                const total =
                  reserva.monto_total ??
                  (noches && precioNoche ? noches * precioNoche : null);

                const seniaMinima = total ? Math.round(total * 0.3) : null;

                const pagado = reserva.senia_monto ?? 0;
                const saldo =
                  total != null ? Math.max(total - pagado, 0) : null;
                const porcentajePagado =
                  total && total > 0
                    ? Math.round((pagado / total) * 100)
                    : null;

                const estadoVisual = getEstadoVisual(reserva);
                const pagoBloqueado =
                  reserva.estado_pago === "pendiente" ||
                  reserva.estado_pago === "validado";

                // badges de personas / mascotas
                const cantidadPersonas =
                  reserva.cantidad_personas ??
                  (Array.isArray(reserva.huespedes)
                    ? reserva.huespedes.length
                    : null);
                const conMascotas = !!reserva.con_mascotas;

                return (
                  <div
                    key={reserva.id}
                    className="border rounded-xl p-4 flex flex-col gap-4 bg-white shadow-sm"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <p className="font-semibold text-emerald-800">
                            {nombreCabana}
                          </p>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${estadoVisual.badgeClass}`}
                          >
                            {estadoVisual.texto}
                          </span>

                          {cantidadPersonas && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                              {cantidadPersonas}{" "}
                              {cantidadPersonas === 1
                                ? "persona"
                                : "personas"}
                            </span>
                          )}

                          {conMascotas && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-800">
                              Con mascota(s)
                            </span>
                          )}
                        </div>

                        {!isEditing && (
                          <>
                            <p className="text-sm text-slate-600">
                              {inicio} → {fin}
                              {noches && (
                                <span className="ml-1 text-xs text-slate-500">
                                  ({noches} noche{noches > 1 ? "s" : ""})
                                </span>
                              )}
                            </p>

                            {total !== null ? (
                              <>
                                <p className="text-xs mt-1 text-slate-700">
                                  Total de la reserva:{" "}
                                  <span className="font-semibold">
                                    ${formatCLP(total)}
                                  </span>{" "}
                                  {precioNoche && (
                                    <span className="text-[11px] text-slate-500">
                                      · ${formatCLP(precioNoche)} por noche
                                    </span>
                                  )}
                                </p>
                                {seniaMinima !== null && (
                                  <p className="text-xs mt-1 text-emerald-700">
                                    Valor mínimo sugerido (30%):{" "}
                                    <span className="font-semibold">
                                      ${formatCLP(seniaMinima)}
                                    </span>
                                  </p>
                                )}
                                <p className="text-xs mt-1 text-slate-700">
                                  Pagado:{" "}
                                  <span className="font-semibold">
                                    ${formatCLP(pagado)}
                                  </span>
                                  {porcentajePagado != null && (
                                    <span className="text-[11px] text-slate-500">
                                      {" "}
                                      ({porcentajePagado}%)
                                    </span>
                                  )}
                                  {saldo != null && (
                                    <>
                                      {" "}
                                      · Saldo:{" "}
                                      <span className="font-semibold">
                                        ${formatCLP(saldo)}
                                      </span>
                                    </>
                                  )}
                                </p>
                              </>
                            ) : (
                              <p className="text-xs mt-1 text-slate-500">
                                Valor estimado no disponible para esta reserva.
                              </p>
                            )}
                          </>
                        )}

                        {isEditing && (
                          <div className="mt-2 space-y-1 text-sm bg-blue-50 p-3 rounded-lg border border-blue-100">
                            <div className="flex flex-col sm:flex-row gap-2">
                              <label className="flex flex-col text-xs text-slate-600">
                                Desde
                                <input
                                  type="date"
                                  value={editDesde}
                                  onChange={(e) => setEditDesde(e.target.value)}
                                  className="border rounded-md px-2 py-1 text-sm"
                                />
                              </label>
                              <label className="flex flex-col text-xs text-slate-600">
                                Hasta
                                <input
                                  type="date"
                                  value={editHasta}
                                  onChange={(e) => setEditHasta(e.target.value)}
                                  className="border rounded-md px-2 py-1 text-sm"
                                />
                              </label>
                            </div>
                            <p className="text-[11px] text-slate-500">
                              Puedes ajustar las fechas según disponibilidad del
                              sistema.
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-3 md:w-80 shrink-0">
                        <div className="flex flex-wrap gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => handleDetalle(reserva)}
                            className="px-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                          >
                            Ver detalle
                          </button>

                          <button
                            type="button"
                            onClick={handleComprobante}
                            className="px-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                          >
                            Descargar comprobante
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRebook(reserva)}
                            className="px-3 py-1.5 text-xs sm:text-sm rounded-lg border border-emerald-500 text-emerald-700 hover:bg-emerald-50"
                          >
                            Reservar nuevamente
                          </button>

                          {!isEditing && (
                            <button
                              onClick={() => startEdit(reserva)}
                              className="px-3 py-1.5 text-xs sm:text-sm rounded-lg border border-blue-500 text-blue-600 hover:bg-blue-50"
                            >
                              Cambiar fechas
                            </button>
                          )}

                          {isEditing && (
                            <>
                              <button
                                onClick={() => saveEdit(reserva)}
                                disabled={savingEdit}
                                className="px-3 py-1.5 text-xs sm:text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                              >
                                {savingEdit ? "Guardando…" : "Guardar cambios"}
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="px-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50"
                              >
                                Cancelar
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => handleCancelar(reserva.id)}
                            disabled={cancelingId === reserva.id}
                            className="px-3 py-1.5 text-xs sm:text-sm rounded-lg border border-red-500 text-red-600 hover:bg-red-50 disabled:opacity-60"
                          >
                            {cancelingId === reserva.id
                              ? "Cancelando…"
                              : "Cancelar reserva"}
                          </button>
                        </div>

                        <div className="border border-dashed rounded-xl px-3 py-3 bg-emerald-50/60 w-full">
                          <p className="text-xs font-semibold text-emerald-900 mb-2">
                            Comprobante de pago
                          </p>

                          <div className="flex flex-col gap-2">
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              disabled={pagoBloqueado}
                              onChange={(e) =>
                                handleArchivoChange(
                                  reserva.id,
                                  e.target.files?.[0] || null
                                )
                              }
                              className="text-xs w-full"
                            />

                            <input
                              type="text"
                              className="w-full border rounded-md px-2 py-1 text-xs"
                              placeholder="Referencia (opcional)"
                              disabled={pagoBloqueado}
                              value={referenciasPago[reserva.id] || ""}
                              onChange={(e) =>
                                handleReferenciaChange(
                                  reserva.id,
                                  e.target.value
                                )
                              }
                            />

                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() => handleUploadComprobante(reserva)}
                                disabled={
                                  subiendoPagoId === reserva.id || pagoBloqueado
                                }
                                className="px-3 py-1.5 text-xs rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 whitespace-nowrap"
                              >
                                {subiendoPagoId === reserva.id
                                  ? "Subiendo…"
                                  : pagoBloqueado
                                  ? "Pago listo"
                                  : "Subir comprobante"}
                              </button>
                            </div>
                          </div>

                          <p className="mt-1 text-[11px] text-emerald-700">
                            {reserva.estado_pago === "pendiente" &&
                              "Tu comprobante fue enviado y está en revisión."}
                            {reserva.estado_pago === "validado" &&
                              "Pago confirmado. Gracias."}
                            {!reserva.estado_pago &&
                              "Formatos permitidos: JPG, PNG o PDF. Máx. 5 MB."}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2">
                      <GuestManager reserva={reserva} onUpdate={loadData} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Historial */}
        {!loading && historial.length > 0 && (
          <section>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
              <h2 className="text-lg font-semibold text-slate-800">
                Historial de reservas
              </h2>
              <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
                <select
                  value={histEstadoFilter}
                  onChange={(e) => setHistEstadoFilter(e.target.value)}
                  className="border rounded-md px-2 py-1"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="confirmada">Confirmadas</option>
                  <option value="pendiente">Pendientes</option>
                  <option value="checkin">Check-in</option>
                  <option value="checkout">Check-out</option>
                  <option value="pagada">Pagadas</option>
                  <option value="cancelada">Canceladas</option>
                </select>

                <select
                  value={histYearFilter}
                  onChange={(e) => setHistYearFilter(e.target.value)}
                  className="border rounded-md px-2 py-1"
                >
                  <option value="todos">Todos los años</option>
                  {histYears.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {historialFiltrado.length === 0 && (
              <p className="text-sm text-slate-500">
                No hay reservas que coincidan con el filtro seleccionado.
              </p>
            )}

            {historialFiltrado.length > 0 && (
              <div className="space-y-3">
                {historialFiltrado.map((reserva) => {
                  const inicio = formatDate(reserva.fecha_inicio);
                  const fin = formatDate(reserva.fecha_fin);
                  const nombreCabana = reserva.cabana?.nombre || "Cabaña";
                  const noches = diffNoches(
                    reserva.fecha_inicio,
                    reserva.fecha_fin
                  );

                  const estadoVisual = getEstadoVisual(reserva);

                  return (
                    <div
                      key={reserva.id}
                      className="border rounded-xl px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2 bg-slate-50"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-800">
                            {nombreCabana}
                          </p>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${estadoVisual.badgeClass}`}
                          >
                            {estadoVisual.texto}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">
                          {inicio} → {fin}{" "}
                          {noches && (
                            <span className="ml-1 text-[11px] text-slate-500">
                              ({noches} noche{noches > 1 ? "s" : ""})
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => handleDetalle(reserva)}
                          className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
                        >
                          Ver detalle
                        </button>
                        <button
                          type="button"
                          onClick={handleComprobante}
                          className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
                        >
                          Descargar comprobante
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRebook(reserva)}
                          className="px-3 py-1.5 text-xs rounded-lg border border-emerald-500 text-emerald-700 hover:bg-emerald-50"
                        >
                          Reservar nuevamente
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>

      {/* MODAL DETALLE RESERVA */}
      {detalleReserva && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 p-6 relative">
            <button
              onClick={handleCloseDetalle}
              className="absolute top-3 right-3 text-slate-500 hover:text-slate-800 text-lg"
            >
              ×
            </button>

            <h3 className="text-lg font-semibold text-slate-900 mb-3">
              Detalle de la reserva
            </h3>

            {(() => {
              const r = detalleReserva;
              const inicio = formatDate(r.fecha_inicio);
              const fin = formatDate(r.fecha_fin);
              const noches = diffNoches(r.fecha_inicio, r.fecha_fin);
              const cabana = r.cabana?.nombre || "Cabaña";

              const precioNoche =
                r.precio_noche ??
                r.cabana?.precio_noche ??
                r.cabana?.precio ??
                null;
              const total =
                r.monto_total ??
                (noches && precioNoche ? noches * precioNoche : null);

              const estadoVisual = getEstadoVisual(r);

              return (
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Cabaña: </span>
                    {cabana}
                  </p>
                  <p>
                    <span className="font-medium">Fechas: </span>
                    {inicio} → {fin}{" "}
                    {noches && (
                      <span className="text-xs text-slate-500">
                        ({noches} noche{noches > 1 ? "s" : ""})
                      </span>
                    )}
                  </p>
                  <p>
                    <span className="font-medium">Estado: </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${estadoVisual.badgeClass}`}
                    >
                      {estadoVisual.texto}
                    </span>
                  </p>
                  {total !== null ? (
                    <p>
                      <span className="font-medium">Total: </span>
                      ${formatCLP(total)}{" "}
                      {precioNoche && (
                        <span className="text-xs text-slate-500">
                          · ${formatCLP(precioNoche)} por noche
                        </span>
                      )}
                    </p>
                  ) : (
                    <p className="text-slate-500">
                      El valor estimado no está disponible para esta reserva.
                    </p>
                  )}

                  <hr className="my-3" />

                  <p className="text-xs text-slate-500 leading-relaxed">
                    Política de cancelación: puedes cancelar sin costo hasta 7
                    días antes del check-in. Pasado ese plazo, podría aplicarse
                    un cargo equivalente a la seña abonada. Para cualquier duda,
                    contáctanos a nuestro correo o WhatsApp.
                  </p>
                </div>
              );
            })()}

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => handleRebook(detalleReserva)}
                className="px-3 py-1.5 text-xs rounded-lg border border-emerald-500 text-emerald-700 hover:bg-emerald-50"
              >
                Reservar nuevamente
              </button>
              <button
                onClick={handleCloseDetalle}
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
