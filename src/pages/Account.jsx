// src/pages/Account.jsx
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  fetchMisReservas,
  cancelarReserva,
  fetchMe,
  logoutUser,
  clearToken,
  subirComprobantePago,
  api, 
  updateProfile 
} from "../api";

import Header from "../components/Header";
import Footer from "../components/Footer";
import GuestManager from "../components/GuestManager";

// --- HELPERS (CORREGIDOS) ---
const money = (val) => "$" + (Number(val) || 0).toLocaleString("es-CL");

// Función robusta para leer fechas (SQL o ISO)
const parseDate = (d) => {
    if (!d) return null;
    // Convierte "2025-12-09 15:00:00" a "2025-12-09T15:00:00" para compatibilidad
    const dateStr = d.toString().replace(" ", "T"); 
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
};

const formatDate = (d) => {
  const date = parseDate(d);
  if (!date) return "Fecha por definir";
  return date.toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" });
};

const diffNoches = (d1, d2) => {
  const start = parseDate(d1);
  const end = parseDate(d2);
  if (!start || !end) return 0;
  
  // Reseteamos horas para contar noches puras
  start.setHours(0,0,0,0);
  end.setHours(0,0,0,0);
  
  const diff = (end - start) / 86400000; // ms en un día
  return Math.max(0, Math.round(diff));
};

// --- COMPONENTE: MODAL AGREGAR SERVICIOS (UPSELLING) ---
function AddServicesModal({ reserva, onClose, onSuccess }) {
    const [serviciosDb, setServiciosDb] = useState([]);
    const [seleccionados, setSeleccionados] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        api("/api/servicios")
            .then(data => setServiciosDb(data))
            .catch(() => toast.error("Error cargando catálogo de servicios"))
            .finally(() => setLoading(false));
    }, []);

    const handleQty = (id, delta) => {
        setSeleccionados(prev => {
            const curr = prev[id] || 0;
            const next = Math.max(0, curr + delta);
            const copy = { ...prev, [id]: next };
            if (next === 0) delete copy[id];
            return copy;
        });
    };

    const totalExtra = serviciosDb.reduce((acc, s) => acc + (s.precio * (seleccionados[s.id] || 0)), 0);

    const handleSubmit = async () => {
        if (totalExtra === 0) return;
        setSaving(true);
        try {
            const items = Object.entries(seleccionados).map(([id, cant]) => ({ id, cantidad: cant }));
            await api(`/api/reservas/${reserva.id}/servicios`, {
                method: "POST",
                body: { servicios: items }
            });
            toast.success("¡Servicios agregados exitosamente!");
            onSuccess();
            onClose();
        } catch (e) {
            console.error(e);
            toast.error("Error al agregar servicios");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-fade-in-up">
                <div className="p-5 border-b flex justify-between items-center bg-slate-50 rounded-t-2xl">
                    <h3 className="font-bold text-lg text-slate-800">Agregar Extras a tu Reserva</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-xl">✕</button>
                </div>
                
                <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
                    {loading ? <div className="text-center py-10">Cargando catálogo...</div> : (
                        <div className="grid sm:grid-cols-2 gap-4">
                            {serviciosDb.map(srv => (
                                <div key={srv.id} className={`bg-white border rounded-xl p-4 flex flex-col justify-between transition-all shadow-sm ${seleccionados[srv.id] ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-slate-200'}`}>
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-sm text-slate-800">{srv.nombre}</h4>
                                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">{money(srv.precio)}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 line-clamp-2 mb-3">{srv.descripcion}</p>
                                    </div>
                                    <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                                        <span className="text-[10px] uppercase font-bold text-slate-400">{srv.tipo}</span>
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => handleQty(srv.id, -1)} disabled={!seleccionados[srv.id]} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold disabled:opacity-30 transition">-</button>
                                            <span className="font-bold text-sm w-4 text-center">{seleccionados[srv.id] || 0}</span>
                                            <button onClick={() => handleQty(srv.id, 1)} className="w-8 h-8 rounded-full bg-slate-800 hover:bg-black text-white font-bold transition">+</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-5 border-t bg-white rounded-b-2xl flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-bold">Total a sumar</p>
                        <p className="text-2xl font-bold text-emerald-600">{money(totalExtra)}</p>
                    </div>
                    <button 
                        onClick={handleSubmit} 
                        disabled={saving || totalExtra === 0}
                        className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-200 transition transform active:scale-95"
                    >
                        {saving ? "Guardando..." : "Confirmar Extras"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- COMPONENTE: MODAL DE PAGO INTELIGENTE ---
function PaymentModal({ reserva, onClose, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [referencia, setReferencia] = useState("");
  const [uploading, setUploading] = useState(false);
  const [metodo, setMetodo] = useState('transferencia'); // 'transferencia' | 'presencial'
  const fileInputRef = useRef(null);

  // Cálculos financieros
  const total = Number(reserva.monto_total);
  const abonoSugerido = Math.round(total * 0.3);
  
  const handleFileChange = (e) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!file) return toast.error("Por favor adjunta el comprobante");
    setUploading(true);
    const formData = new FormData();
    formData.append("reserva_id", reserva.id);
    formData.append("archivo", file);
    if (referencia) formData.append("referencia", referencia);

    try {
      await subirComprobantePago(formData);
      toast.success("Comprobante enviado. Lo validaremos pronto.");
      onUploadSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Error al subir el comprobante");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-lg">Gestionar Pago</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-xl">✕</button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          
          {/* Resumen Financiero */}
          <div className="flex justify-between items-center mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="text-center">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Total Reserva</p>
                <p className="text-base font-bold text-slate-800">{money(total)}</p>
            </div>
            <div className="h-8 w-px bg-slate-300"></div>
            <div className="text-center">
                <p className="text-[10px] text-slate-500 uppercase font-bold text-emerald-700">Abono 30%</p>
                <p className="text-xl font-bold text-emerald-600">{money(abonoSugerido)}</p>
            </div>
            <div className="h-8 w-px bg-slate-300"></div>
            <div className="text-center">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Saldo Check-in</p>
                <p className="text-base font-bold text-slate-600">{money(total - abonoSugerido)}</p>
            </div>
          </div>

          {/* Selector de Método */}
          <div className="flex gap-2 mb-6">
            <button 
                onClick={() => setMetodo('transferencia')}
                className={`flex-1 py-3 rounded-xl border-2 text-sm font-bold transition-all ${metodo === 'transferencia' ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-slate-100 text-slate-500 hover:bg-slate-50'}`}
            >
                🏦 Transferir Abono
            </button>
            <button 
                onClick={() => setMetodo('presencial')}
                className={`flex-1 py-3 rounded-xl border-2 text-sm font-bold transition-all ${metodo === 'presencial' ? 'border-blue-500 bg-blue-50 text-blue-800' : 'border-slate-100 text-slate-500 hover:bg-slate-50'}`}
            >
                💳 Pagar en Check-in
            </button>
          </div>

          {/* CONTENIDO: TRANSFERENCIA */}
          {metodo === 'transferencia' && (
            <div className="space-y-5 animate-fade-in">
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-900 leading-relaxed">
                    <p>⚠️ <strong>Importante:</strong> Para asegurar tu reserva, debes transferir al menos el <strong>30% ({money(abonoSugerido)})</strong>. Tienes 24 horas para enviar el comprobante o la reserva podría liberarse.</p>
                </div>

                <div className="space-y-1 text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <p><span className="font-bold text-slate-800">Banco:</span> Banco de Chile / Cta Cte</p>
                    <p><span className="font-bold text-slate-800">N° Cuenta:</span> 12-345-6789</p>
                    <p><span className="font-bold text-slate-800">RUT:</span> 76.123.456-7</p>
                    <p><span className="font-bold text-slate-800">Email:</span> pagos@cabanasdelsur.cl</p>
                </div>

                {/* Subida de Archivo */}
                <div 
                    className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${file ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 hover:bg-slate-50'}`}
                    onClick={() => fileInputRef.current.click()}
                >
                    <input type="file" accept="image/*,.pdf" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                    {file ? (
                    <>
                        <span className="text-3xl mb-2">📄</span>
                        <span className="text-sm font-semibold text-emerald-700">{file.name}</span>
                        <span className="text-xs text-emerald-600">Clic para cambiar</span>
                    </>
                    ) : (
                    <>
                        <span className="text-3xl mb-2 text-slate-400">📤</span>
                        <span className="text-sm font-medium text-slate-600">Adjuntar Comprobante</span>
                        <span className="text-xs text-slate-400">Foto o PDF</span>
                    </>
                    )}
                </div>

                <input 
                    type="text" placeholder="Comentario opcional..." 
                    className="w-full border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={referencia} onChange={e => setReferencia(e.target.value)}
                />

                <button 
                    onClick={handleSubmit} disabled={uploading}
                    className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-700 transition disabled:opacity-50 shadow-lg shadow-emerald-100"
                >
                    {uploading ? "Enviando..." : "Confirmar Envío"}
                </button>
            </div>
          )}

          {/* CONTENIDO: PAGO PRESENCIAL */}
          {metodo === 'presencial' && (
            <div className="space-y-4 animate-fade-in text-center py-4">
                <div className="text-5xl mb-2">👋</div>
                <h4 className="font-bold text-slate-800 text-lg">Pago del Saldo al Check-in</h4>
                <p className="text-slate-600 text-sm">
                    El saldo restante de <span className="font-bold text-slate-900">{money(total - abonoSugerido)}</span> se paga al momento de tu llegada.
                </p>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-2xl block mb-2">💵</span>
                        <span className="font-bold text-sm text-slate-700">Efectivo</span>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-2xl block mb-2">💳</span>
                        <span className="font-bold text-sm text-slate-700">Tarjeta / Débito</span>
                        <span className="text-[10px] text-slate-400 block mt-1">Transbank disponible</span>
                    </div>
                </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// --- COMPONENTE: TARJETA DE RESERVA ---
function ReservationCard({ reserva, onUpdate }) {
  const navigate = useNavigate();
  const [showPay, setShowPay] = useState(false);
  const [showGuests, setShowGuests] = useState(false);
  const [showServices, setShowServices] = useState(false); // Modal servicios
  const [downloading, setDownloading] = useState(false);

  // Descargar PDF
  const handlePdf = async () => {
    setDownloading(true);
    try {
        const token = localStorage.getItem("token") || localStorage.getItem("auth_token");
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/reservas/${reserva.id}/comprobante`, { headers: { 'Authorization': `Bearer ${token}` } });
        if(!res.ok) throw new Error();
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `Voucher-${reserva.id}.pdf`; document.body.appendChild(a); a.click(); window.URL.revokeObjectURL(url);
    } catch { toast.error("Error descargando PDF"); } finally { setDownloading(false); }
  };

  const handleCancel = async () => {
      if(window.confirm("¿Cancelar reserva?")) {
          await cancelarReserva(reserva.id);
          onUpdate();
      }
  };

  let badge = { text: reserva.estado, color: "bg-gray-100 text-gray-600" };
  if(reserva.estado === 'confirmada') badge = { text: "Confirmada", color: "bg-emerald-100 text-emerald-800" };
  if(reserva.estado === 'cancelada') badge = { text: "Cancelada", color: "bg-red-100 text-red-800" };
  if(reserva.estado_pago === 'pendiente') badge = { text: "Pago en Revisión", color: "bg-amber-100 text-amber-800" };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all mb-5">
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-bold text-lg text-slate-800">{reserva.cabana?.nombre}</h3>
          <p className="text-sm text-slate-500">{formatDate(reserva.fecha_inicio)} - {formatDate(reserva.fecha_fin)} ({diffNoches(reserva.fecha_inicio, reserva.fecha_fin)} noches)</p>
        </div>
        <div className="text-right">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${badge.color}`}>{badge.text}</span>
            <p className="font-bold text-xl text-slate-900 mt-1">{money(reserva.monto_total)}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-3">
            <div className="flex gap-4 text-sm text-slate-600">
                <span>📍 {reserva.cabana?.zona}</span>
                <span>👥 {reserva.cantidad_personas} Pasajeros</span>
            </div>

            {/* Lista Servicios Contratados */}
            {reserva.servicios?.length > 0 && (
                <div className="bg-slate-50 rounded-lg p-3 text-xs border border-slate-100">
                    <p className="font-bold text-slate-500 uppercase mb-1">Extras Contratados:</p>
                    {reserva.servicios.map(s => (
                        <div key={s.id} className="flex justify-between">
                            <span>{s.nombre} <span className="text-slate-400">x{s.pivot.cantidad}</span></span>
                            <span className="font-medium">{money(s.pivot.total)}</span>
                        </div>
                    ))}
                </div>
            )}

            <button onClick={() => setShowGuests(!showGuests)} className="text-indigo-600 text-xs font-bold hover:underline">
                {showGuests ? "Ocultar Pasajeros ▲" : "Gestionar Pasajeros ▼"}
            </button>
            {showGuests && <div className="mt-2"><GuestManager reserva={reserva} onUpdate={onUpdate} /></div>}
        </div>

        <div className="flex flex-col gap-2 min-w-[200px] border-l pl-0 md:pl-6 border-slate-100">
            {reserva.estado !== 'cancelada' && (
                <>
                    {reserva.estado_pago !== 'validado' && reserva.estado_pago !== 'pendiente' && (
                        <button onClick={() => setShowPay(true)} className="btn-primary w-full py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-bold shadow-emerald-200 shadow-md">Pagar Abono</button>
                    )}
                    
                    {/* BOTÓN UPSELLING (Servicios) */}
                    <button onClick={() => setShowServices(true)} className="w-full py-2 text-sm rounded-lg border border-emerald-500 text-emerald-700 font-medium hover:bg-emerald-50 transition flex items-center justify-center gap-2">
                        <span>➕</span> Agregar Servicios
                    </button>

                    <button onClick={handlePdf} disabled={downloading} className="w-full py-2 text-sm rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50">
                        {downloading ? "..." : "📄 Bajar Comprobante"}
                    </button>
                </>
            )}
            
            {reserva.estado !== 'cancelada' && reserva.estado !== 'checkin' && (
                <button onClick={handleCancel} className="text-red-500 text-xs hover:underline mt-2 text-center">Cancelar Reserva</button>
            )}
        </div>
      </div>

      {showPay && <PaymentModal reserva={reserva} onClose={() => setShowPay(false)} onUploadSuccess={onUpdate} />}
      {showServices && <AddServicesModal reserva={reserva} onClose={() => setShowServices(false)} onSuccess={onUpdate} />}
    </div>
  );
}

// --- PAGINA PRINCIPAL ---
export default function Account() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('reservas');
  
  // Estados para forms
  const [phone, setPhone] = useState("");
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [savingUser, setSavingUser] = useState(false);

  const load = async () => {
      setLoading(true);
      try {
          const [u, r] = await Promise.all([fetchMe(), fetchMisReservas()]);

          // --- LÓGICA DE REDIRECCIÓN ADMIN (NUEVO) ---
          const roles = (u.roles || []).map(r => r.name || r);
          if (roles.includes('admin')) {
              navigate('/admin', { replace: true }); // Te envía al panel correcto
              return; // Detiene la carga del panel de usuario
          }
          // -------------------------------------------

          setUser(u);
          setPhone(u.telefono || "");
          setReservas(Array.isArray(r) ? r : []);
      } catch (e) { 
          // Si el error es de autenticación (401), mandamos al login
          if(e.message?.includes('401')) {
              navigate('/login');
          }
          console.error(e);
      } 
      finally { setLoading(false); }
    };
  useEffect(() => { load(); }, []);

  const handleUpdatePhone = async (e) => {
      e.preventDefault();
      setSavingUser(true);
      try {
          await updateProfile({ telefono: phone });
          toast.success("Teléfono actualizado");
      } catch { toast.error("Error al actualizar"); }
      finally { setSavingUser(false); }
  };

  const handleChangePass = async (e) => {
      e.preventDefault();
      if(passwords.new !== passwords.confirm) return toast.error("Las contraseñas no coinciden");
      setSavingUser(true);
      try {
          await api("/api/me/password", {
              method: "POST",
              body: { current_password: passwords.current, new_password: passwords.new, new_password_confirmation: passwords.confirm }
          });
          toast.success("Contraseña cambiada");
          setPasswords({ current: "", new: "", confirm: "" });
      } catch (e) { toast.error(e.message || "Error al cambiar contraseña"); }
      finally { setSavingUser(false); }
  };

  if(loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;

  const today = new Date();
  const futuras = reservas.filter(r => new Date(r.fecha_fin) >= today && r.estado !== 'cancelada');
  const pasadas = reservas.filter(r => new Date(r.fecha_fin) < today || r.estado === 'cancelada');

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-6 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-full flex items-center justify-center text-2xl text-white font-bold shadow-lg">
                {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold text-slate-800">Hola, {user?.name}</h1>
                <p className="text-slate-500 text-sm">{user?.email}</p>
            </div>
            <div className="flex gap-2">
                <button onClick={() => navigate('/disponibilidad')} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-black transition">+ Nueva Reserva</button>
                <button onClick={() => { logoutUser(); clearToken(); navigate('/'); }} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50">Salir</button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <aside className="lg:col-span-1">
                <nav className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden sticky top-24">
                    <button onClick={() => setTab('reservas')} className={`w-full text-left px-5 py-4 text-sm font-medium border-l-4 transition-colors ${tab === 'reservas' ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-transparent text-slate-600 hover:bg-slate-50'}`}>📅 Mis Reservas</button>
                    <button onClick={() => setTab('perfil')} className={`w-full text-left px-5 py-4 text-sm font-medium border-l-4 transition-colors ${tab === 'perfil' ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-transparent text-slate-600 hover:bg-slate-50'}`}>👤 Mis Datos</button>
                    <button onClick={() => setTab('seguridad')} className={`w-full text-left px-5 py-4 text-sm font-medium border-l-4 transition-colors ${tab === 'seguridad' ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-transparent text-slate-600 hover:bg-slate-50'}`}>🔒 Seguridad</button>
                </nav>
            </aside>

            <section className="lg:col-span-3">
                {tab === 'reservas' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">✈️ Tus Estadías</h2>
                        {futuras.length > 0 ? futuras.map(r => <ReservationCard key={r.id} reserva={r} onUpdate={load} />) : <div className="p-10 text-center bg-white rounded-2xl border border-dashed border-slate-300 text-slate-500">No tienes reservas activas.</div>}
                        {pasadas.length > 0 && <div className="opacity-80 grayscale-[0.3]"><h2 className="text-lg font-semibold text-slate-600 mb-4 border-t pt-8">📜 Historial</h2>{pasadas.map(r => <ReservationCard key={r.id} reserva={r} onUpdate={load} />)}</div>}
                    </div>
                )}

                {tab === 'perfil' && (
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                        <h2 className="text-xl font-bold text-slate-800 mb-6">Información Personal</h2>
                        <form onSubmit={handleUpdatePhone} className="space-y-4 max-w-lg">
                            <div><label className="block text-xs font-bold uppercase text-slate-400 mb-1">Nombre</label><input type="text" value={user?.name} readOnly className="w-full border rounded-lg px-4 py-2 bg-slate-50 text-slate-500 cursor-not-allowed" /></div>
                            <div><label className="block text-xs font-bold uppercase text-slate-400 mb-1">RUT</label><input type="text" value={user?.rut || "No registrado"} readOnly className="w-full border rounded-lg px-4 py-2 bg-slate-50 text-slate-500 cursor-not-allowed" /></div>
                            <div><label className="block text-xs font-bold uppercase text-slate-600 mb-1">Teléfono</label><input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="+56 9..." /></div>
                            <div className="pt-4"><button disabled={savingUser} className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-emerald-700 disabled:opacity-50">{savingUser ? "Guardando..." : "Guardar Cambios"}</button></div>
                        </form>
                    </div>
                )}

                {tab === 'seguridad' && (
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                        <h2 className="text-xl font-bold text-slate-800 mb-6">Cambiar Contraseña</h2>
                        <form onSubmit={handleChangePass} className="space-y-4 max-w-lg">
                            <div><label className="block text-xs font-bold uppercase text-slate-600 mb-1">Contraseña Actual</label><input type="password" value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-2" /></div>
                            <div><label className="block text-xs font-bold uppercase text-slate-600 mb-1">Nueva Contraseña</label><input type="password" value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-2" /></div>
                            <div><label className="block text-xs font-bold uppercase text-slate-600 mb-1">Confirmar</label><input type="password" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-2" /></div>
                            <div className="pt-4"><button disabled={savingUser} className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-black disabled:opacity-50">{savingUser ? "Actualizando..." : "Actualizar Contraseña"}</button></div>
                        </form>
                    </div>
                )}
            </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}