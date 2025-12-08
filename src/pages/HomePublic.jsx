import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer"; 
import HeroCarousel from "../components/HeroCarousel";
import Reviews from "../components/Reviews";

// =========================================================
// 1. IMPORTACIÓN DE IMÁGENES
// =========================================================
import imgRio from "../assets/img/valdivia-rio.jpg";       
import imgParque from "../assets/img/parque-valdivia.jpg";
import imgCalle from "../assets/img/calle-valdivia.jpg";

// Galería
import imgCabana1 from "../assets/img/cabana-1.jpg";
import imgExperiencias from "../assets/img/experiencias.jpg";
import imgSelva from "../assets/img/valdivia-selva.jpg";
import imgPuente from "../assets/img/puente-valdivia.jpg";
import imgCascada from "../assets/img/cascada-valdivia.jpg"; 
import imgPanoramica from "../assets/img/panoramica-rio-valdivia.jpg";

// IMPORTAMOS LA IMAGEN PARA "SOBRE NOSOTROS"
import imgNiebla from "../assets/img/castillo-niebla.jpg";

// =========================================================
// 2. BANNERS
// =========================================================
const BANNERS = [
  { 
    src: imgRio, 
    alt: "Vista al Río Valdivia",
    title: "Conecta con la Naturaleza",
    description: "Despierta con el sonido del río y la brisa del bosque valdiviano en nuestras cabañas premium.",
    badge: "DESTINO SOSTENIBLE",
    ctaText: "Ver Disponibilidad",
    ctaUrl: "/disponibilidad"
  },
  { 
    src: imgParque, 
    alt: "Parque y Áreas Verdes",
    title: "Descanso Absoluto",
    description: "Disfruta de espacios verdes diseñados para tu desconexión total. Calidez, confort y silencio.",
    badge: "CONFORT & RELAX",
    ctaText: "Ver Cabañas",
    ctaUrl: "/disponibilidad"
  },
  { 
    src: imgCalle, 
    alt: "Entorno de Valdivia",
    title: "Aventuras Inolvidables",
    description: "Navegación, cultura y lo mejor de la ciudad de Valdivia a pasos de tu habitación.",
    badge: "TURISMO LOCAL",
    ctaText: "Ver Experiencias",
    ctaUrl: "/servicios/experiencias"
  },
];

// =========================================================
// 3. GALERÍA
// =========================================================
const GALERIA = [
  { src: imgCabana1, alt: "Cabaña El Roble" },
  { src: imgExperiencias, alt: "Rutas de Trekking" },
  { src: imgSelva, alt: "Selva Valdiviana" },
  { src: imgPuente, alt: "Puente Pedro de Valdivia" },
  { src: imgCascada, alt: "Cascadas Escondidas" },
  { src: imgPanoramica, alt: "Panorámica Río Calle-Calle" },
];

function fmt(d) {
  return d.toISOString().slice(0, 10);
}

export default function HomePublic() {
  const nav = useNavigate();

  const hoy = useMemo(() => new Date(), []);
  const maniana = useMemo(() => { const d = new Date(hoy); d.setDate(d.getDate() + 1); return d; }, [hoy]);
  const dosDias = useMemo(() => { const d = new Date(hoy); d.setDate(d.getDate() + 2); return d; }, [hoy]);

  const [desde, setDesde] = useState(fmt(hoy));
  const [hasta, setHasta] = useState(fmt(dosDias));
  const [huespedes, setHuespedes] = useState(2);
  const [err, setErr] = useState("");

  useEffect(() => {
    const last = localStorage.getItem("busqueda_lodge");
    if (last) { try { const { desde, hasta, huespedes } = JSON.parse(last); if(desde) setDesde(desde); if(hasta) setHasta(hasta); if(huespedes) setHuespedes(Number(huespedes)); } catch {} }
  }, []);

  function validar() {
    if (!desde || !hasta) return "Debes seleccionar ambas fechas.";
    if (huespedes < 1) return "Los huéspedes deben ser al menos 1.";
    if (new Date(desde) >= new Date(hasta)) return "La fecha de salida debe ser posterior a la de entrada.";
    return "";
  }

  function buscar(e) {
    e.preventDefault();
    const msg = validar();
    if (msg) { setErr(msg); return; }
    setErr("");
    localStorage.setItem("busqueda_lodge", JSON.stringify({ desde, hasta, huespedes }));
    const qs = new URLSearchParams({ desde, hasta, huespedes: String(huespedes) }).toString();
    nav(`/disponibilidad?${qs}`);
  }

  function onDesdeChange(v) {
    setDesde(v);
    const d1 = new Date(v); const d2 = new Date(v); d2.setDate(d2.getDate() + 1);
    if (new Date(hasta) <= d1) setHasta(fmt(d2));
  }

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col">
      <Header />

      {/* 1. HERO CAROUSEL */}
      <HeroCarousel slides={BANNERS} />

      {/* 2. CONTENIDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-4 pb-16 w-full flex-grow">
        
        <div className="space-y-16"> 
          
          {/* BUSCADOR */}
          <section className="bg-white border rounded-3xl p-8 shadow-lg mt-12 relative z-20 max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">
              Reserva tu cabaña ideal 
            </h2>

            {err && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 text-center">
                {err}
              </div>
            )}

            <form onSubmit={buscar} className="grid md:grid-cols-4 gap-6 items-end">
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2 uppercase tracking-wide">Llegada</label>
                <input type="date" required min={fmt(hoy)} value={desde} onChange={(e) => onDesdeChange(e.target.value)} className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 font-medium" />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2 uppercase tracking-wide">Salida</label>
                <input type="date" required min={fmt(maniana)} value={hasta} onChange={(e) => setHasta(e.target.value)} className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 font-medium" />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2 uppercase tracking-wide">Huéspedes</label>
                <input type="number" min={1} required value={huespedes} onChange={(e) => setHuespedes(Number(e.target.value || 1))} className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 font-medium" />
              </div>

              <button type="submit" className="h-[50px] rounded-xl bg-emerald-700 text-white font-bold hover:bg-emerald-800 transition-all shadow-md text-lg transform hover:-translate-y-0.5">
                Buscar
              </button>
            </form>
          </section>

          {/* OFERTAS */}
          <section className="grid md:grid-cols-2 gap-8">
            <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all cursor-default group relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">Pack 5 noches</h3>
                <p className="text-slate-600 mt-2 leading-relaxed text-lg">Reserva 5 noches y obtén un <span className="font-bold text-emerald-600">15% de descuento</span> inmediato en el total de tu estadía.</p>
              </div>
              <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all cursor-default group relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">Temporada baja</h3>
                <p className="text-slate-600 mt-2 leading-relaxed text-lg">Disfruta del sur sin aglomeraciones. Estadía con <span className="font-bold text-emerald-600">desayuno incluido</span> + piscina climatizada.</p>
              </div>
              <div className="absolute right-0 top-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
            </div>
          </section>

          {/* GALERÍA */}
          <section id="explora" className="space-y-8 text-center">
             <div>
                <h2 className="text-3xl font-extrabold text-slate-800">Explora el entorno</h2>
                <p className="text-slate-600 mt-3 text-lg max-w-2xl mx-auto">Naturaleza, descanso y comodidad. Así se vive la experiencia en el sur de Chile.</p>
             </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {GALERIA.map((img, i) => (
                <figure key={i} className="rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 group cursor-pointer border border-slate-100">
                  <div className="overflow-hidden h-72">
                      <img 
                        src={img.src} 
                        alt={img.alt} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      />
                  </div>
                  <figcaption className="bg-white px-6 py-4 text-base font-bold text-slate-700 text-left">
                    {img.alt}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>

        </div>
      </main>

      {/* 3. RESEÑAS */}
      <Reviews />

      {/* 3.5 SECCIÓN SOBRE NOSOTROS (Imagen Actualizada) */}
      <section className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            
            {/* Texto */}
            <div>
              <div className="inline-block bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                Nuestra Historia
              </div>
              <h2 className="text-4xl font-extrabold text-slate-900 mb-6 leading-tight">
                Más que un alojamiento, <br/> una tradición familiar en el sur.
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed mb-6">
                "Bosque y Río Lodge" nació hace 8 años como un sueño familiar. Nuestro objetivo siempre ha sido compartir la magia de la Región de Los Ríos, ofreciendo un refugio donde la comodidad moderna se encuentra con la naturaleza virgen.
              </p>
              <p className="text-lg text-slate-600 leading-relaxed mb-8">
                Cada cabaña ha sido construida pensando en el respeto por el entorno, integrando madera nativa y vistas privilegiadas para que tu desconexión sea total.
              </p>
              
              {/* Estadísticas */}
              <div className="grid grid-cols-3 gap-6 border-t border-slate-200 pt-8">
                <div>
                  <p className="text-4xl font-extrabold text-emerald-600">8</p>
                  <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mt-1">Años de experiencia</p>
                </div>
                <div>
                  <p className="text-4xl font-extrabold text-emerald-600">12</p>
                  <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mt-1">Cabañas Premium</p>
                </div>
                <div>
                  <p className="text-4xl font-extrabold text-emerald-600">+5k</p>
                  <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mt-1">Huéspedes Felices</p>
                </div>
              </div>
            </div>

            {/* Imagen: CASTILLO DE NIEBLA */}
            <div className="relative">
              <div className="absolute -inset-4 bg-emerald-100/50 rounded-3xl transform rotate-3"></div>
              <img 
                src={imgNiebla} // Aquí usamos la nueva imagen
                alt="Castillo de Niebla - Nuestra Historia" 
                className="relative rounded-2xl shadow-2xl w-full h-[500px] object-cover transform -rotate-2 hover:rotate-0 transition-transform duration-500" 
              />
            </div>

          </div>
        </div>
      </section>

      {/* 4. NEWSLETTER PREMIUM (Fondo Cascada) */}
      <section className="relative w-full py-24 bg-slate-900 overflow-hidden">
        {/* Imagen de Fondo: Cascada */}
        <div className="absolute inset-0">
          <img 
            src={imgCascada} 
            alt="Cascada Valdivia" 
            className="w-full h-full object-cover" 
          />
          {/* Overlay oscuro para legibilidad */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950 via-emerald-900/95 to-emerald-900/80"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center justify-between gap-12">
          
          <div className="max-w-2xl text-left">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
              Únete al Newsletter
            </h2>
            <p className="text-lg text-emerald-100/90 font-medium leading-relaxed">
              Y obtén un <span className="text-white font-bold decoration-amber-400 underline decoration-4 underline-offset-4">10% de descuento</span> en tu primera reserva, además recibe ofertas y avisos de temporada. Obtén acceso a preventas exclusivas.
            </p>
          </div>

          <div className="w-full max-w-md">
            <form className="flex flex-col gap-4">
              <label className="sr-only">Correo electrónico</label>
              <div className="flex flex-col gap-4">
                  <input 
                    type="email" 
                    placeholder="Correo electrónico" 
                    className="w-full px-6 py-4 rounded-xl bg-emerald-950/60 border border-emerald-700 text-white placeholder-emerald-400/70 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all backdrop-blur-sm"
                  />
                  <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-emerald-950 font-bold uppercase tracking-wider hover:bg-amber-400 transition-colors shadow-lg flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    Suscríbete
                  </button>
              </div>
              <p className="text-xs text-emerald-400/60 mt-2 text-center lg:text-left">
                Al suscribirte aceptas recibir novedades de Bosque y Río Lodge.
              </p>
            </form>
          </div>

        </div>
      </section>

      {/* 5. FOOTER */}
      <Footer />
    </div>
  );
}