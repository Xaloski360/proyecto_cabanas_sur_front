import { useState, useEffect, useRef } from "react";
import { fetchCabanas } from "../api"; 
import Header from "../components/Header";
import Footer from "../components/Footer";

// =========================================================
// 1. IMPORTACIÓN DE IMÁGENES DE VEHÍCULOS
// =========================================================
import imgSedan from "../assets/img/sedan-estandar.jpg";
import imgMonovolumen from "../assets/img/monovolumen-familiar.jpg";
import imgMinibus from "../assets/img/minibus-van.jpg";

// =========================================================
// 2. DATOS DE VEHÍCULOS (Actualizados)
// =========================================================
const VEHICULOS = [
  { 
    id: 1, 
    nombre: "Sedan Estándar", 
    capacidad: 4, 
    maletas: 3, 
    precio: 25000, 
    imagen: imgSedan, // Imagen importada
    etiqueta: "Económico", 
    colorEtiqueta: "bg-emerald-600",
    // Nueva descripción específica
    descripcion: "Vehículo moderno y ágil, ideal para parejas o viajeros de negocios con equipaje ligero. Disfruta de un traslado rápido y confortable con aire acondicionado."
  },
  { 
    id: 2, 
    nombre: "Monovolumen Familiar", 
    capacidad: 6, 
    maletas: 5, 
    precio: 45000, 
    imagen: imgMonovolumen, // Imagen importada
    etiqueta: "Más popular", 
    colorEtiqueta: "bg-blue-600",
    // Nueva descripción específica
    descripcion: "Espacio extra y comodidad superior para toda la familia. Cuenta con amplio maletero para equipaje de vacaciones y asientos reclinables para un viaje relajado."
  },
  { 
    id: 3, 
    nombre: "Minibús Van", 
    capacidad: 10, 
    maletas: 10, 
    precio: 80000, 
    imagen: imgMinibus, // Imagen importada
    etiqueta: "Grupos grandes", 
    colorEtiqueta: "bg-amber-600",
    // Nueva descripción específica
    descripcion: "La solución perfecta para grupos grandes. Amplio espacio interior, techo alto y capacidad para todo el equipaje. Viajen todos juntos con total seguridad."
  },
];

const ORIGENES = [
  { id: "terminal", nombre: "Terminal de Buses Valdivia" },
  { id: "aeropuerto", nombre: "Aeropuerto Pichoy (ZAL)" },
  { id: "centro", nombre: "Plaza de la República (Centro)" },
];

export default function Transporte() {
  const [tipoViaje, setTipoViaje] = useState("ida");
  const [origenId, setOrigenId] = useState("");
  const [textoOrigen, setTextoOrigen] = useState("");
  const [destinoId, setDestinoId] = useState("");
  const [textoDestino, setTextoDestino] = useState("");
  const [fechaIda, setFechaIda] = useState("");
  const [fechaVuelta, setFechaVuelta] = useState("");
  const [pasajeros, setPasajeros] = useState(2);
  const [cabanas, setCabanas] = useState([]);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [openOrigen, setOpenOrigen] = useState(false);
  const [openDestino, setOpenDestino] = useState(false);

  const origenWrapperRef = useRef(null);
  const destinoWrapperRef = useRef(null);
  const fechaIdaRef = useRef(null);
  const fechaVueltaRef = useRef(null);

  useEffect(() => {
    fetchCabanas().then((data) => setCabanas(data)).catch((err) => console.error(err));
  }, []);

  const handleBuscar = () => {
    if(!origenId) return alert("Por favor selecciona un lugar de recogida válido.");
    if(!destinoId) return alert("Por favor selecciona una cabaña de destino.");
    if(!fechaIda) return alert("Debes seleccionar una fecha de ida.");
    setMostrarResultados(true);
  };

  const abrirCalendario = (ref) => {
    if (ref.current && typeof ref.current.showPicker === 'function') ref.current.showPicker();
    else if (ref.current) ref.current.focus();
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (origenWrapperRef.current && !origenWrapperRef.current.contains(event.target)) setOpenOrigen(false);
      if (destinoWrapperRef.current && !destinoWrapperRef.current.contains(event.target)) setOpenDestino(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const limpiarOrigen = () => { setOrigenId(""); setTextoOrigen(""); setOpenOrigen(true); };
  const limpiarDestino = () => { setDestinoId(""); setTextoDestino(""); setOpenDestino(true); };

  const origenesFiltrados = ORIGENES.filter(o => o.nombre.toLowerCase().includes(textoOrigen.toLowerCase()));
  const destinosFiltrados = cabanas.filter(c => c.nombre.toLowerCase().includes(textoDestino.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 pt-12 pb-20">
        <div className="space-y-12">
          
          {/* TÍTULO */}
          {!mostrarResultados && (
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-extrabold text-slate-800">Servicio de Transporte Privado 🚐</h1>
              <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                Olvídate de las complicaciones. Reserva tu traslado exclusivo desde puntos clave de Valdivia hasta la puerta de tu cabaña.
              </p>
            </div>
          )}

          {/* WIDGET DE BÚSQUEDA */}
          <div className="bg-emerald-950 p-6 md:p-8 rounded-3xl shadow-2xl text-white w-full border border-emerald-900">
            
            {/* Opción Ida / Vuelta */}
            <div className="flex items-center gap-8 mb-6 ml-1">
                <label className="flex items-center gap-2 cursor-pointer hover:opacity-90 group">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${tipoViaje === "ida" ? "border-amber-400" : "border-emerald-400"}`}>
                    {tipoViaje === "ida" && <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />}
                  </div>
                  <input type="radio" name="tipoViaje" checked={tipoViaje === "ida"} onChange={() => { setTipoViaje("ida"); setFechaVuelta(""); }} className="hidden" />
                  <span className={`text-sm font-bold tracking-wide ${tipoViaje === "ida" ? "text-amber-400" : "text-emerald-100"}`}>SOLO IDA</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer hover:opacity-90 group">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${tipoViaje === "ida-vuelta" ? "border-amber-400" : "border-emerald-400"}`}>
                    {tipoViaje === "ida-vuelta" && <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />}
                  </div>
                  <input type="radio" name="tipoViaje" checked={tipoViaje === "ida-vuelta"} onChange={() => setTipoViaje("ida-vuelta")} className="hidden" />
                  <span className={`text-sm font-bold tracking-wide ${tipoViaje === "ida-vuelta" ? "text-amber-400" : "text-emerald-100"}`}>IDA Y VUELTA</span>
                </label>
            </div>

              {/* BARRA DE INPUTS */}
              <div className="bg-emerald-900 p-2 rounded-2xl flex flex-col lg:flex-row gap-2 relative z-20 shadow-inner">
                
                {/* 1. ORIGEN */}
                <div className="relative flex-1 group" ref={origenWrapperRef}>
                  <div className="bg-white rounded-xl flex items-center px-4 h-16 relative hover:shadow-md transition-shadow">
                    <span className="text-emerald-600 mr-3 text-xl"></span>
                    <div className="flex flex-col justify-center flex-1 overflow-hidden">
                      <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider">Lugar de recogida</span>
                      <input type="text" className="w-full outline-none text-slate-800 text-sm font-bold placeholder:font-normal placeholder:text-slate-400" placeholder="Ej: Aeropuerto..." value={textoOrigen} onChange={(e) => { setTextoOrigen(e.target.value); setOrigenId(""); setOpenOrigen(true); }} onFocus={() => { setOpenOrigen(true); setOpenDestino(false); }} />
                    </div>
                    {textoOrigen && (<button onClick={limpiarOrigen} className="w-6 h-6 rounded-full hover:bg-slate-200 text-slate-400 flex items-center justify-center text-sm font-bold">✕</button>)}
                  </div>
                  {openOrigen && (
                    <div className="absolute top-full mt-2 left-0 w-full bg-white text-slate-800 rounded-xl shadow-xl py-2 z-50 border border-slate-200 max-h-60 overflow-y-auto">
                      {origenesFiltrados.length > 0 ? (origenesFiltrados.map((opt) => (<button key={opt.id} onClick={() => { setOrigenId(opt.id); setTextoOrigen(opt.nombre); setOpenOrigen(false); }} className="w-full text-left px-4 py-3 hover:bg-emerald-50 flex items-center gap-3 border-b border-slate-50 last:border-0"><span className="bg-emerald-100 text-emerald-600 p-2 rounded-full text-lg">🚌</span><p className="font-semibold text-sm">{opt.nombre}</p></button>))) : (<div className="px-4 py-3 text-sm text-slate-500">No hay resultados</div>)}
                    </div>
                  )}
                </div>

                {/* 2. DESTINO */}
                <div className="relative flex-1" ref={destinoWrapperRef}>
                  <div className="bg-white rounded-xl flex items-center px-4 h-16 relative hover:shadow-md transition-shadow">
                    <span className="text-emerald-600 mr-3 text-xl"></span>
                    <div className="flex flex-col justify-center flex-1 overflow-hidden">
                      <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider">Destino</span>
                      <input type="text" className="w-full outline-none text-slate-800 text-sm font-bold placeholder:font-normal placeholder:text-slate-400" placeholder="Ej: Cabaña..." value={textoDestino} onChange={(e) => { setTextoDestino(e.target.value); setDestinoId(""); setOpenDestino(true); }} onFocus={() => { setOpenDestino(true); setOpenOrigen(false); }} />
                    </div>
                    {textoDestino && (<button onClick={limpiarDestino} className="w-6 h-6 rounded-full hover:bg-slate-200 text-slate-400 flex items-center justify-center text-sm font-bold">✕</button>)}
                  </div>
                   {openDestino && (
                    <div className="absolute top-full mt-2 left-0 w-full bg-white text-slate-800 rounded-xl shadow-xl py-2 z-50 border border-slate-200 max-h-80 overflow-y-auto">
                      {destinosFiltrados.length > 0 ? (destinosFiltrados.map((c) => (<button key={c.id} onClick={() => { setDestinoId(c.id); setTextoDestino(c.nombre); setOpenDestino(false); }} className="w-full text-left px-4 py-3 hover:bg-emerald-50 flex items-center gap-3 border-b border-slate-50 last:border-0"><div className="w-10 h-10 rounded bg-slate-200 overflow-hidden flex-shrink-0">{c.imagen_url ? (<img src={c.imagen_url} alt="" className="w-full h-full object-cover" />) : (<span className="grid place-content-center h-full text-xs">🏠</span>)}</div><div><p className="font-semibold text-sm">{c.nombre}</p><p className="text-xs text-slate-500">Capacidad: {c.capacidad} pax</p></div></button>))) : (<div className="px-4 py-3 text-sm text-slate-500">{cabanas.length === 0 ? "Cargando..." : "No hay cabañas"}</div>)}
                    </div>
                  )}
                </div>

                {/* 3. FECHA IDA */}
                <div onClick={() => abrirCalendario(fechaIdaRef)} className="bg-white rounded-xl flex items-center px-4 h-16 w-full lg:w-48 relative cursor-pointer hover:shadow-md transition-shadow">
                  <span className="text-emerald-600 mr-3 text-xl"></span>
                  <div className="flex flex-col justify-center w-full">
                     <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider">Fecha Ida</span>
                     <input ref={fechaIdaRef} type="date" className="sr-only" onChange={(e) => setFechaIda(e.target.value)} value={fechaIda} />
                     <span className={`text-sm font-bold truncate ${!fechaIda ? 'text-slate-400 font-normal' : 'text-slate-800'}`}>{fechaIda ? new Date(fechaIda + "T12:00:00").toLocaleDateString('es-CL', { day: '2-digit', month: 'short' }) : "Agrega fecha"}</span>
                  </div>
                </div>

                {/* 4. FECHA VUELTA */}
                <div onClick={() => tipoViaje === 'ida-vuelta' && abrirCalendario(fechaVueltaRef)} className={`bg-white rounded-xl flex items-center px-4 h-16 w-full lg:w-48 relative transition-all ${tipoViaje === 'ida' ? 'bg-slate-200 cursor-not-allowed opacity-70' : 'cursor-pointer hover:shadow-md'}`}>
                  <span className="text-emerald-600 mr-3 text-xl"></span>
                  <div className="flex flex-col justify-center w-full">
                     <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider">Fecha Vuelta</span>
                     {tipoViaje === 'ida-vuelta' && (<input ref={fechaVueltaRef} type="date" min={fechaIda} className="sr-only" onChange={(e) => setFechaVuelta(e.target.value)} value={fechaVuelta} />)}
                     <span className={`text-sm font-bold truncate ${!fechaVuelta && tipoViaje !== 'ida' ? 'text-slate-400 font-normal' : 'text-slate-800'}`}>{tipoViaje === 'ida' ? "Solo ida" : (fechaVuelta ? new Date(fechaVuelta + "T12:00:00").toLocaleDateString('es-CL', { day: '2-digit', month: 'short' }) : "Agrega fecha")}</span>
                  </div>
                </div>

                {/* 5. PASAJEROS */}
                <div className="bg-white rounded-xl flex items-center px-4 h-16 w-full lg:w-28 relative cursor-pointer hover:shadow-md transition-shadow">
                  <span className="text-emerald-600 mr-3 text-xl"></span>
                  <select value={pasajeros} onChange={(e) => setPasajeros(e.target.value)} className="w-full h-full bg-transparent outline-none font-bold text-slate-800 text-sm appearance-none cursor-pointer z-10">
                    {[1,2,3,4,5,6,7,8,9,10].map(num => (<option key={num} value={num}>{num}</option>))}
                  </select>
                   <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                </div>

                {/* BOTÓN BUSCAR */}
                <button onClick={handleBuscar} className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold px-8 rounded-xl text-lg transition-colors h-16 w-full lg:w-auto min-w-[140px] shadow-lg hover:shadow-xl transform active:scale-95">
                  Buscar
                </button>
              </div>
          </div>

          {/* RESULTADOS CON NUEVA INFO */}
          {mostrarResultados && (
              <div className="animate-fade-in-up space-y-6 mt-12">
                <h2 className="text-2xl font-bold text-slate-800 border-l-4 border-amber-500 pl-4">Resultados para tu viaje</h2>
                {VEHICULOS.map((v) => (
                    <div key={v.id} className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row gap-8 hover:shadow-2xl transition-all duration-300">
                        {/* IMAGEN DEL VEHÍCULO */}
                        <div className="w-full md:w-1/4 flex flex-col items-center justify-center bg-slate-50 rounded-xl p-4 border border-slate-100">
                            <img src={v.imagen} alt={v.nombre} className="w-full h-40 object-cover rounded-lg" />
                            <span className="mt-2 text-xs text-slate-400 font-bold uppercase tracking-widest">Imagen referencial</span>
                        </div>
                        
                        {/* INFO VEHÍCULO */}
                        <div className="flex-1 py-2">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-2xl font-bold text-slate-800">{v.nombre}</h3>
                                    {v.etiqueta && (<span className={`${v.colorEtiqueta} text-white text-[10px] uppercase font-bold px-3 py-1.5 rounded-full shadow-sm`}>{v.etiqueta}</span>)}
                                </div>
                                <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
                                    <span className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-lg">👤 <strong>{v.capacidad}</strong>pasajeros</span>
                                    <span className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-lg">🧳 <strong>{v.maletas}</strong> maletas</span>
                                    <span className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-lg">✔ Cancelación gratis</span>
                                </div>
                                
                                {/* NUEVA DESCRIPCIÓN ESPECÍFICA */}
                                <p className="mt-5 text-sm text-slate-500 leading-relaxed border-l-2 border-amber-200 pl-3">
                                  {v.descripcion}
                                </p>
                        </div>
                        
                        <div className="w-full md:w-1/4 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8 flex flex-col justify-center text-right bg-slate-50/50 rounded-r-2xl">
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Precio por trayecto</p>
                            <p className="text-3xl font-extrabold text-emerald-700 my-1">${new Intl.NumberFormat('es-CL').format(v.precio)}</p>
                            <button className="w-full bg-slate-900 hover:bg-emerald-600 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md transform hover:-translate-y-0.5">Seleccionar</button>
                        </div>
                    </div>
                ))}
              </div>
            )}

            {/* BENEFICIOS */}
            {!mostrarResultados && (
                <div className="grid md:grid-cols-3 gap-8 pt-4">
                    <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center shadow-sm hover:shadow-lg transition-shadow">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 text-3xl shadow-sm">⏰</div>
                        <h3 className="font-bold text-slate-800 text-lg">Puntualidad</h3>
                        <p className="text-slate-500 mt-2 leading-relaxed">Monitoreamos tu vuelo. Te esperamos aunque se retrase sin costo adicional.</p>
                    </div>
                    <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center shadow-sm hover:shadow-lg transition-shadow">
                        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-5 text-3xl shadow-sm">🛡️</div>
                        <h3 className="font-bold text-slate-800 text-lg">Seguridad Total</h3>
                        <p className="text-slate-500 mt-2 leading-relaxed">Vehículos modernos sanitizados, sillas de bebé disponibles y seguro de pasajeros incluido.</p>
                    </div>
                    <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center shadow-sm hover:shadow-lg transition-shadow">
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-5 text-3xl shadow-sm">💳</div>
                        <h3 className="font-bold text-slate-800 text-lg">Pago Flexible</h3>
                        <p className="text-slate-500 mt-2 leading-relaxed">Paga fácilmente al conductor en efectivo, transferencia o agrégalo a tu cuenta del Lodge.</p>
                    </div>
                </div>
            )}
        </div>
      </main>
      <Footer />
    </div>
  );
}