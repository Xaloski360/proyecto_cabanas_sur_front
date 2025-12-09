// src/pages/CabanaDetalle.jsx
import { useEffect, useMemo, useState } from "react";
import {
  useParams,
  useSearchParams,
  useNavigate,
} from "react-router-dom";
import { api, previewReserva, createReserva, API_URL, fetchServicios } from "../api"; // <--- Agregado fetchServicios
import { toast } from "react-hot-toast";
import Header from "../components/Header";
import Footer from "../components/Footer";

// Fallback de imagen
const IMG_FALLBACK = "https://via.placeholder.com/1200x800?text=Sin+Imagen";

// Helper moneda
const money = (val) => "$" + (Number(val) || 0).toLocaleString("es-CL");

export default function CabanaDetalle() {
  const { id } = useParams();
  const [qs, setQs] = useSearchParams();
  const navigate = useNavigate();

  // Inputs Reserva
  const [desde, setDesde] = useState(qs.get("desde") || "");
  const [hasta, setHasta] = useState(qs.get("hasta") || "");
  const [huespedes, setHuespedes] = useState(Number(qs.get("huespedes") || 2));
  
  // Estados de datos
  const [cabana, setCabana] = useState(null);
  const [serviciosDb, setServiciosDb] = useState([]); // Catálogo traído del back
  const [seleccionados, setSeleccionados] = useState({}); // Mapa { idServicio: cantidad }
  
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [withPets, setWithPets] = useState(false);

  // Cálculo de noches
  const noches = useMemo(() => {
    if (!desde || !hasta) return 0;
    const d1 = new Date(desde);
    const d2 = new Date(hasta);
    const diff = (d2 - d1) / (1000 * 60 * 60 * 24);
    return diff > 0 ? diff : 0;
  }, [desde, hasta]);

  // Carga inicial (Cabaña + Servicios)
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const [cData, sData] = await Promise.all([
            api(`/api/cabanas/${id}`),
            fetchServicios().catch(() => []) // Si falla servicios, no rompe la página
        ]);
        setCabana(cData);
        setServiciosDb(sData);
      } catch (e) {
        console.error(e);
        setErr(e.message || "Error cargando datos.");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id]);

  // Sincronizar URL
  useEffect(() => {
    const params = {};
    if (desde) params.desde = desde;
    if (hasta) params.hasta = hasta;
    if (huespedes) params.huespedes = huespedes;
    setQs(params, { replace: true });
  }, [desde, hasta, huespedes, setQs]);

  // --- LÓGICA DE SERVICIOS ---
  
  // Manejar botones + / -
  const handleServiceChange = (servicioId, delta) => {
    setSeleccionados(prev => {
        const current = prev[servicioId] || 0;
        const nuevo = Math.max(0, current + delta);
        const copy = { ...prev, [servicioId]: nuevo };
        if (nuevo === 0) delete copy[servicioId]; // Limpiar si es 0
        return copy;
    });
  };

  // Calcular total de servicios
  const costoServicios = useMemo(() => {
    let total = 0;
    Object.entries(seleccionados).forEach(([sId, cant]) => {
        const serv = serviciosDb.find(s => s.id === Number(sId));
        if (serv) total += serv.precio * cant;
    });
    return total;
  }, [seleccionados, serviciosDb]);


  // --- LÓGICA DE GALERÍA ---
  const galeria = useMemo(() => {
    if (!cabana) return [];
    let imgs = [];
    if (cabana.imagen_url) imgs.push(cabana.imagen_url);
    if (Array.isArray(cabana.imagenes)) {
        cabana.imagenes.forEach(img => {
            const ruta = img.ruta_archivo || img.ruta;
            if (ruta) {
                const fullUrl = ruta.startsWith("http") ? ruta : `${API_URL}/storage/${ruta}`;
                imgs.push(fullUrl);
            }
        });
    }
    imgs = [...new Set(imgs)].filter(Boolean);
    if (imgs.length === 0) return [IMG_FALLBACK];
    return imgs;
  }, [cabana]);


  // --- ACCIÓN RESERVAR ---
  async function reservar() {
    if (saving) return;

    if (!desde || !hasta) {
        toast.error("Selecciona fechas de llegada y salida.");
        return;
    }
    if (noches < 1) {
        toast.error("Fechas inválidas.");
        return;
    }

    const backTo = `/cabanas/${id}?desde=${desde}&hasta=${hasta}&huespedes=${huespedes}`;
    const token = localStorage.getItem("auth_token") || localStorage.getItem("token");

    if (!token) {
      toast.error("Inicia sesión para continuar.");
      navigate(`/login?redirect=${encodeURIComponent(backTo)}`);
      return;
    }

    try {
      setSaving(true);
      
      // Armamos el array de servicios para el backend
      const serviciosParaEnviar = Object.entries(seleccionados).map(([sId, cant]) => {
          const s = serviciosDb.find(x => x.id === Number(sId));
          return {
              id: s.id,
              cantidad: cant,
              precio: s.precio // Enviamos precio para asegurar (o el back lo busca)
          };
      });

      // Calculamos totales finales
      const costoAlojamiento = Number(cabana.precio_noche) * noches;
      const granTotal = costoAlojamiento + costoServicios;

      const payload = {
        cabana_id: cabana.id,
        fecha_inicio: desde,
        fecha_fin: hasta,
        cantidad_personas: huespedes,
        con_mascotas: withPets,
        monto_total: granTotal,      // <--- Enviamos totales
        monto_servicios: costoServicios,
        servicios: serviciosParaEnviar // <--- Enviamos el array
      };

      // 1. Preview
      const preview = await previewReserva(payload);
      if (!preview.disponible) {
        toast.error(preview.mensaje || "Fechas no disponibles.");
        return;
      }

      // 2. Crear
      await createReserva(payload);
      toast.success("¡Reserva creada exitosamente!");
      navigate("/cuenta", { replace: true }); 

    } catch (e) {
      console.error(e);
      toast.error(e.message || "Error al procesar reserva.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Cargando...</div>;
  if (err || !cabana) return <div className="min-h-screen flex items-center justify-center text-red-600 bg-slate-50">{err || "Cabaña no encontrada"}</div>;

  const precioNoche = Number(cabana.precio_noche);
  const costoAlojamiento = noches * precioNoche;
  const granTotal = costoAlojamiento + costoServicios;

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        
        {/* HEADER Y GALERÍA (Igual que antes) */}
        <section className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{cabana.nombre}</h1>
            <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="font-semibold text-slate-800">{cabana.zona}</span>
                <span>•</span>
                <span>{cabana.metros_cuadrados ? `${cabana.metros_cuadrados} m²` : "Vista al bosque"}</span>
            </div>
        </section>

        {/* Galería Mosaico */}
        <section className="mb-10 rounded-2xl overflow-hidden relative h-[300px] md:h-[450px]">
            {galeria.length === 1 && <img src={galeria[0]} className="w-full h-full object-cover" alt="Main" />}
            {galeria.length >= 2 && (
                <div className={`grid gap-2 h-full ${galeria.length >= 4 ? 'grid-cols-4 grid-rows-2' : 'grid-cols-2'}`}>
                    <div className={`${galeria.length >= 4 ? 'col-span-2 row-span-2' : ''} h-full`}>
                        <img src={galeria[0]} className="w-full h-full object-cover cursor-pointer hover:opacity-95" alt="1" />
                    </div>
                    {galeria.slice(1, 5).map((src, i) => (
                        <div key={i} className="hidden md:block h-full">
                            <img src={src} className="w-full h-full object-cover cursor-pointer hover:opacity-95" alt={`Img ${i}`} />
                        </div>
                    ))}
                </div>
            )}
        </section>

        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-12">
            
            {/* COLUMNA IZQUIERDA */}
            <div className="space-y-8">
                {/* Resumen */}
                <div className="flex justify-between border-b pb-6">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-800">Cabaña completa</h2>
                        <p className="text-slate-500">Capacidad para {cabana.capacidad} personas</p>
                    </div>
                    <div className="flex gap-6 text-slate-700">
                        <div className="text-center"><span className="block text-xl">🛏️</span><span className="text-xs">{cabana.dormitorios} Dorm.</span></div>
                        <div className="text-center"><span className="block text-xl">🚿</span><span className="text-xs">{cabana.banos} Baño</span></div>
                    </div>
                </div>

                {/* Descripción */}
                <div>
                    <h3 className="font-semibold text-lg text-slate-900 mb-2">Acerca de este alojamiento</h3>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-line text-sm md:text-base">
                        {cabana.descripcion}
                    </p>
                </div>

                {/* --- SECCIÓN NUEVA: SERVICIOS ADICIONALES --- */}
                {serviciosDb.length > 0 && (
                    <div className="border-t pt-8">
                        <h3 className="font-bold text-xl text-slate-900 mb-4">Complementa tu estadía (Extras)</h3>
                        <p className="text-slate-500 text-sm mb-6">Selecciona servicios opcionales para mejorar tu experiencia.</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {serviciosDb.map(srv => {
                                const qty = seleccionados[srv.id] || 0;
                                return (
                                    <div key={srv.id} className={`border rounded-xl p-4 flex flex-col justify-between transition-all ${qty > 0 ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-200'}`}>
                                        <div className="mb-3">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-bold text-slate-800">{srv.nombre}</h4>
                                                <span className="text-sm font-semibold text-emerald-700">{money(srv.precio)}</span>
                                            </div>
                                            <p className="text-xs text-slate-500 line-clamp-2" title={srv.descripcion}>
                                                {srv.descripcion || "Servicio adicional"}
                                            </p>
                                        </div>
                                        
                                        <div className="flex items-center justify-between mt-auto pt-2">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{srv.tipo || "Extra"}</span>
                                            <div className="flex items-center gap-3 bg-white rounded-lg border border-slate-200 px-2 py-1 shadow-sm">
                                                <button 
                                                    onClick={() => handleServiceChange(srv.id, -1)}
                                                    className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-600 font-bold disabled:opacity-30"
                                                    disabled={qty === 0}
                                                >
                                                    -
                                                </button>
                                                <span className="w-4 text-center font-bold text-slate-800">{qty}</span>
                                                <button 
                                                    onClick={() => handleServiceChange(srv.id, 1)}
                                                    className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-100 text-emerald-600 font-bold"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>


            {/* COLUMNA DERECHA: STICKY RESERVA */}
            <div className="relative">
                <div className="sticky top-24 border shadow-xl rounded-xl p-6 bg-white z-10">
                    
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <span className="text-2xl font-bold text-slate-900">{money(precioNoche)}</span>
                            <span className="text-slate-500 text-sm"> / noche</span>
                        </div>
                    </div>

                    {/* Inputs */}
                    <div className="border border-slate-300 rounded-lg mb-4 overflow-hidden">
                        <div className="grid grid-cols-2 border-b border-slate-300">
                            <div className="p-2 border-r border-slate-300">
                                <label className="block text-[10px] font-bold uppercase text-slate-800">Llegada</label>
                                <input type="date" className="w-full text-sm outline-none text-slate-600 bg-transparent cursor-pointer" value={desde} onChange={(e) => setDesde(e.target.value)} />
                            </div>
                            <div className="p-2">
                                <label className="block text-[10px] font-bold uppercase text-slate-800">Salida</label>
                                <input type="date" className="w-full text-sm outline-none text-slate-600 bg-transparent cursor-pointer" value={hasta} onChange={(e) => setHasta(e.target.value)} />
                            </div>
                        </div>
                    {/* Dentro de CabanaDetalle.jsx */}

                    {/* Dentro de CabanaDetalle.jsx */}

                    <div className="p-2">
                        <label className="block text-[10px] font-bold uppercase text-slate-800">Huéspedes</label>
                        <select 
                            className="w-full text-sm outline-none bg-transparent py-1 cursor-pointer font-medium text-slate-600"
                            value={huespedes}
                            onChange={(e) => setHuespedes(Number(e.target.value))}
                        >
                            {/* CANDADO 3: Solo mostrar opciones hasta la capacidad máxima */}
                            {[...Array(cabana.capacidad || 1)].map((_, i) => (
                                <option key={i} value={i + 1}>{i + 1} huésped{i > 0 && 'es'}</option>
                            ))}
                        </select>
                    </div>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                        <input type="checkbox" id="mascotas" className="rounded text-emerald-600" checked={withPets} onChange={(e) => setWithPets(e.target.checked)} />
                        <label htmlFor="mascotas" className="text-xs text-slate-600 font-medium cursor-pointer">Viajo con mascota</label>
                    </div>

                    <button 
                        onClick={reservar}
                        disabled={saving}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition-all mb-4 disabled:opacity-70 shadow-md shadow-emerald-200"
                    >
                        {saving ? "Procesando..." : "Reservar ahora"}
                    </button>

                    {/* Desglose de Precios */}
                    {noches > 0 && (
                        <div className="space-y-2 border-t pt-4 text-sm text-slate-600">
                            <div className="flex justify-between">
                                <span className="underline decoration-slate-300 decoration-dotted">Estadía ({noches} noches)</span>
                                <span>{money(costoAlojamiento)}</span>
                            </div>
                            
                            {/* Mostrar Servicios si hay seleccionados */}
                            {costoServicios > 0 && (
                                <div className="flex justify-between text-emerald-700 font-medium">
                                    <span>Servicios adicionales</span>
                                    <span>+ {money(costoServicios)}</span>
                                </div>
                            )}

                            <div className="flex justify-between font-bold text-slate-900 border-t pt-3 mt-2 text-base">
                                <span>Total a pagar</span>
                                <span>{money(granTotal)}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}