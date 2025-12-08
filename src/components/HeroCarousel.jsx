import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";

export default function HeroCarousel({ slides = [] }) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  if (!slides || slides.length === 0) return null;

  return (
    // ELIMINADO: rounded-2xl, shadow-2xl (Para que sea full width limpio)
    <div 
      className="relative w-full h-[500px] md:h-[650px] overflow-hidden group bg-slate-900"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <img
            src={slide.src}
            alt={slide.alt || "Bosque y Río Lodge"}
            className="w-full h-full object-cover transition-transform duration-[10000ms] ease-linear"
            style={{ transform: index === current ? "scale(110%)" : "scale(100%)" }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-90" />

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 md:px-20 z-20">
            <div 
              className={`transition-all duration-1000 delay-300 transform flex flex-col items-center ${
                index === current ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
            >
              {slide.badge && (
                <span className="inline-block py-1 px-3 mb-6 rounded-full bg-emerald-600/90 text-white text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase shadow-lg backdrop-blur-sm border border-emerald-400/30">
                  {slide.badge}
                </span>
              )}
              
              <h2 className="text-4xl md:text-7xl font-extrabold text-white mb-6 drop-shadow-lg tracking-tight leading-none max-w-5xl">
                {slide.title}
              </h2>
              
              <p className="text-lg md:text-2xl text-white mb-10 max-w-2xl mx-auto drop-shadow-md font-light leading-relaxed">
                {slide.description}
              </p>

              {slide.ctaUrl && (
                <Link
                  to={slide.ctaUrl}
                  className="group/btn relative inline-flex items-center gap-2 bg-white text-emerald-900 hover:bg-emerald-50 font-bold py-4 px-10 rounded-full transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                >
                  <span>{slide.ctaText || "Ver Detalles"}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover/btn:translate-x-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </Link>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Flechas */}
      <button onClick={prevSlide} className="hidden md:flex absolute top-1/2 left-8 -translate-y-1/2 z-30 p-4 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 hover:scale-110 border border-white/10">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
      </button>

      <button onClick={nextSlide} className="hidden md:flex absolute top-1/2 right-8 -translate-y-1/2 z-30 p-4 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 hover:scale-110 border border-white/10">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
      </button>

      {/* Indicadores */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3 z-30">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`transition-all duration-500 rounded-full shadow-lg border border-white/20 ${
              i === current ? "w-12 h-2 bg-white" : "w-2 h-2 bg-white/40 hover:bg-white/80"
            }`}
            aria-label={`Ir a diapositiva ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}