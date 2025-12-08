import Header from "../components/Header";
import Footer from "../components/Footer"; 

// =========================================================
// 1. IMPORTACIÓN DE IMÁGENES LOCALES
// =========================================================
// Asegúrate de tener estos archivos en tu carpeta img
import imgCajaBienvenida from "../assets/img/caja-bienvenida.jpg";
import imgPackDulzura from "../assets/img/pack-dulzura.jpg";
import imgDesayuno from "../assets/img/desayuno.jpg"; // Nuevo producto
import imgLena from "../assets/img/lena.jpg";
import imgCervezas from "../assets/img/cervezas-locales.jpg";

// =========================================================
// 2. CATÁLOGO DE PRODUCTOS
// =========================================================
const PRODUCTOS = [
  { 
    id: 1, 
    nombre: "Canasta Bienvenida 'Valdivia'", 
    descripcion: "La selección perfecta para iniciar tu estadía. Descorcha un buen Cabernet Sauvignon, comparte un picoteo y relájate.", 
    precio: 20000, 
    imagen: imgCajaBienvenida, // Imagen local
    etiqueta: "Favorito", 
    categoria: "Canasta" 
  },
  { 
    id: 2, 
    nombre: "Pack Dulzura Sureña", 
    descripcion: "Para los amantes del dulce. Incluye Mermelada casera (Frutos rojos o Rosa Mosqueta), Miel de ulmo y galletas artesanales.", 
    precio: 18000, 
    imagen: imgPackDulzura, // Imagen local
    etiqueta: "Dulce", 
    categoria: "Canasta" 
  },
  { 
    id: 3, 
    nombre: "Caja Desayuno", // Nuevo producto solicitado
    descripcion: "Despierta con energía. Pan de campo recién horneado, huevos de campo, jugo natural, café de grano y acompañamientos salados/dulces.", 
    precio: 15000, 
    imagen: imgDesayuno, // Imagen local
    etiqueta: "Mañanero", 
    categoria: "Desayuno" 
  },
  { 
    id: 4, 
    nombre: "Saco de Leña Seca (20kg)", 
    descripcion: "Leña certificada y seca, ideal para mantener la calidez de tu cabaña en las noches frías. Incluye astillas para encendido fácil.", 
    precio: 13000, 
    imagen: imgLena, // Imagen local
    etiqueta: "Esencial", 
    categoria: "Amenity" 
  },
  { 
    id: 5, 
    nombre: "Six Pack Cervezas Locales", 
    descripcion: "Degustación de las mejores cervecerías de la región de Los Ríos. Mix de variedades para disfrutar en la terraza.", 
    precio: 8000, 
    imagen: imgCervezas, // Imagen local
    etiqueta: "+18 Años", 
    categoria: "Bebida" 
  },
];

export default function Ventas() {
  return (
    <div className="min-h-screen bg-blue-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 pt-12 pb-20">
        
        <div className="space-y-12">
          
          {/* Encabezado */}
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-extrabold text-slate-800 mb-4">
              Sabores del Sur y Amenities 
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              Llevamos lo mejor de la producción local directamente a tu cabaña. Disfruta sin salir de tu descanso.
            </p>
          </div>

          {/* Grilla de Productos */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-up">
            {PRODUCTOS.map((prod) => (
              <div key={prod.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col group">
                  
                  {/* Imagen */}
                  <div className="h-64 overflow-hidden relative">
                    <img 
                        src={prod.imagen} 
                        alt={prod.nombre} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                    {prod.etiqueta && (
                        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur text-slate-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm border border-slate-100">
                            {prod.etiqueta}
                        </div>
                    )}
                  </div>

                  {/* Contenido */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                            {prod.categoria}
                        </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-800 mb-3">
                        {prod.nombre}
                    </h3>
                    
                    <p className="text-slate-600 text-sm mb-6 flex-1 leading-relaxed">
                        {prod.descripcion}
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-5 border-t border-slate-50">
                        <p className="text-2xl font-bold text-slate-800">
                            ${new Intl.NumberFormat('es-CL').format(prod.precio)}
                        </p>
                        
                        <button className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 px-5 rounded-lg transition-colors text-sm shadow-sm">
                           <span>Solicitar</span>
                           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                        </button>
                    </div>
                  </div>
              </div>
            ))}
          </div>

           {/* Banner Informativo */}
           <div className="max-w-4xl mx-auto bg-amber-50 border border-amber-100 rounded-2xl p-8 flex items-start gap-5 shadow-sm">
              <span className="text-4xl">ℹ️</span>
              <div>
                  <h4 className="font-bold text-amber-900 text-lg">¿Cómo funciona?</h4>
                  <p className="text-amber-800 mt-2 text-base">
                      Puedes solicitar estos productos antes de tu llegada o durante tu estadía. 
                      El cargo se agregará a tu cuenta final o puedes pagar al momento de la entrega.
                  </p>
              </div>
           </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}