import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import MiCuentaButton from "./MiCuentaButton";
import { getToken, clearToken, logoutUser } from "../api";
import logoImg from "../assets/logo.png"; 

// ==========================================
// IMPORTAMOS LAS IMÁGENES PARA LOS MENÚS
// ==========================================

// Para Servicios (Se mantienen igual)
import imgTransporte from "../assets/img/transporte.jpg"; 
import imgExperiencias from "../assets/img/experiencias.jpg";
import imgVentas from "../assets/img/ventas-amenities.jpg";

// Para Informaciones (NUEVAS IMÁGENES)
import imgPoliticas from "../assets/img/botanico-valdivia.jpg"; 
import imgFaq from "../assets/img/bosque-curinanco.jpg";

export default function Header() {
  const headerClasses = "sticky top-0 z-40 bg-emerald-950 border-b border-emerald-900 shadow-lg transition-all";
  
  const linkBase = "px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer";
  const linkInactive = "text-emerald-100/80 hover:text-white";
  const linkActive = "text-white font-bold"; 

  const activeClass = ({ isActive }) =>
    isActive ? `${linkBase} ${linkActive}` : `${linkBase} ${linkInactive}`;

  const navigate = useNavigate();
  const location = useLocation();

  const [isAuth, setIsAuth] = useState(() => !!getToken());
  
  // ESTADOS PARA LAS IMÁGENES DINÁMICAS
  const [activeServiceImage, setActiveServiceImage] = useState(imgTransporte);
  const [activeInfoImage, setActiveInfoImage] = useState(imgPoliticas);

  useEffect(() => {
    const handler = () => setIsAuth(!!getToken());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const currentUrl = location.pathname + location.search;
  const registerHref = `/register?redirect=${encodeURIComponent(currentUrl)}`;
  const loginHref = `/login?redirect=${encodeURIComponent(currentUrl)}`;

  async function logout() {
    try {
      await logoutUser();
    } catch (e) {
      console.error(e);
    } finally {
      clearToken();
      localStorage.removeItem("user_id");
      localStorage.removeItem("user_roles");
      setIsAuth(false);
      navigate("/", { replace: true });
    }
  }

  // DATA: SERVICIOS
  const services = [
    {
      to: "/servicios/transporte",
      title: "Transporte Privado",
      desc: "Traslados aeropuerto y terminal.",
      img: imgTransporte,
      icon: (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>)
    },
    {
      to: "/servicios/experiencias",
      title: "Tours y Experiencias",
      desc: "Aventuras, ríos y naturaleza.",
      img: imgExperiencias,
      icon: (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M9 3v4"/><path d="M14.99 3v4"/><path d="m13.41 4.59 5.66 5.66"/><path d="m12 6.5 8 8"/></svg>)
    },
    {
      to: "/servicios/ventas",
      title: "Ventas y Amenities",
      desc: "Canastas locales y leña.",
      img: imgVentas,
      icon: (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>)
    },
  ];

  // DATA: INFORMACIONES
  const infoItems = [
    {
      to: "/informacion/politicas",
      title: "Políticas de Cancelación",
      desc: "Conoce nuestras condiciones de reserva y estadía.",
      img: imgPoliticas, // Ahora usa botanico-valdivia
      icon: (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>)
    },
    {
      to: "/informacion/faq",
      title: "Preguntas Frecuentes",
      desc: "Resolvemos tus dudas sobre horarios, accesos y más.",
      img: imgFaq, // Ahora usa bosque-curinanco
      icon: (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>)
    },
  ];

  return (
    <header className={headerClasses}>
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative overflow-hidden rounded-full border-2 border-emerald-800 shadow-md group-hover:border-emerald-600 transition-colors bg-emerald-900">
            <img src={logoImg} alt="Logo Bosque y Río" className="h-12 w-12 object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-emerald-50 text-lg leading-tight tracking-tight group-hover:text-white transition-colors">
              Bosque y Río
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-400 font-semibold group-hover:text-emerald-300">
              Lodge
            </span>
          </div>
        </Link>

        {/* NAV */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/" className={activeClass}>
            Inicio
          </NavLink>
          
          <NavLink to="/disponibilidad" className={activeClass}>
            Cabañas
          </NavLink>

          {/* 1. MEGA MENU SERVICIOS */}
          <div className="static group"> 
            <button className={`${linkBase} ${linkInactive} flex items-center gap-1 group-hover:text-white`}>
              Servicios
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:rotate-180 opacity-70">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {/* CONTENEDOR SERVICIOS */}
            <div className="fixed left-0 top-20 w-full bg-emerald-950 border-t border-emerald-800 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform -translate-y-2 group-hover:translate-y-0 z-50">
              <div className="max-w-7xl mx-auto flex h-[350px]">
                
                {/* LISTA */}
                <div className="w-1/3 py-8 pr-8 border-r border-emerald-900">
                  <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6 px-4">Nuestros Servicios</p>
                  <div className="flex flex-col gap-2">
                    {services.map((item, idx) => (
                      <Link 
                        key={idx}
                        to={item.to}
                        onMouseEnter={() => setActiveServiceImage(item.img)}
                        className="flex items-center gap-4 p-4 rounded-xl hover:bg-emerald-900 transition-colors group/item"
                      >
                        <div className="p-2 bg-emerald-900/50 text-emerald-300 rounded-lg group-hover/item:bg-emerald-800 group-hover/item:text-white transition-colors">
                          {item.icon}
                        </div>
                        <div>
                          <p className="font-bold text-emerald-50 text-lg group-hover/item:text-white">{item.title}</p>
                          <p className="text-sm text-emerald-300/60 group-hover/item:text-emerald-200">{item.desc}</p>
                        </div>
                        <div className="ml-auto opacity-0 group-hover/item:opacity-100 transform -translate-x-2 group-hover/item:translate-x-0 transition-all text-emerald-400">
                          →
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* IMAGEN */}
                <div className="w-2/3 p-4">
                  <div className="w-full h-full rounded-2xl overflow-hidden relative shadow-inner bg-emerald-900">
                    <img 
                      src={activeServiceImage} 
                      alt="Vista previa servicio" 
                      className="w-full h-full object-cover transition-opacity duration-500 animate-fade-in"
                      key={activeServiceImage} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 to-transparent"></div>
                    <div className="absolute bottom-6 left-6">
                      <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        Explora Servicios
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* 2. MEGA MENU INFORMACIONES */}
          <div className="static group ml-1">
            <button className={`${linkBase} ${linkInactive} flex items-center gap-1 group-hover:text-white`}>
              Informaciones
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:rotate-180 opacity-70">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {/* CONTENEDOR INFORMACIONES */}
            <div className="fixed left-0 top-20 w-full bg-emerald-950 border-t border-emerald-800 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform -translate-y-2 group-hover:translate-y-0 z-50">
              <div className="max-w-7xl mx-auto flex h-[350px]">
                
                {/* LISTA */}
                <div className="w-1/3 py-8 pr-8 border-r border-emerald-900">
                  <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6 px-4">Ayuda & Legal</p>
                  <div className="flex flex-col gap-2">
                    {infoItems.map((item, idx) => (
                      <Link 
                        key={idx}
                        to={item.to}
                        onMouseEnter={() => setActiveInfoImage(item.img)}
                        className="flex items-center gap-4 p-4 rounded-xl hover:bg-emerald-900 transition-colors group/item"
                      >
                        <div className="p-2 bg-emerald-900/50 text-emerald-300 rounded-lg group-hover/item:bg-emerald-800 group-hover/item:text-white transition-colors">
                          {item.icon}
                        </div>
                        <div>
                          <p className="font-bold text-emerald-50 text-lg group-hover/item:text-white">{item.title}</p>
                          <p className="text-sm text-emerald-300/60 group-hover/item:text-emerald-200">{item.desc}</p>
                        </div>
                        <div className="ml-auto opacity-0 group-hover/item:opacity-100 transform -translate-x-2 group-hover/item:translate-x-0 transition-all text-emerald-400">
                          →
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* IMAGEN */}
                <div className="w-2/3 p-4">
                  <div className="w-full h-full rounded-2xl overflow-hidden relative shadow-inner bg-emerald-900">
                    <img 
                      src={activeInfoImage} 
                      alt="Vista previa información" 
                      className="w-full h-full object-cover transition-opacity duration-500 animate-fade-in"
                      key={activeInfoImage} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 to-transparent"></div>
                    <div className="absolute bottom-6 left-6">
                      <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        Información Útil
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </nav>

        {/* ACCIONES */}
        <div className="flex items-center gap-3">
          {!isAuth && (
            <>
              <Link to={registerHref} className="hidden sm:block text-sm font-medium text-emerald-200 hover:text-white px-4 py-2 transition-colors">
                Registrarse
              </Link>
              <Link to={loginHref} className="text-sm font-bold px-5 py-2.5 rounded-lg bg-emerald-100 text-emerald-900 hover:bg-white hover:shadow-lg transition-all shadow-md border border-emerald-200/50">
                Iniciar sesión
              </Link>
            </>
          )}
          {isAuth && (
            <>
              <div className="text-emerald-100"><MiCuentaButton /></div>
              <button onClick={logout} className="text-sm font-medium text-emerald-300 hover:text-red-400 px-2 transition-colors" title="Cerrar sesión">
                Salir
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}