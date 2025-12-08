// src/components/GuestManager.jsx
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { addHuesped, deleteHuesped, fetchHuespedesReserva } from "../api";

const emptyGuest = {
  nombre: "",
  rut: "",
  telefono: "",
  // email fuera: el huésped no tiene correo propio
};

export default function GuestManager({ reserva, onUpdate }) {
  const reservaId = reserva?.id;

  const [huespedes, setHuespedes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [nuevo, setNuevo] = useState(emptyGuest);

  // -----------------------------
  // Cargar huéspedes de la reserva
  // -----------------------------
  async function loadHuespedes() {
    if (!reservaId) return;
    setLoading(true);
    setError("");
    try {
      const data = await fetchHuespedesReserva(reservaId);
      setHuespedes(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError(e.message || "No se pudieron cargar los huéspedes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHuespedes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservaId]);

  // -----------------------------
  // Manejo de formulario
  // -----------------------------
  function handleChange(e) {
    const { name, value } = e.target;
    setNuevo((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (saving || !reservaId) return;

    if (!nuevo.nombre.trim()) {
      toast.error("El nombre del huésped es obligatorio.");
      return;
    }

    // Capacidad física de la cabaña (regla dura)
    const maxCabana = reserva?.cabana?.capacidad ?? null;

    // Cantidad de personas declarada al reservar (regla blanda)
    const cantidadDeclarada = reserva?.cantidad_personas ?? null;

    const cantidadActual = huespedes.length;

    // -----------------------------
    // REGLA DURA: capacidad cabana
    // -----------------------------
    if (maxCabana && cantidadActual >= maxCabana) {
      toast.error(
        `La cabaña permite un máximo de ${maxCabana} huésped(es). Si necesitas más, contacta a la administración.`
      );
      return;
    }

    // -----------------------------
    // REGLA BLANDA: personas declaradas
    // -----------------------------
    if (
      cantidadDeclarada &&
      cantidadActual >= cantidadDeclarada && // ya estoy en el límite declarado
      (!maxCabana || cantidadActual < maxCabana) // pero aún no llego a la capacidad física
    ) {
      const confirmar = window.confirm(
        `Declaraste ${cantidadDeclarada} huésped(es) al reservar, ` +
          `pero estás agregando más.\n\n` +
          `El valor final puede ajustarse según políticas de la cabaña ` +
          `(persona extra, temporada, etc.). ¿Deseas continuar?`
      );

      if (!confirmar) return;
    }

    try {
      setSaving(true);

      const payload = {
        nombre: nuevo.nombre.trim(),
        rut: nuevo.rut.trim() || null,
        telefono: nuevo.telefono.trim() || null,
      };

      await addHuesped(reservaId, payload);

      toast.success("Huésped agregado.");
      setNuevo(emptyGuest);
      await loadHuespedes();
      if (onUpdate) onUpdate();
    } catch (e) {
      console.error(e);

      // Si el backend devolvió 422 con mensaje de capacidad
      const msg =
        e?.response?.data?.message || e.message || "No se pudo agregar al huésped.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(huespedId) {
    if (!window.confirm("¿Eliminar este huésped?")) return;

    try {
      setDeletingId(huespedId);
      await deleteHuesped(huespedId);
      toast.success("Huésped eliminado.");
      await loadHuespedes();
      if (onUpdate) onUpdate();
    } catch (e) {
      console.error(e);
      toast.error(e.message || "No se pudo eliminar al huésped.");
    } finally {
      setDeletingId(null);
    }
  }

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div className="mt-3 border rounded-xl bg-slate-50 px-3 py-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-800">
          Huéspedes de la reserva
        </h3>
        {loading && (
          <span className="text-[11px] text-slate-500">Cargando…</span>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-600 mb-2 bg-red-50 border border-red-100 rounded px-2 py-1">
          {error}
        </p>
      )}

      {/* Tabla de huéspedes */}
      {huespedes.length === 0 ? (
        <p className="text-xs text-slate-500 mb-2">
          Aún no has registrado huéspedes para esta reserva.
        </p>
      ) : (
        <div className="overflow-x-auto mb-3">
          <table className="min-w-full text-xs border">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-2 py-1 text-left border-b">Nombre</th>
                <th className="px-2 py-1 text-left border-b">RUT/Doc.</th>
                <th className="px-2 py-1 text-left border-b">Teléfono</th>
                <th className="px-2 py-1 text-left border-b w-16"></th>
              </tr>
            </thead>
            <tbody>
              {huespedes.map((h) => (
                <tr key={h.id}>
                  <td className="px-2 py-1 border-b">{h.nombre}</td>
                  <td className="px-2 py-1 border-b">
                    {h.rut || <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-2 py-1 border-b">
                    {h.telefono || <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-2 py-1 border-b text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(h.id)}
                      disabled={deletingId === h.id}
                      className="text-[11px] text-red-600 hover:underline disabled:opacity-60"
                    >
                      {deletingId === h.id ? "Eliminando…" : "Eliminar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form para agregar huésped */}
      <form
        onSubmit={handleAdd}
        className="grid gap-2 sm:grid-cols-3 items-end"
      >
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-slate-600">Nombre*</label>
          <input
            type="text"
            name="nombre"
            value={nuevo.nombre}
            onChange={handleChange}
            className="border rounded-md px-2 py-1 text-xs"
            placeholder="Nombre completo"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-slate-600">RUT/Doc.</label>
          <input
            type="text"
            name="rut"
            value={nuevo.rut}
            onChange={handleChange}
            className="border rounded-md px-2 py-1 text-xs"
            placeholder="Opcional"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-slate-600">Teléfono</label>
          <input
            type="text"
            name="telefono"
            value={nuevo.telefono}
            onChange={handleChange}
            className="border rounded-md px-2 py-1 text-xs"
            placeholder="Opcional"
          />
        </div>

        <div className="sm:col-span-3 flex justify-end mt-1">
          <button
            type="submit"
            disabled={saving}
            className="px-3 py-1.5 text-xs rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {saving ? "Guardando…" : "Agregar huésped"}
          </button>
        </div>
      </form>
    </div>
  );
}
