import Header from "../components/Header";
import Footer from "../components/Footer";

// =========================================================
// 1. IMPORTACIÓN DE IMÁGENES LOCALES
// =========================================================
import imgRecorrido from "../assets/img/recorrido-valdivia.jpg";
import imgCerveza from "../assets/img/ruta-cerveza.jpg";
import imgOncol from "../assets/img/parque-oncol.jpg";
import imgAves from "../assets/img/aves.jpg";

// =========================================================
// 2. CATÁLOGO DE TOURS
// =========================================================
const TOURS = [
  {
    id: 1,
    titulo: "Navegación Ríos Valdivia y Calle-Calle",
    // Descripción contextualizada a la navegación
    descripcion: "Navega por las aguas tranquilas de los ríos que rodean la ciudad. Disfruta de una vista privilegiada de la costanera, los puentes históricos y la exuberante vegetación ribereña desde una perspectiva única.",
    duracion: "2 Horas",
    precio: 15000,
    categoria: "navegacion",
    imagen: imgRecorrido, // Imagen local
    etiqueta: "Más vendido",
  },
  {
    id: 2,
    titulo: "Ruta de la Cerveza Artesanal",
    // Descripción contextualizada a la cerveza
    descripcion: "Sumérgete en la tradición cervecera de la región. Visitaremos las fábricas más icónicas para conocer el proceso de elaboración y degustar sus variedades premiadas directamente del barril.",
    duracion: "4 Horas",
    precio: 35000,
    categoria: "cerveza",
    imagen: imgCerveza, // Imagen local
    etiqueta: "Degustación incluida",
  },
  {
    id: 3,
    titulo: "Expedición Parque Oncol",
    // Descripción contextualizada al parque y selva
    descripcion: "Adéntrate en el corazón de la Selva Valdiviana costera. Recorre senderos de bosque nativo milenario hasta llegar a miradores con vistas panorámicas al océano Pacífico.",
    duracion: "Full Day",
    precio: 45000,
    categoria: "naturaleza",
    imagen: imgOncol, // Imagen local
    etiqueta: "Transporte incluido",
  },
  {
    id: 4,
    titulo: "Avistamiento de Aves (Birdwatching)",
    // Descripción contextualizada a las aves/humedales
    descripcion: "Explora los humedales del Río Cruces, un santuario de la naturaleza. Avista Cisnes de Cuello Negro, Taguas, Garzas y otras especies en su hábitat protegido y silencioso.",
    duracion: "3 Horas",
    precio: 25000,
    categoria: "aves",
    imagen: imgAves, // Imagen local
    etiqueta: "Guía experto",
  },
];

const CATEGORIAS_LABELS = {
  navegacion: "Navegación / Ríos",
  cerveza: "Cervecerías",
  naturaleza: "Parques / Trekking",
  aves: "Avistamiento de Aves",
};

export default function Experiencias() {
  return (
    <div className="min-h-screen bg-blue-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 pt-12 pb-20">
        
        <div className="space-y-12">
          
          {/* Encabezado Centrado */}
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-extrabold text-slate-800 mb-4">
              Experiencias Inolvidables 
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              Complementa tu estadía con lo mejor de la zona. Desde los bosques y ríos Valdivianos hasta la mejor cerveza artesanal.
            </p>
          </div>

          {/* GRILLA DE RESULTADOS */}
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 animate-fade-in-up"> 
            {TOURS.map((tour) => (
              <div key={tour.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col group">
                {/* Imagen */}
                <div className="h-64 overflow-hidden relative">
                  <img 
                      src={tour.imagen} 
                      alt={tour.titulo} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  {tour.etiqueta && (
                      <div className="absolute top-4 right-4 bg-yellow-400 text-slate-900 text-xs font-bold px-3 py-1 rounded-full shadow-md uppercase tracking-wide">
                          {tour.etiqueta}
                      </div>
                  )}
                </div>

                {/* Contenido */}
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                          {CATEGORIAS_LABELS[tour.categoria]}
                      </span>
                      <span className="flex items-center text-xs text-slate-500 font-medium">
                          ⏱ {tour.duracion}
                      </span>
                  </div>

                  <h3 className="text-2xl font-bold text-slate-800 mb-3 leading-tight">
                      {tour.titulo}
                  </h3>
                  
                  <p className="text-slate-600 text-sm mb-6 flex-1 leading-relaxed">
                      {tour.descripcion}
                  </p>

                  <div className="mt-auto border-t border-slate-100 pt-5 flex items-center justify-between">
                      <div>
                          <p className="text-xs text-slate-500 uppercase font-bold">Por persona</p>
                          <p className="text-2xl font-bold text-slate-800">
                              ${new Intl.NumberFormat('es-CL').format(tour.precio)}
                          </p>
                      </div>
                      <button className="bg-emerald-600 text-white hover:bg-emerald-700 font-bold py-2.5 px-6 rounded-lg transition-colors shadow-sm">
                          Reservar
                      </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}