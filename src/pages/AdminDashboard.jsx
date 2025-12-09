// src/pages/AdminDashboard.jsx
import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  API_URL,
  getToken,
  fetchReservasAdmin,
  fetchCabanas,
  createCabana,
  updateCabana,
  deleteCabana,
  fetchMe,
  logoutUser,
  validarPago,
  fetchCabanaImagenes,
  uploadCabanaImagen,
  deleteCabanaImagen,
  // Servicios
  fetchServiciosAdmin,
  createServicio,
  updateServicio,
  deleteServicio,
  api // Importamos el helper api para las nuevas llamadas
} from "../api";

// --- COMPONENTE AUXILIAR: FOOTER ---
const BusinessFooter = ({ reservas, servicios, cabanas }) => {
    const totalVentas = reservas.reduce((sum, r) => sum + (Number(r.monto_total) || 0), 0);
    const metaMensual = 5000000;
    const porcentajeMeta = Math.min(100, Math.round((totalVentas / metaMensual) * 100));
    const reservasConServicios = reservas.filter(r => (r.monto_servicios || 0) > 0).length;
    const porcentajeUpselling = reservas.length > 0 ? Math.round((reservasConServicios / reservas.length) * 100) : 0;

    return (
        <footer className="mt-12 bg-slate-900 text-slate-300 py-12 px-6 rounded-t-3xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)]">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
                <div>
                    <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">📊 Performance</h4>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1"><span>Ingresos vs Meta</span><span className="text-emerald-400 font-bold">{porcentajeMeta}%</span></div>
                            <div className="w-full bg-slate-800 rounded-full h-2.5"><div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${porcentajeMeta}%` }}></div></div>
                            <p className="text-xs text-slate-500 mt-1">Meta: ${metaMensual.toLocaleString('es-CL')}</p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col justify-center">
                    <h4 className="text-white font-bold text-lg mb-4">KPIs Operativos</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700"><p className="text-2xl font-bold text-white">{reservas.length}</p><p className="text-xs text-slate-400 uppercase tracking-wide">Reservas</p></div>
                        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700"><p className="text-2xl font-bold text-amber-400">{cabanas.length}</p><p className="text-xs text-slate-400 uppercase tracking-wide">Cabañas</p></div>
                        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700"><p className="text-2xl font-bold text-emerald-400">{porcentajeUpselling}%</p><p className="text-xs text-slate-400 uppercase tracking-wide">Upselling</p></div>
                        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700"><p className="text-2xl font-bold text-indigo-400">{servicios.length}</p><p className="text-xs text-slate-400 uppercase tracking-wide">Servicios</p></div>
                    </div>
                </div>
                <div>
                    <h4 className="text-white font-bold text-lg mb-4">Enlaces</h4>
                    <ul className="space-y-2 text-sm">
                        <li><a href="/" target="_blank" className="hover:text-white transition-colors">🌐 Ver Sitio Web</a></li>
                        <li><a href="/disponibilidad" target="_blank" className="hover:text-white transition-colors">📅 Ver Disponibilidad</a></li>
                    </ul>
                </div>
            </div>
        </footer>
    );
};

const emptyCabana = { id: null, nombre: "", descripcion: "", capacidad: "", precio_noche: "", estado: "disponible", imagen_url: "", zona: "", dormitorios: "", banos: "", metros_cuadrados: "" };
const emptyServicio = { id: null, nombre: "", descripcion: "", precio: "", tipo: "amenity", activo: true, imagen: null };

// Helpers
const money = (value) => {
  if (value == null || Number.isNaN(Number(value))) return "$ 0";
  return `$ ${Number(value).toLocaleString("es-CL")}`;
};

function diffNoches(desde, hasta) {
  const d1 = new Date(desde);
  const d2 = new Date(hasta);
  if (Number.isNaN(d1.getTime()) || Number.isNaN(d2.getTime())) return null;
  const ms = d2.getTime() - d1.getTime();
  const noches = Math.round(ms / (1000 * 60 * 60 * 24));
  return noches > 0 ? noches : 1;
}

function getBadgePago(reserva) {
  const estado = reserva.estado_pago;
  if (!estado) return <span className="text-[10px] text-slate-500">Sin comprobante</span>;
  if (estado === "pendiente") return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-amber-100 text-amber-800">En revisión</span>;
  if (estado === "validado") return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-emerald-100 text-emerald-800">Pago confirmado</span>;
  return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-red-100 text-red-700">Rechazado</span>;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reservas'); // 'reservas' | 'cabanas' | 'servicios'

  // DATA
  const [reservas, setReservas] = useState([]);
  const [cabanas, setCabanas] = useState([]);
  const [servicios, setServicios] = useState([]);

  // FORMS
  const [formCabana, setFormCabana] = useState(emptyCabana);
  const [imagenesCabana, setImagenesCabana] = useState([]);
  const [archivosSeleccionados, setArchivosSeleccionados] = useState(null);
  
  const [formServicio, setFormServicio] = useState(emptyServicio);
  const [archivoServicio, setArchivoServicio] = useState(null);

  const [saving, setSaving] = useState(false);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [validandoPagoId, setValidandoPagoId] = useState(null);
  
  // FILTROS
  const [filtroDesde, setFiltroDesde] = useState("");
  const [filtroHasta, setFiltroHasta] = useState("");

  // modal de huéspedes
  const [reservaHuespedes, setReservaHuespedes] = useState(null);

  useEffect(() => {
    cargarTodo();
  }, []);

  async function cargarTodo() {
    setLoading(true);
    try {
      const user = await fetchMe();
      const roles = (user.roles || []).map((r) => r.name || r);
      if (!roles.includes("admin")) {
        toast.error("Acceso denegado");
        navigate("/");
        return;
      }
      setMe(user);

      const [resData, cabData, servData] = await Promise.all([
        fetchReservasAdmin(),
        fetchCabanas(),
        fetchServiciosAdmin().catch(() => [])
      ]);

      setReservas(Array.isArray(resData) ? resData : resData.data || []);
      setCabanas(Array.isArray(cabData) ? cabData : cabData.data || []);
      setServicios(Array.isArray(servData) ? servData : []);

    } catch (e) {
      console.error(e);
      toast.error("Error cargando panel");
    } finally {
      setLoading(false);
    }
  }

  // --- LÓGICA RESERVAS ---
  async function handleValidarPago(r) {
    if(!confirm("¿Confirmar pago?")) return;
    try {
        setValidandoPagoId(r.ultimo_pago.id);
        await validarPago(r.ultimo_pago.id);
        toast.success("Pago validado");
        const resData = await fetchReservasAdmin();
        setReservas(resData);
    } catch(e) { toast.error("Error validando"); }
    finally { setValidandoPagoId(null); }
  }

  // --- NUEVAS FUNCIONES OPERATIVAS (CHECK-IN / OUT) ---
  async function handleCheckIn(id) {
    if(!confirm("¿Confirmar Check-in del pasajero?")) return;
    try {
        await api(`/api/reservas/${id}/checkin`, { method: 'POST' });
        toast.success("Check-in realizado");
        cargarTodo(); // Recargar tabla
    } catch { toast.error("Error al hacer check-in"); }
  }

  async function handleCheckOut(id) {
    if(!confirm("¿Confirmar Check-out y liberar cabaña?")) return;
    try {
        await api(`/api/reservas/${id}/checkout`, { method: 'POST' });
        toast.success("Check-out realizado");
        cargarTodo();
    } catch { toast.error("Error al hacer check-out"); }
  }

  // --- NUEVA LÓGICA PDF (PLAN B: HTML PRINT) ---
  async function descargarReportePdf() {
    const token = getToken();
    if (!token) return toast.error("No hay sesión activa");

    const toastId = toast.loading("Generando reporte...");

    try {
        const params = new URLSearchParams();
        if (filtroDesde) params.append("desde", filtroDesde);
        if (filtroHasta) params.append("hasta", filtroHasta);

        const response = await fetch(`${API_URL}/api/reportes/ocupacion/pdf?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'text/html'
            }
        });

        if (!response.ok) throw new Error("Error generando reporte");

        const htmlContent = await response.text();
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            toast.error("Por favor permite las ventanas emergentes", { id: toastId });
            return;
        }

        printWindow.document.write(htmlContent);
        printWindow.document.close(); 
        
        setTimeout(() => {
            printWindow.focus();
            printWindow.print();
        }, 500);

        toast.success("Reporte generado", { id: toastId });

    } catch (error) {
        console.error(error);
        toast.error("Error al generar reporte", { id: toastId });
    }
  }

  // --- LÓGICA CABAÑAS ---
  async function saveCabana(e) {
    e.preventDefault();
    setSaving(true);
    try {
        if(formCabana.id) await updateCabana(formCabana.id, formCabana);
        else await createCabana(formCabana);
        toast.success("Cabaña guardada");
        setFormCabana(emptyCabana);
        const data = await fetchCabanas();
        setCabanas(data);
    } catch(e) { toast.error("Error guardando cabaña"); }
    finally { setSaving(false); }
  }

  async function editarCabana(c) {
      setFormCabana(c);
      setActiveTab('cabanas');
      window.scrollTo(0,0);
      try {
          const imgs = await fetchCabanaImagenes(c.id);
          setImagenesCabana(imgs);
      } catch {}
  }

  async function subirFotosCabana() {
      if(!archivosSeleccionados) return;
      setSubiendoImagen(true);
      try {
          for(let i=0; i<archivosSeleccionados.length; i++) {
              await uploadCabanaImagen(formCabana.id, archivosSeleccionados[i]);
          }
          toast.success("Fotos subidas");
          const imgs = await fetchCabanaImagenes(formCabana.id);
          setImagenesCabana(imgs);
          setArchivosSeleccionados(null);
          document.getElementById('fileInputMultiple').value = "";
      } catch { toast.error("Error subiendo fotos"); }
      finally { setSubiendoImagen(false); }
  }

  async function borrarFotoCabana(id) {
      if(!confirm("¿Borrar foto?")) return;
      await deleteCabanaImagen(id);
      setImagenesCabana(prev => prev.filter(img => img.id !== id));
  }

  async function handleSetPortada(rutaImagen) {
      if (!formCabana.id) return;
      const urlCompleta = rutaImagen.startsWith("http") ? rutaImagen : `${API_URL}/storage/${rutaImagen}`;
      try {
          await updateCabana(formCabana.id, { ...formCabana, imagen_url: urlCompleta });
          setFormCabana(prev => ({ ...prev, imagen_url: urlCompleta }));
          toast.success("Portada actualizada");
          const data = await fetchCabanas();
          setCabanas(data);
      } catch { toast.error("Error al actualizar portada"); }
  }

  // --- LÓGICA SERVICIOS ---
  async function saveServicio(e) {
      e.preventDefault();
      setSaving(true);
      const formData = new FormData();
      Object.keys(formServicio).forEach(key => {
          if (key !== 'imagen' && formServicio[key] !== null) formData.append(key, formServicio[key]);
      });
      formData.set('activo', formServicio.activo ? '1' : '0');
      if (archivoServicio) formData.append('imagen', archivoServicio);

      try {
          if (formServicio.id) await updateServicio(formServicio.id, formData);
          else await createServicio(formData);
          
          toast.success(formServicio.id ? "Servicio actualizado" : "Servicio creado");
          setFormServicio(emptyServicio);
          setArchivoServicio(null);
          const data = await fetchServiciosAdmin();
          setServicios(data);
      } catch (e) {
          console.error(e);
          toast.error("Error al guardar servicio");
      } finally {
          setSaving(false);
      }
  }

  async function deleteServicioHandler(id) {
      if(!confirm("¿Eliminar servicio?")) return;
      try {
          await deleteServicio(id);
          toast.success("Eliminado");
          setServicios(prev => prev.filter(s => s.id !== id));
      } catch { toast.error("Error al eliminar"); }
  }

  // Modal huéspedes
  function abrirHuespedes(reserva) { setReservaHuespedes(reserva); }
  function cerrarHuespedes() { setReservaHuespedes(null); }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando Admin...</div>;

  return (
    <div className="min-h-screen bg-slate-100 pb-20 font-sans">
      <header className="bg-slate-900 text-white px-6 py-4 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                ⚡ Panel de Control
            </h1>
            <div className="flex gap-4 text-sm items-center">
                <span className="opacity-80">{me?.name}</span>
                <Link to="/" className="hover:text-emerald-400">Ver Web</Link>
                <button onClick={() => { logoutUser(); navigate('/'); }} className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 font-bold text-xs">SALIR</button>
            </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-8 min-h-[60vh]">
        
        {/* NAVEGACIÓN TABS */}
        <div className="flex gap-1 mb-6 border-b border-slate-300">
            <button onClick={() => setActiveTab('reservas')} className={`px-6 py-3 font-bold text-sm rounded-t-lg transition-all ${activeTab === 'reservas' ? 'bg-white text-emerald-800 border-x border-t border-slate-300 shadow-sm' : 'bg-transparent text-slate-500 hover:bg-slate-200'}`}>📅 Reservas</button>
            <button onClick={() => setActiveTab('cabanas')} className={`px-6 py-3 font-bold text-sm rounded-t-lg transition-all ${activeTab === 'cabanas' ? 'bg-white text-emerald-800 border-x border-t border-slate-300 shadow-sm' : 'bg-transparent text-slate-500 hover:bg-slate-200'}`}>🏡 Cabañas</button>
            <button onClick={() => setActiveTab('servicios')} className={`px-6 py-3 font-bold text-sm rounded-t-lg transition-all ${activeTab === 'servicios' ? 'bg-white text-emerald-800 border-x border-t border-slate-300 shadow-sm' : 'bg-transparent text-slate-500 hover:bg-slate-200'}`}>✨ Servicios</button>
        </div>

        {/* TAB: RESERVAS */}
        {activeTab === 'reservas' && (
            <div className="bg-white rounded-b-xl rounded-tr-xl shadow-sm p-6 animate-fade-in border border-slate-200">
                <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                    <h2 className="font-bold text-lg text-slate-800">Listado de Reservas</h2>
                    <div className="flex gap-2 items-center bg-slate-100 p-2 rounded-lg">
                        <input type="date" value={filtroDesde} onChange={e => setFiltroDesde(e.target.value)} className="border rounded px-2 py-1 text-sm outline-none" />
                        <span className="text-slate-400">-</span>
                        <input type="date" value={filtroHasta} onChange={e => setFiltroHasta(e.target.value)} className="border rounded px-2 py-1 text-sm outline-none" />
                        <button onClick={descargarReportePdf} className="bg-slate-800 text-white px-4 py-1.5 rounded text-sm hover:bg-slate-700 ml-2 font-medium">📄 Generar Reporte</button>
                    </div>
                </div>
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-xs">
                            <tr><th className="px-4 py-3">ID</th><th className="px-4 py-3">Cabaña</th><th className="px-4 py-3">Cliente</th><th className="px-4 py-3">Fechas</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Pago / Acciones</th><th className="px-4 py-3">Pasajeros</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {reservas.map(r => (
                                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3 font-mono text-slate-400 text-xs">#{r.id}</td>
                                    <td className="px-4 py-3 font-medium text-slate-700">{r.cabana?.nombre}</td>
                                    <td className="px-4 py-3"><div className="font-bold text-slate-800">{r.user?.name}</div><div className="text-xs text-slate-500">{r.user?.email}</div></td>
                                    <td className="px-4 py-3"><div className="text-xs font-medium">{r.fecha_inicio.slice(0,10)} ➝ {r.fecha_fin.slice(0,10)}</div><div className="text-[10px] text-slate-400 mt-0.5">{diffNoches(r.fecha_inicio, r.fecha_fin)} noches</div></td>
                                    <td className="px-4 py-3"><span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold uppercase">{r.estado}</span></td>
                                    <td className="px-4 py-3">
                                        {/* BADGE DE PAGO */}
                                        {getBadgePago(r)}
                                        
                                        {/* VALIDACIÓN DE PAGO */}
                                        {r.estado_pago === 'pendiente' && (
                                            <button onClick={() => handleValidarPago(r)} className="block mt-1 text-xs text-emerald-600 font-bold hover:underline mb-2">
                                                {validandoPagoId === r.ultimo_pago?.id ? '...' : 'Validar'}
                                            </button>
                                        )}
                                        {r.ultimo_pago?.archivo_url && (
                                            <a href={r.ultimo_pago.archivo_url} target="_blank" className="block text-[10px] text-blue-500 hover:underline mb-2">Ver comprobante 🔗</a>
                                        )}

                                        {/* ACCIONES OPERATIVAS (CHECK-IN / CHECK-OUT) */}
                                        <div className="flex gap-1 mt-2">
                                            {(r.estado === 'confirmada' || r.estado === 'pagada') && (
                                                <button onClick={() => handleCheckIn(r.id)} className="bg-blue-600 text-white text-[10px] px-2 py-1 rounded hover:bg-blue-700 shadow" title="Marcar entrada">
                                                    📥 Check-in
                                                </button>
                                            )}
                                            {r.estado === 'checkin' && (
                                                <button onClick={() => handleCheckOut(r.id)} className="bg-slate-700 text-white text-[10px] px-2 py-1 rounded hover:bg-slate-800 shadow" title="Marcar salida">
                                                    📤 Check-out
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button onClick={() => abrirHuespedes(r)} className="text-xs bg-slate-100 px-2 py-1 rounded hover:bg-slate-200">Ver ({r.huespedes?.length || 0})</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* TAB CABAÑAS */}
        {activeTab === 'cabanas' && (
            <div className="bg-white rounded-b-xl rounded-tr-xl shadow-sm p-6 animate-fade-in border border-slate-200">
                {/* FORMULARIO CABAÑA */}
                <div className="bg-indigo-50/50 p-6 rounded-xl mb-10 border border-indigo-100">
                    <h3 className="font-bold text-indigo-900 mb-6 flex items-center gap-2">{formCabana.id ? '✏️ Editar Cabaña' : '➕ Nueva Cabaña'}</h3>
                    <form onSubmit={saveCabana} className="grid md:grid-cols-3 gap-5">
                        <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase">Nombre</label><input value={formCabana.nombre} onChange={e => setFormCabana({...formCabana, nombre: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" required /></div>
                        <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase">Zona</label><input value={formCabana.zona} onChange={e => setFormCabana({...formCabana, zona: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                        <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase">Capacidad</label><input type="number" value={formCabana.capacidad} onChange={e => setFormCabana({...formCabana, capacidad: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" required /></div>
                        <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase">Precio Noche</label><input type="number" value={formCabana.precio_noche} onChange={e => setFormCabana({...formCabana, precio_noche: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" required /></div>
                        <div className="space-y-1 md:col-span-2"><label className="text-xs font-bold text-slate-500 uppercase">Descripción</label><textarea value={formCabana.descripcion} onChange={e => setFormCabana({...formCabana, descripcion: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm h-[42px]" /></div>
                        <div className="md:col-span-3 flex gap-3 justify-end pt-2">
                            {formCabana.id && <button type="button" onClick={() => {setFormCabana(emptyCabana); setImagenesCabana([]);}} className="px-4 py-2 border rounded-lg text-sm text-slate-600 hover:bg-white">Cancelar</button>}
                            <button type="submit" disabled={saving} className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700">{saving ? 'Guardando...' : 'Guardar Cabaña'}</button>
                        </div>
                    </form>

                    {formCabana.id && (
                        <div className="mt-6 pt-6 border-t border-indigo-100">
                            <p className="text-xs font-bold text-indigo-900 mb-3 uppercase">📸 Galería (Selecciona la portada con ⭐)</p>
                            <div className="flex gap-3 mb-4 items-center">
                                <input id="fileInputMultiple" type="file" multiple onChange={e => setArchivosSeleccionados(e.target.files)} className="text-xs text-slate-500" />
                                <button onClick={subirFotosCabana} disabled={!archivosSeleccionados} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-700 disabled:opacity-50">Subir</button>
                            </div>
                            <div className="flex gap-3 overflow-x-auto pb-2">
                                {imagenesCabana.map(img => {
                                    const rutaAbsoluta = img.ruta.startsWith('http') ? img.ruta : `${API_URL}/storage/${img.ruta}`;
                                    const esPortada = formCabana.imagen_url === rutaAbsoluta;
                                    return (
                                        <div key={img.id} className={`relative w-24 h-24 shrink-0 group rounded-lg overflow-hidden border-2 ${esPortada ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-slate-200'}`}>
                                            <img src={rutaAbsoluta} className="w-full h-full object-cover" />
                                            {esPortada && <div className="absolute top-0 left-0 bg-emerald-500 text-white text-[8px] px-1 font-bold">PORTADA</div>}
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-1">
                                                {!esPortada && <button type="button" onClick={() => handleSetPortada(img.ruta)} className="bg-white text-emerald-600 text-[10px] px-2 py-1 rounded font-bold">⭐</button>}
                                                <button type="button" onClick={() => borrarFotoCabana(img.id)} className="bg-red-600 text-white text-[10px] px-2 py-1 rounded">🗑️</button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cabanas.map(c => (
                        <div key={c.id} className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition bg-white flex flex-col justify-between h-full">
                            <div>
                                <div className="flex justify-between items-start mb-2"><h4 className="font-bold text-slate-800 text-lg">{c.nombre}</h4><span className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${c.estado === 'disponible' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{c.estado}</span></div>
                                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-4"><span>📍 {c.zona}</span><span>👥 {c.capacidad} pax</span><span>💲 {money(c.precio_noche)}</span><span>📐 {c.metros_cuadrados} m²</span></div>
                            </div>
                            <div className="pt-4 border-t border-slate-100 flex gap-2"><button onClick={() => editarCabana(c)} className="flex-1 bg-slate-50 text-slate-700 py-2 rounded-lg text-xs font-bold hover:bg-slate-100 border border-slate-200">Editar</button><button onClick={() => handleDeleteCabana(c)} className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg text-xs font-bold border border-transparent hover:border-red-100">Eliminar</button></div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* TAB SERVICIOS */}
        {activeTab === 'servicios' && (
            <div className="bg-white rounded-b-xl rounded-tr-xl shadow-sm p-6 animate-fade-in border border-slate-200">
                <div className="bg-amber-50/50 p-6 rounded-xl mb-10 border border-amber-100">
                    <h3 className="font-bold text-amber-900 mb-6 flex items-center gap-2">{formServicio.id ? '✏️ Editar Servicio' : '✨ Nuevo Servicio / Tour'}</h3>
                    <form onSubmit={saveServicio} className="grid md:grid-cols-4 gap-5">
                        <div className="md:col-span-2 space-y-1"><label className="text-xs font-bold text-slate-500 uppercase">Nombre</label><input value={formServicio.nombre} onChange={e => setFormServicio({...formServicio, nombre: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none" required /></div>
                        <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase">Precio</label><input type="number" value={formServicio.precio} onChange={e => setFormServicio({...formServicio, precio: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none" required /></div>
                        <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase">Categoría</label><select value={formServicio.tipo} onChange={e => setFormServicio({...formServicio, tipo: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white"><option value="amenity">Amenity</option><option value="transporte">Transporte</option><option value="experiencia">Experiencia</option></select></div>
                        <div className="md:col-span-3 space-y-1"><label className="text-xs font-bold text-slate-500 uppercase">Descripción</label><input value={formServicio.descripcion} onChange={e => setFormServicio({...formServicio, descripcion: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none" /></div>
                        <div className="flex flex-col justify-end"><input type="file" onChange={e => setArchivoServicio(e.target.files[0])} className="text-xs text-slate-500" accept="image/*" /></div>
                        <div className="md:col-span-4 flex items-center justify-between pt-4 border-t border-amber-100/50 mt-2">
                            <label className="flex items-center gap-2 cursor-pointer select-none"><input type="checkbox" checked={formServicio.activo} onChange={e => setFormServicio({...formServicio, activo: e.target.checked})} className="rounded text-amber-600 focus:ring-amber-500" /><span className="text-sm font-medium text-slate-700">Activo (Visible en web)</span></label>
                            <div className="flex gap-3">
                                {formServicio.id && <button type="button" onClick={() => {setFormServicio(emptyServicio); setArchivoServicio(null);}} className="px-4 py-2 border rounded-lg text-sm text-slate-600 hover:bg-white">Cancelar</button>}
                                <button type="submit" disabled={saving} className="px-6 py-2 bg-amber-600 text-white rounded-lg text-sm font-bold hover:bg-amber-700 shadow-sm shadow-amber-200">{saving ? 'Guardando...' : 'Guardar Servicio'}</button>
                            </div>
                        </div>
                    </form>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {servicios.map(s => (
                        <div key={s.id} className={`border border-slate-200 rounded-xl p-4 flex gap-4 transition bg-white hover:shadow-md ${!s.activo ? 'opacity-60 grayscale bg-slate-50' : ''}`}>
                            <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-100">
                                {s.imagen_url ? <img src={s.imagen_url} className="w-full h-full object-cover" alt={s.nombre} /> : <span className="w-full h-full flex items-center justify-center text-2xl">🏷️</span>}
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start"><h4 className="font-bold text-slate-800 text-sm truncate pr-2" title={s.nombre}>{s.nombre}</h4><button onClick={() => deleteServicioHandler(s.id)} className="text-slate-300 hover:text-red-500 transition-colors">✕</button></div>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-0.5">{s.tipo}</p>
                                </div>
                                <div className="flex justify-between items-end mt-2"><span className="text-emerald-700 font-bold text-lg">{money(s.precio)}</span><button onClick={() => { setFormServicio(s); window.scrollTo(0,0); }} className="text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-600 font-bold hover:bg-slate-100">Editar</button></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

      </main>

      {/* FOOTER */}
      <BusinessFooter reservas={reservas} servicios={servicios} cabanas={cabanas} />

      {/* MODAL HUÉSPEDES */}
      {reservaHuespedes && (
         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
             <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden animate-fade-in-up">
                 <div className="bg-slate-50 px-6 py-4 border-b flex justify-between items-center">
                     <div>
                         <h3 className="font-bold text-lg text-slate-800">Huéspedes Reserva #{reservaHuespedes.id}</h3>
                         <p className="text-xs text-slate-500">Titular: {reservaHuespedes.user?.name}</p>
                     </div>
                     <button onClick={() => setReservaHuespedes(null)} className="text-slate-400 hover:text-slate-600 font-bold text-xl">✕</button>
                 </div>
                 
                 <div className="p-0">
                     {reservaHuespedes.huespedes && reservaHuespedes.huespedes.length > 0 ? (
                         <div className="overflow-x-auto">
                             <table className="w-full text-sm text-left">
                                 <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                                     <tr>
                                         <th className="px-6 py-3">Nombre Completo</th>
                                         <th className="px-6 py-3">RUT / Pasaporte</th>
                                         <th className="px-6 py-3">Teléfono</th>
                                     </tr>
                                 </thead>
                                 <tbody className="divide-y divide-slate-100">
                                     {reservaHuespedes.huespedes.map((h, i) => (
                                         <tr key={h.id || i} className="hover:bg-slate-50">
                                             <td className="px-6 py-3 font-medium text-slate-800">
                                                 {h.nombre || h.nombre_completo || <span className="text-red-400 italic">No registrado</span>}
                                             </td>
                                             <td className="px-6 py-3 text-slate-600">
                                                 {h.rut || h.documento || '-'}
                                             </td>
                                             <td className="px-6 py-3 text-slate-600">
                                                 {h.telefono || '-'}
                                             </td>
                                         </tr>
                                     ))}
                                 </tbody>
                             </table>
                         </div>
                     ) : (
                         <div className="p-10 text-center flex flex-col items-center">
                             <div className="text-4xl mb-3">👥</div>
                             <p className="text-slate-500 font-medium">Lista de pasajeros vacía.</p>
                             <p className="text-xs text-slate-400 mt-1">El cliente aún no ha registrado a sus acompañantes.</p>
                         </div>
                     )}
                 </div>
                 
                 <div className="bg-slate-50 px-6 py-4 border-t text-right">
                     <button onClick={() => setReservaHuespedes(null)} className="bg-slate-800 text-white px-6 py-2 rounded-lg text-sm hover:bg-slate-900 font-medium transition">
                         Cerrar
                     </button>
                 </div>
             </div>
         </div>
      )}
    </div>
  );
}




