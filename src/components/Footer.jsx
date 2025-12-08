import { Link } from "react-router-dom";
import logoImg from "../assets/logo.png"; 

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    // FOOTER VERDE OSCURO
    <footer className="bg-emerald-950 border-t border-emerald-900 pt-16 pb-8 text-sm text-emerald-100/80">
      <div className="max-w-7xl mx-auto px-4">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* MARCA */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3 mb-4 group">
              {/* LOGO REDONDO IGUAL AL HEADER */}
              <div className="relative overflow-hidden rounded-full border-2 border-emerald-800 shadow-md group-hover:border-emerald-600 transition-colors bg-emerald-900">
                <img src={logoImg} alt="Logo" className="h-10 w-10 object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-white text-lg leading-tight">Bosque y Río</span>
                <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">Lodge</span>
              </div>
            </Link>
            <p className="leading-relaxed text-emerald-200/70">
              Conectamos la comodidad con la naturaleza virgen de la selva valdiviana. Tu refugio perfecto en el sur de Chile.
            </p>
            
            {/* Redes Sociales (Iconos claros) */}
            <div className="flex gap-4 pt-2">
              <a href="#" className="p-2 bg-emerald-900 rounded-full hover:bg-emerald-800 text-emerald-100 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="#" className="p-2 bg-emerald-900 rounded-full hover:bg-emerald-800 text-emerald-100 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="#" className="p-2 bg-emerald-900 rounded-full hover:bg-emerald-800 text-emerald-100 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
              </a>
            </div>
          </div>

          {/* EXPLORAR */}
          <div>
            <h3 className="font-bold text-white mb-4 uppercase tracking-wider text-xs">Explorar</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="hover:text-white transition-colors">Inicio</Link></li>
              <li><Link to="/disponibilidad" className="hover:text-white transition-colors">Buscar Disponibilidad</Link></li>
              <li><Link to="/cabanas" className="hover:text-white transition-colors">Nuestras Cabañas</Link></li>
            </ul>
          </div>

          {/* SERVICIOS */}
          <div>
            <h3 className="font-bold text-white mb-4 uppercase tracking-wider text-xs">Servicios</h3>
            <ul className="space-y-3">
              <li><Link to="/servicios/transporte" className="hover:text-white transition-colors">Transporte Privado</Link></li>
              <li><Link to="/servicios/experiencias" className="hover:text-white transition-colors">Tours y Experiencias</Link></li>
              <li><Link to="/servicios/ventas" className="hover:text-white transition-colors">Ventas y Amenities</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Políticas de Cancelación</a></li>
            </ul>
          </div>

          {/* CONTACTO */}
          <div>
            <h3 className="font-bold text-white mb-4 uppercase tracking-wider text-xs">Contacto</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="text-xl">📍</span>
                <span>Ruta T-350 Km 12<br />Valdivia, Región de Los Ríos<br />Chile</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-xl">📞</span>
                <a href="tel:+56912345678" className="hover:text-white transition-colors">+56 9 1234 5678</a>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-xl">✉️</span>
                <a href="mailto:reservas@bosqueyrio.cl" className="hover:text-white transition-colors">reservas@bosqueyrio.cl</a>
              </li>
            </ul>
          </div>

        </div>

        {/* COPYRIGHT */}
        <div className="border-t border-emerald-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-emerald-300/60">
          <p>© {currentYear} Bosque y Río Lodge. Todos los derechos reservados.</p>
          
          <div className="flex items-center gap-1">
            <span>Hecho con</span>
            <span className="text-red-400 animate-pulse">❤</span>
            <span>en el Sur de Chile</span>
          </div>
        </div>

      </div>
    </footer>
  );
}