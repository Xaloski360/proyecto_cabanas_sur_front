// src/components/GuestManager.jsx
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { addHuesped, deleteHuesped, fetchHuespedesReserva } from "../api";

const emptyGuest = {
  nombre: "",
  rut: "",
  telefono: "",
};

export default function GuestManager({ reserva, onUpdate }) {
  const reservaId = reserva?.id;

  const [huespedes, setHuespedes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [nuevo, setNuevo] = useState(emptyGuest);

  // Cargar huéspedes
  async function loadHuespedes() {
    if (!reservaId) return;
    setLoading(true);
    try {
      const data = await fetchHuespedesReserva(reservaId);
      setHuespedes(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      toast.error("Error al cargar huéspedes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHuespedes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservaId]);

  // Manejo de Inputs
  function handleChange(e) {
    const { name, value } = e.target;
    setNuevo((prev) => ({ ...prev, [name]: value }));
  }

  // Agregar Huésped
  async function handleAdd(e) {
    e.preventDefault();
    if (saving || !reservaId) return;

    if (!nuevo.nombre.trim()) return toast.error("El nombre es obligatorio.");

    // Validaciones de capacidad
    const maxCabana = reserva?.cabana?.capacidad ?? null;
    const cantidadDeclarada = reserva?.cantidad_personas ?? null;
    const cantidadActual = huespedes.length;

    if (maxCabana && cantidadActual >= maxCabana) {
      toast.error(`Máximo de ${maxCabana} huéspedes permitido.`);
      return;
    }

    if (
      cantidadDeclarada &&
      cantidadActual >= cantidadDeclarada &&
      (!maxCabana || cantidadActual < maxCabana)
    ) {
      if (!window.confirm(`Declaraste ${cantidadDeclarada} personas. ¿Agregar extra?`)) return;
    }

    try {
      setSaving(true);
      await addHuesped(reservaId, {
        nombre: nuevo.nombre.trim(),
        rut: nuevo.rut.trim() || null,
        telefono: nuevo.telefono.trim() || null,
      });
      toast.success("Huésped agregado");
      setNuevo(emptyGuest);
      await loadHuespedes();
      if (onUpdate) onUpdate();
    } catch (e) {
      console.error(e);
      toast.error(e.response?.data?.message || "Error al agregar huésped");
    } finally {
      setSaving(false);
    }
  }

  // Eliminar Huésped
  async function handleDelete(huespedId) {
    if (!window.confirm("¿Eliminar este huésped?")) return;
    try {
      setDeletingId(huespedId);
      await deleteHuesped(huespedId);
      toast.success("Eliminado");
      await loadHuespedes();
      if (onUpdate) onUpdate();
    } catch (e) {
      toast.error("Error al eliminar");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Título y Loader */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-700">Lista de Pasajeros</h4>
        {loading && <span className="text-xs text-slate-400 animate-pulse">Actualizando...</span>}
      </div>

      {/* Lista de Huéspedes */}
      {huespedes.length === 0 ? (
        <div className="text-center py-4 bg-white border border-dashed border-slate-200 rounded-lg">
          <p className="text-xs text-slate-400">No hay huéspedes registrados.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
              <tr>
                <th className="px-3 py-2 font-normal text-xs uppercase">Nombre</th>
                <th className="px-3 py-2 font-normal text-xs uppercase">RUT / Doc</th>
                <th className="px-3 py-2 font-normal text-xs uppercase text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {huespedes.map((h) => (
                <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-3 py-2 text-slate-700 font-medium">
                    {h.nombre}
                    {h.telefono && <div className="text-xs text-slate-400 font-normal">{h.telefono}</div>}
                  </td>
                  <td className="px-3 py-2 text-slate-600">{h.rut || "—"}</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => handleDelete(h.id)}
                      disabled={deletingId === h.id}
                      className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition"
                      title="Eliminar huésped"
                    >
                      {deletingId === h.id ? "..." : "🗑️"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Formulario de Agregar (Compacto) */}
      <form onSubmit={handleAdd} className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col gap-3">
        <p className="text-xs font-bold text-slate-500 uppercase">Agregar nuevo pasajero</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input
            type="text"
            name="nombre"
            value={nuevo.nombre}
            onChange={handleChange}
            placeholder="Nombre Completo *"
            className="border border-slate-300 rounded px-2 py-1.5 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
            required
          />
          <input
            type="text"
            name="rut"
            value={nuevo.rut}
            onChange={handleChange}
            placeholder="RUT / Pasaporte"
            className="border border-slate-300 rounded px-2 py-1.5 text-sm focus:border-emerald-500 outline-none"
          />
          <button
            type="submit"
            disabled={saving}
            className="bg-slate-800 text-white text-sm font-medium py-1.5 px-3 rounded hover:bg-slate-900 transition disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Agregar +"}
          </button>
        </div>
      </form>
    </div>
  );
}