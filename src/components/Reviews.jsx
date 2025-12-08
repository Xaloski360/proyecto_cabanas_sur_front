import { useRef, useState, useEffect } from "react";

const TESTIMONIOS = [
  {
    id: 1,
    nombre: "Fernanda Lagos",
    origen: "Santiago",
    rating: 5,
    texto: "El lugar es soñado. Despertar con el sonido del río no tiene precio. La cabaña estaba impecable y la atención de don Juan fue un 7. Volveremos seguro."
  },
  {
    id: 2,
    nombre: "Carlos Munizaga",
    origen: "Concepción",
    rating: 5,
    texto: "Increíble experiencia. Hicimos el tour de cervecerías y fue muy completo. Las tinajas calientes en la noche son lo mejor para relajarse bajo las estrellas."
  },
  {
    id: 3,
    nombre: "Andrea Riquelme",
    origen: "Viña del Mar",
    rating: 4,
    texto: "Muy lindo entorno, mucha paz. Ideal para desconectarse de la ciudad. El internet funcionaba bien para lo necesario, pero la idea es no usarlo y disfrutar el bosque."
  },
  {
    id: 4,
    nombre: "Felipe Osorio",
    origen: "Temuco",
    rating: 5,
    texto: "La calidad de las instalaciones me sorprendió. Todo de madera nativa, muy acogedor. El servicio de transporte desde el aeropuerto funcionó perfecto, muy puntuales."
  },
  {
    id: 5,
    nombre: "Mariana Silva",
    origen: "Argentina",
    rating: 5,
    texto: "Un paraíso escondido. La vista desde la terraza es impagable. Recomiendo totalmente pedir la canasta de desayuno con productos locales, el pan amasado es único."
  },
  {
    id: 6,
    nombre: "Jorge Valenzuela",
    origen: "La Serena",
    rating: 5,
    texto: "Fuimos en época de lluvia y la experiencia fue mágica. Ver llover desde el ventanal junto a la estufa a leña es impagable. Muy bien equipada la cocina."
  },
  {
    id: 7,
    nombre: "Valentina Paz",
    origen: "Valdivia",
    rating: 5,
    texto: "Vivo cerca pero queríamos una escapada romántica. Superó las expectativas. La privacidad de las cabañas es excelente, no se escucha a los vecinos."
  },
  {
    id: 8,
    nombre: "Ricardo Arancibia",
    origen: "Santiago",
    rating: 4,
    texto: "El entorno natural es sobrecogedor. Hicimos el trekking al Parque Oncol y queda muy cerca. Ideal para ir en familia y que los niños conecten con la naturaleza."
  }
];

export default function Reviews() {
  const scrollRef = useRef(null);
  const [progress, setProgress] = useState(0);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 450;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = () => {
    const element = scrollRef.current;
    if (element) {
      const windowScroll = element.scrollLeft;
      const totalWidth = element.scrollWidth - element.clientWidth;
      if (totalWidth === 0) return setProgress(0);
      
      const percentage = (windowScroll / totalWidth) * 100;
      setProgress(percentage);
    }
  };

  useEffect(() => {
    const element = scrollRef.current;
    if (element) {
      element.addEventListener('scroll', handleScroll);
      return () => element.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <section className="w-full bg-white py-24 border-t border-slate-100">
      
      {/* Título y Subtítulo */}
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Testimonios</h2>
        <p className="text-slate-500 mt-3 text-lg">Lo que dicen quienes ya vivieron la experiencia.</p>
      </div>

      {/* Carrusel */}
      <div className="w-full overflow-hidden">
        <div 
          ref={scrollRef}
          // CLAVE: El padding izquierdo (pl) usa un cálculo para alinearse con el max-w-7xl del título
          // px-6 en móvil, y en desktop calcula el margen para alinear visualmente
          className="flex gap-8 overflow-x-auto snap-x snap-mandatory pb-8 pl-6 md:pl-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))] pr-6 hide-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {TESTIMONIOS.map((review) => (
            <div 
              key={review.id} 
              className="min-w-[340px] md:min-w-[450px] bg-white border border-slate-200 p-10 rounded-3xl shadow-sm snap-start flex flex-col h-auto select-none transition-transform hover:-translate-y-1"
            >
              {/* Estrellas */}
              <div className="flex gap-1.5 mb-6">
                {[...Array(5)].map((_, i) => (
                  <svg 
                    key={i} 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="22" 
                    height="22" 
                    viewBox="0 0 24 24" 
                    fill={i < review.rating ? "#F59E0B" : "#E2E8F0"} 
                    stroke="none"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                ))}
              </div>

              {/* Texto */}
              <p className="text-slate-700 text-lg leading-relaxed mb-8 flex-1 relative font-medium">
                <span className="text-6xl text-slate-100 absolute -top-8 -left-5 font-serif select-none pointer-events-none">“</span>
                {review.texto}
              </p>

              {/* Usuario */}
              <div className="flex items-center gap-4 mt-auto pt-6 border-t border-slate-100">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xl border border-emerald-100">
                  {review.nombre.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-base">{review.nombre}</p>
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-wider">{review.origen}</p>
                </div>
              </div>
            </div>
          ))}
          
          <div className="min-w-[1px]"></div>
        </div>
      </div>

      {/* CONTROLES INFERIORES */}
      <div className="max-w-7xl mx-auto px-6 mt-8 flex flex-row items-center gap-6">
        
        {/* Barra de Progreso (Ahora ocupa todo el espacio restante con flex-1) */}
        <div className="flex-1 h-0.5 bg-slate-200 rounded-full overflow-hidden relative">
          <div 
            className="absolute top-0 left-0 h-full bg-emerald-600 transition-all duration-300 ease-out rounded-full"
            style={{ width: `${Math.max(15, progress)}%` }} // Mínimo 15% visible
          />
        </div>

        {/* Botones (Alineados a la derecha de la barra) */}
        <div className="flex gap-4 shrink-0">
          <button 
            onClick={() => scroll('left')}
            className="w-12 h-12 rounded-full border border-slate-300 text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all flex items-center justify-center active:scale-95"
            aria-label="Anterior"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <button 
            onClick={() => scroll('right')}
            className="w-12 h-12 rounded-full border border-slate-300 text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all flex items-center justify-center active:scale-95"
            aria-label="Siguiente"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>

      </div>

    </section>
  );
}