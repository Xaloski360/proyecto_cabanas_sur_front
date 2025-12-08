import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fetchDisponibilidad, fetchCabanas } from "../api";
import Header from "../components/Header";
import Footer from "../components/Footer";
import toast from "react-hot-toast";

// IMÁGENES LOCALES
import imgCabana1 from "../assets/img/cabana-1.jpg";
import imgCabana2 from "../assets/img/cabana-2.jpg";
import imgCabana3 from "../assets/img/cabana-3.jpg";
import imgCabana4 from "../assets/img/cabana-4.jpg";

export default function Disponibilidad() {
  const [qs] = useSearchParams();
  const navigate = useNavigate();

  const hasParams = qs.has("desde") && qs.has("hasta");

  const [desde, setDesde] = useState(qs.get("desde") || "");
  const [hasta, setHasta] = useState(qs.get("hasta") || "");
  const [huespedes, setHuespedes] = useState(Number(qs.get("huespedes") || 2));

  const [loading, setLoading] = useState(false);
  const [listaCabanas, setListaCabanas] = useState([]); 
  const [err, setErr] = useState("");

  useEffect(() => {
    if (hasParams) {
      buscarDisponibilidad();
    } else {
      cargarCatalogo();
    }
    // eslint-disable-next-line
  }, [hasParams]);

  async function cargarCatalogo() {
    try {
      setLoading(true);
      const data = await fetchCabanas();
      setListaCabanas(data); 
    } catch (error) {
      console.error(error);
      setErr("No se pudo cargar el catálogo.");
    } finally {
      setLoading(false);
    }
  }

  async function buscarDisponibilidad(e) {
    if (e) e.preventDefault();
    if (!desde || !hasta) {
      toast.error("Debes seleccionar fecha de inicio y término.");
      return;
    }

    try {
      setLoading(true);
      setErr("");
      const data = await fetchDisponibilidad(desde, hasta, huespedes);
      setListaCabanas(data.cabanas);
      
      const params = new URLSearchParams({ desde, hasta, huespedes: String(huespedes) }).toString();
      navigate(`/disponibilidad?${params}`, { replace: true });
    } catch (error) {
      console.error(error);
      setErr("No se pudo obtener disponibilidad.");
    } finally {
      setLoading(false);
    }
  }

  function irADetalle(cabanaId) {
    let url = `/cabanas/${cabanaId}`;
    if (desde && hasta) {
      url += `?desde=${encodeURIComponent(desde)}&hasta=${encodeURIComponent(hasta)}&huespedes=${huespedes}`;
    }
    navigate(url);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        
        {/* ENCABEZADO Y FILTRO */}
        <div className="flex flex-col md:flex-row gap-6 mb-8 items-start md:items-end justify-between">
          
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800">
              {hasParams ? "Resultados de búsqueda" : "Nuestras Cabañas"}
            </h1>
            {/* DESCRIPCIÓN CONSERVADA */}
            <p className="text-slate-500 mt-1">
              {hasParams 
                ? `Mostrando disponibilidad del ${desde} al ${hasta}`
                : "Explora nuestra colección de refugios en la hermosa Valdivia y sus alrededores."}
            </p>
          </div>

          <form onSubmit={buscarDisponibilidad} className="bg-white p-2 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-2 items-center">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 px-2 uppercase">Llegada</span>
              <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className="text-sm font-semibold text-slate-700 outline-none px-2 bg-transparent" />
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 px-2 uppercase">Salida</span>
              <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className="text-sm font-semibold text-slate-700 outline-none px-2 bg-transparent" />
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            {/* CAMBIO AQUÍ: Pax -> Huéspedes */}
            <div className="flex flex-col w-24">
              <span className="text-[10px] font-bold text-slate-400 px-2 uppercase">Huéspedes</span>
              <input type="number" min={1} value={huespedes} onChange={(e) => setHuespedes(Number(e.target.value))} className="text-sm font-semibold text-slate-700 outline-none px-2 bg-transparent" />
            </div>
            <button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 py-2 font-bold transition-colors ml-2">
              {loading ? "..." : "Buscar"}
            </button>
          </form>
        </div>

        {/* ESTADOS */}
        {loading && (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-slate-500">Cargando cabañas...</p>
          </div>
        )}

        {err && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-center">
            {err} <button onClick={() => window.location.reload()} className="underline font-bold ml-2">Reintentar</button>
          </div>
        )}

        {/* GRILLA DE CABAÑAS */}
        {!loading && !err && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {listaCabanas.length > 0 ? (
              listaCabanas.map((cabana, index) => {
                
                const tienePrecio = cabana.precio_noche > 0;
                const precioDisplay = tienePrecio 
                  ? `$${Number(cabana.precio_noche).toLocaleString("es-CL")}` 
                  : "Consultar";

                const esDisponible = hasParams ? !!cabana.disponible : true;

                // --- OVERRIDES ---
                let imagenFinal = cabana.imagen_url || imgCabana1;
                let nombreFinal = cabana.nombre;
                let descripcionFinal = cabana.descripcion; 

                // LÓGICA DE NOMBRES PLURALES Y ZONAS
                if (index === 0) {
                    imagenFinal = imgCabana1;
                    nombreFinal = "Cabañas Alerce";
                    descripcionFinal = "Conjunto de 4 cabañas ubicadas a minutos del centro de Valdivia. Ofrecen la mezcla perfecta entre la vida urbana y la tranquilidad del río Calle-Calle.";
                } else if (index === 1) {
                    imagenFinal = imgCabana2;
                    nombreFinal = "Cabañas Coihue";
                    descripcionFinal = "Complejo de 4 cabañas emplazadas en el sector de Niebla. Disfruta de la brisa marina y la historia de los fuertes, ideal para desconectarse mirando el océano.";
                } else if (index === 2) {
                    imagenFinal = imgCabana3;
                    nombreFinal = "Cabañas Arrayán";
                    descripcionFinal = "4 refugios inmersos en la selva valdiviana costera de Curiñanco. Rodeadas de bosque nativo y playas vírgenes para los amantes del trekking.";
                } else if (index === 3) {
                    imagenFinal = imgCabana4;
                    nombreFinal = "Cabañas Lenga";
                    descripcionFinal = "4 cabañas para vivir la tradición en Punucapa. Entorno rural, humedales y cercanía al santuario de la naturaleza, perfecto para el avistamiento de aves.";
                }

                return (
                  <article key={cabana.id} className={`group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100 flex flex-col ${!esDisponible ? 'opacity-60 grayscale' : ''}`}>
                    
                    {/* Imagen */}
                    <div className="relative h-64 overflow-hidden">
                      <img src={imagenFinal} alt={nombreFinal} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      {!esDisponible && (
                        <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                          <span className="bg-slate-800 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">No Disponible</span>
                        </div>
                      )}
                      {esDisponible && hasParams && (
                        <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                          Disponible
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <h2 className="text-xl font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">{nombreFinal}</h2>
                        <div className="flex items-center gap-1 text-slate-400 text-sm"><span>👥</span> {cabana.capacidad}</div>
                      </div>
                      <p className="text-slate-500 text-sm line-clamp-4 mb-4 flex-1 leading-relaxed">{descripcionFinal}</p>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div className="flex flex-col">
                          {tienePrecio ? (<span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Por noche</span>) : (<span className="text-[10px] text-transparent uppercase font-bold tracking-wider select-none">.</span>)}
                          <span className="text-2xl font-bold text-slate-800">{precioDisplay}</span>
                        </div>
                        <button onClick={() => irADetalle(cabana.id)} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-emerald-600 transition-colors shadow-sm">Ver Detalles</button>
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="col-span-full py-20 text-center">
                <p className="text-xl text-slate-400 font-medium">No encontramos cabañas disponibles para estas fechas.</p>
                <button onClick={() => { setDesde(""); setHasta(""); }} className="mt-4 text-emerald-600 font-bold hover:underline">Ver todas las cabañas</button>
              </div>
            )}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}