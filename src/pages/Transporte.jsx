import { useState, useEffect, useRef } from "react";
import { fetchCabanas } from "../api"; 
import Header from "../components/Header";
import Footer from "../components/Footer";
import AddToReservationModal from "../components/AddToReservationModal"; 

import imgSedan from "../assets/img/sedan-estandar.jpg";
import imgMonovolumen from "../assets/img/monovolumen-familiar.jpg";
import imgMinibus from "../assets/img/minibus-van.jpg";

// DATOS CON IDs REALES DE BD (Imagen: 10, 11, 12)
const VEHICULOS = [
  { 
    id: 1, 
    dbId: 10, 
    nombre: "Transporte Sedan Estándar", 
    capacidad: 4, 
    maletas: 3, 
    precio: 25000, 
    imagen: imgSedan, 
    etiqueta: "Económico", 
    colorEtiqueta: "bg-emerald-600",
    descripcion: "Vehículo moderno y ágil, ideal para parejas o viajeros de negocios con equipaje ligero."
  },
  { 
    id: 2, 
    dbId: 11, 
    nombre: "Transporte Monovolumen Familiar", 
    capacidad: 6, 
    maletas: 5, 
    precio: 45000, 
    imagen: imgMonovolumen, 
    etiqueta: "Más popular", 
    colorEtiqueta: "bg-blue-600",
    descripcion: "Espacio extra y comodidad superior para toda la familia."
  },
  { 
    id: 3, 
    dbId: 12, 
    nombre: "Transporte Minibús Furgoneta", 
    capacidad: 10, 
    maletas: 10, 
    precio: 80000, 
    imagen: imgMinibus, 
    etiqueta: "Grupos grandes", 
    colorEtiqueta: "bg-amber-600",
    descripcion: "La solución perfecta para grupos grandes. Viajen todos juntos con total seguridad."
  },
];

const ORIGENES = [
  { id: "terminal", nombre: "Terminal de Buses Valdivia" },
  { id: "aeropuerto", nombre: "Aeropuerto Pichoy (ZAL)" },
  { id: "centro", nombre: "Plaza de la República (Centro)" },
];

export default function Transporte() {
  const [textoOrigen, setTextoOrigen] = useState("");
  const [textoDestino, setTextoDestino] = useState("");
  const [fechaIda, setFechaIda] = useState("");
  const [mostrarResultados, setMostrarResultados] = useState(false);
  
  const [selectedService, setSelectedService] = useState(null);

  const [openOrigen, setOpenOrigen] = useState(false);
  const [openDestino, setOpenDestino] = useState(false);
  const [cabanas, setCabanas] = useState([]);

  const origenWrapperRef = useRef(null);
  const destinoWrapperRef = useRef(null);
  const fechaIdaRef = useRef(null);

  useEffect(() => {
    fetchCabanas().then((data) => setCabanas(data)).catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (origenWrapperRef.current && !origenWrapperRef.current.contains(event.target)) setOpenOrigen(false);
      if (destinoWrapperRef.current && !destinoWrapperRef.current.contains(event.target)) setOpenDestino(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBuscar = () => {
    if(!textoOrigen) return alert("Selecciona origen.");
    if(!textoDestino) return alert("Selecciona destino.");
    if(!fechaIda) return alert("Selecciona fecha.");
    setMostrarResultados(true);
  };

  const origenesFiltrados = ORIGENES.filter(o => o.nombre.toLowerCase().includes(textoOrigen.toLowerCase()));
  const destinosFiltrados = cabanas.filter(c => c.nombre.toLowerCase().includes(textoDestino.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 pt-12 pb-20">
        <div className="space-y-12">
          {!mostrarResultados && (
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-extrabold text-slate-800">Servicio de Transporte Privado 🚐</h1>
              <p className="text-lg text-slate-600 max-w-3xl mx-auto">Reserva tu traslado exclusivo desde puntos clave de Valdivia hasta la puerta de tu cabaña.</p>
            </div>
          )}

          <div className="bg-emerald-950 p-6 md:p-8 rounded-3xl shadow-2xl text-white w-full border border-emerald-900">
             <div className="bg-emerald-900 p-2 rounded-2xl flex flex-col lg:flex-row gap-2 relative z-20 shadow-inner">
                {/* ORIGEN */}
                <div className="relative flex-1 group" ref={origenWrapperRef}>
                  <div className="bg-white rounded-xl flex items-center px-4 h-16 relative hover:shadow-md transition-shadow">
                    <div className="flex flex-col justify-center flex-1 overflow-hidden">
                      <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider">Lugar de recogida</span>
                      <input type="text" className="w-full outline-none text-slate-800 text-sm font-bold placeholder:font-normal placeholder:text-slate-400" placeholder="Ej: Aeropuerto..." value={textoOrigen} onChange={(e) => { setTextoOrigen(e.target.value); setOpenOrigen(true); }} onFocus={() => setOpenOrigen(true)} />
                    </div>
                    {textoOrigen && <button onClick={() => setTextoOrigen("")} className="text-slate-400 font-bold">✕</button>}
                  </div>
                  {openOrigen && <div className="absolute top-full mt-2 left-0 w-full bg-white text-slate-800 rounded-xl shadow-xl py-2 z-50 max-h-60 overflow-y-auto">
                      {origenesFiltrados.map((opt) => <button key={opt.id} onClick={() => { setTextoOrigen(opt.nombre); setOpenOrigen(false); }} className="w-full text-left px-4 py-3 hover:bg-emerald-50 border-b border-slate-50 last:border-0 block">{opt.nombre}</button>)}
                  </div>}
                </div>

                {/* DESTINO */}
                <div className="relative flex-1" ref={destinoWrapperRef}>
                  <div className="bg-white rounded-xl flex items-center px-4 h-16 relative hover:shadow-md transition-shadow">
                    <div className="flex flex-col justify-center flex-1 overflow-hidden">
                      <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider">Destino</span>
                      <input type="text" className="w-full outline-none text-slate-800 text-sm font-bold placeholder:font-normal placeholder:text-slate-400" placeholder="Ej: Cabaña..." value={textoDestino} onChange={(e) => { setTextoDestino(e.target.value); setOpenDestino(true); }} onFocus={() => setOpenDestino(true)} />
                    </div>
                    {textoDestino && <button onClick={() => setTextoDestino("")} className="text-slate-400 font-bold">✕</button>}
                  </div>
                   {openDestino && <div className="absolute top-full mt-2 left-0 w-full bg-white text-slate-800 rounded-xl shadow-xl py-2 z-50 max-h-60 overflow-y-auto">
                      {destinosFiltrados.map((c) => <button key={c.id} onClick={() => { setTextoDestino(c.nombre); setOpenDestino(false); }} className="w-full text-left px-4 py-3 hover:bg-emerald-50 border-b border-slate-50 last:border-0 block">{c.nombre}</button>)}
                  </div>}
                </div>

                {/* FECHA */}
                <div onClick={() => fechaIdaRef.current?.showPicker()} className="bg-white rounded-xl flex items-center px-4 h-16 w-full lg:w-48 cursor-pointer relative">
                     <div className="flex flex-col justify-center w-full">
                        <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider">Fecha</span>
                        <input ref={fechaIdaRef} type="date" className="sr-only" onChange={(e) => setFechaIda(e.target.value)} value={fechaIda} />
                        <span className="text-sm font-bold text-slate-800">{fechaIda || "Seleccionar"}</span>
                     </div>
                </div>

                <button onClick={handleBuscar} className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold px-8 rounded-xl text-lg transition-colors h-16 w-full lg:w-auto shadow-lg">Buscar</button>
             </div>
          </div>

          {mostrarResultados && (
              <div className="animate-fade-in-up space-y-6 mt-12">
                <h2 className="text-2xl font-bold text-slate-800 border-l-4 border-amber-500 pl-4">Vehículos Disponibles</h2>
                {VEHICULOS.map((v) => (
                    <div key={v.id} className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row gap-8 hover:shadow-2xl transition-all duration-300">
                        <div className="w-full md:w-1/4 flex flex-col items-center justify-center bg-slate-50 rounded-xl p-4 border border-slate-100">
                            <img src={v.imagen} alt={v.nombre} className="w-full h-40 object-cover rounded-lg" />
                        </div>
                        
                        <div className="flex-1 py-2">
                            <div className="flex justify-between items-start">
                                <h3 className="text-2xl font-bold text-slate-800">{v.nombre}</h3>
                                {v.etiqueta && (<span className={`${v.colorEtiqueta} text-white text-[10px] uppercase font-bold px-3 py-1.5 rounded-full shadow-sm`}>{v.etiqueta}</span>)}
                            </div>
                            <p className="mt-4 text-sm text-slate-500 leading-relaxed border-l-2 border-amber-200 pl-3">{v.descripcion}</p>
                        </div>
                        
                        <div className="w-full md:w-1/4 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8 flex flex-col justify-center text-right bg-slate-50/50 rounded-r-2xl">
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Precio Servicio</p>
                            <p className="text-3xl font-extrabold text-emerald-700 my-1">${new Intl.NumberFormat('es-CL').format(v.precio)}</p>
                            <button 
                                onClick={() => setSelectedService(v)} 
                                className="w-full bg-slate-900 hover:bg-emerald-600 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md transform hover:-translate-y-0.5"
                            >
                                Contratar
                            </button>
                        </div>
                    </div>
                ))}
              </div>
            )}
        </div>
      </main>
      <Footer />

      {selectedService && (
        <AddToReservationModal serviceToAdd={selectedService} onClose={() => setSelectedService(null)} />
      )}
    </div>
  );
}