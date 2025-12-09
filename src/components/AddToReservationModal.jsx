import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { api, fetchMisReservas } from "../api";

// Helper para formato de fecha
const formatDate = (d) => {
    if(!d) return "";
    const date = new Date(d + "T00:00:00");
    return date.toLocaleDateString("es-CL", { day: "2-digit", month: "short" });
};

export default function AddToReservationModal({ serviceToAdd, onClose }) {
  const navigate = useNavigate();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadReservas();
  }, []);

  const loadReservas = async () => {
    const token = localStorage.getItem("token") || localStorage.getItem("auth_token");
    
    // 1. Si no hay token, mandar a login y guardar intento
    if (!token) {
      toast.error("Inicia sesión para agregar servicios a tu reserva.");
      const currentPath = window.location.pathname + window.location.search;
      navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    try {
      const data = await fetchMisReservas();
      // 2. Filtramos solo reservas futuras o actuales (no canceladas ni pasadas)
      const now = new Date();
      now.setHours(0,0,0,0);
      
      const activas = (Array.isArray(data) ? data : []).filter(r => {
        const checkOut = new Date(r.fecha_fin + "T00:00:00");
        return checkOut >= now && r.estado !== 'cancelada';
      });

      setReservas(activas);
    } catch (error) {
      console.error(error);
      toast.error("Error cargando tus reservas.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectReserva = async (reserva) => {
    if (!window.confirm(`¿Agregar "${serviceToAdd.nombre}" a tu estadía en ${reserva.cabana?.nombre}?`)) return;

    setAdding(true);
    try {
      // Usamos el endpoint de upselling
      await api(`/api/reservas/${reserva.id}/servicios`, {
        method: "POST",
        body: {
          servicios: [
            {
              id: serviceToAdd.dbId, // ID REAL DE LA BASE DE DATOS
              cantidad: 1, 
              precio: serviceToAdd.precio
            }
          ]
        }
      });

      toast.success("¡Servicio agregado exitosamente!");
      navigate("/cuenta"); // Llevamos al usuario a su cuenta para que vea el cambio
    } catch (error) {
      console.error(error);
      toast.error("Error al agregar el servicio.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-slate-50 p-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Selecciona tu Reserva</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-xl">✕</button>
        </div>

        <div className="p-5 overflow-y-auto">
          <div className="mb-6 bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center gap-4 shadow-sm">
            <div className="text-3xl bg-white p-2 rounded-full shadow-sm">🛒</div>
            <div>
              <p className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider">Agregando:</p>
              <p className="font-bold text-slate-800 leading-tight">{serviceToAdd.nombre}</p>
              <p className="text-sm text-emerald-700 font-semibold mt-1">${serviceToAdd.precio.toLocaleString("es-CL")}</p>
            </div>
          </div>

          {loading ? (
            <p className="text-center text-slate-500 py-8">Buscando tus reservas...</p>
          ) : reservas.length === 0 ? (
            <div className="text-center py-8 px-4 border-2 border-dashed border-slate-200 rounded-xl">
              <div className="text-4xl mb-3">🎫</div>
              <p className="text-slate-600 font-medium mb-2">No tienes reservas activas</p>
              <p className="text-xs text-slate-400 mb-4">Necesitas una reserva confirmada o pendiente para agregar servicios extra.</p>
              <button onClick={() => navigate('/disponibilidad')} className="text-emerald-600 font-bold hover:underline text-sm">
                Ir a buscar Cabañas
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 uppercase font-bold mb-2 ml-1">Elige dónde agregarlo:</p>
              {reservas.map(r => (
                <button 
                  key={r.id} 
                  onClick={() => handleSelectReserva(r)}
                  disabled={adding}
                  className="w-full text-left border border-slate-200 rounded-xl p-4 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all group shadow-sm bg-white"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-slate-800 group-hover:text-emerald-800">{r.cabana?.nombre}</span>
                    <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500 font-mono">#{r.id}</span>
                  </div>
                  <div className="text-xs text-slate-500 flex gap-3 items-center">
                    <span className="flex items-center gap-1">📅 {formatDate(r.fecha_inicio)} - {formatDate(r.fecha_fin)}</span>
                    <span className="flex items-center gap-1">👥 {r.cantidad_personas}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}