import { Link } from "react-router-dom";

export default function Sidebar() {
  const item = "block px-3 py-2 rounded hover:bg-blue-50 text-slate-700";
  return (
    <aside className="hidden lg:block lg:sticky lg:top-16 self-start w-64 shrink-0">
      <div className="border rounded-xl bg-white p-3">
        <p className="text-sm font-semibold text-slate-600 px-2 mb-2">Panel</p>
        <nav className="space-y-1">
          <Link className={item} to="/disponibilidad">Buscar disponibilidad</Link>
          <Link className={item} to="/pruebas">Demo API</Link>
          <a className={item} href="#explora">Explora</a>
          <a className={item} href="#contacto">Contacto</a>
        </nav>
      </div>
    </aside>
  );
}
